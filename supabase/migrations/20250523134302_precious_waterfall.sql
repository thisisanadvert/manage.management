-- Check if policies exist before creating them
DO $$ 
BEGIN
  -- Check for update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'buildings'
    AND policyname = 'building_admins_update_buildings'
  ) THEN
    -- Create policy for building administrators to update buildings
    CREATE POLICY "building_admins_update_buildings"
      ON buildings
      FOR UPDATE
      TO authenticated
      USING (is_building_admin(id))
      WITH CHECK (is_building_admin(id));
  END IF;

  -- Check for insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'buildings'
    AND policyname = 'building_admins_insert_buildings'
  ) THEN
    -- Create policy for authenticated users to create buildings
    CREATE POLICY "building_admins_insert_buildings"
      ON buildings
      FOR INSERT
      TO authenticated
      WITH CHECK (
        -- New users can create their first building
        (NOT EXISTS (
          SELECT 1 
          FROM building_users
          WHERE user_id = auth.uid()
        ))
        OR 
        -- Users with director roles can create buildings
        (EXISTS (
          SELECT 1 
          FROM auth.users
          WHERE id = auth.uid() 
          AND (raw_user_meta_data->>'role') = ANY (ARRAY['rtm-director', 'sof-director'])
        ))
      );
  END IF;
END $$;

-- Update the handle_new_user_signup function to run with SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  v_building_id uuid;
  v_user_metadata jsonb;
  v_role text;
  v_management_structure text;
BEGIN
  -- Skip if no role is provided
  IF NEW.raw_user_meta_data->>'role' IS NULL THEN
    RETURN NEW;
  END IF;

  v_role := NEW.raw_user_meta_data->>'role';
  
  -- Only create buildings for directors
  IF v_role IN ('rtm-director', 'sof-director') THEN
    -- Determine management structure based on role
    IF v_role = 'rtm-director' THEN
      v_management_structure := 'rtm';
    ELSE
      v_management_structure := 'share-of-freehold';
    END IF;
    
    -- Create the building
    INSERT INTO buildings (
      name,
      address,
      total_units,
      management_structure
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'buildingName', 'My Building'),
      COALESCE(NEW.raw_user_meta_data->>'buildingAddress', 'Address not set'),
      COALESCE((NEW.raw_user_meta_data->>'totalUnits')::integer, 1),
      v_management_structure
    )
    RETURNING id INTO v_building_id;

    -- Create building_users entry with proper role conversion
    BEGIN
      INSERT INTO building_users (
        building_id,
        user_id,
        role
      ) VALUES (
        v_building_id,
        NEW.id,
        v_role::user_role
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating building_users entry: %', SQLERRM;
    END;

    -- Update user metadata with building ID
    v_user_metadata := NEW.raw_user_meta_data || jsonb_build_object('buildingId', v_building_id);
    
    UPDATE auth.users
    SET raw_user_meta_data = v_user_metadata
    WHERE id = NEW.id;
    
    -- Create onboarding steps for the user
    BEGIN
      PERFORM create_user_onboarding_steps(
        NEW.id,
        v_building_id,
        v_role
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating onboarding steps: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only recreate the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user_signup();
  END IF;
END $$;