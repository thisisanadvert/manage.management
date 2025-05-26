-- Create a function to update building information
CREATE OR REPLACE FUNCTION update_building_information(
  p_building_id uuid,
  p_name text,
  p_address text,
  p_total_units integer,
  p_building_age integer,
  p_building_type text,
  p_service_charge_frequency text,
  p_management_structure text
)
RETURNS uuid AS $$
DECLARE
  v_building_id uuid;
BEGIN
  -- Update the building
  UPDATE buildings
  SET
    name = p_name,
    address = p_address,
    total_units = p_total_units,
    building_age = p_building_age,
    building_type = p_building_type,
    service_charge_frequency = p_service_charge_frequency,
    management_structure = p_management_structure,
    updated_at = NOW()
  WHERE id = p_building_id
  RETURNING id INTO v_building_id;

  -- Mark building setup step as complete
  UPDATE onboarding_steps
  SET 
    completed = true,
    completed_at = NOW()
  WHERE 
    building_id = p_building_id
    AND step_name = 'building';

  RETURN v_building_id;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user_signup function to store building_id in user metadata
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  v_building_id uuid;
  v_user_metadata jsonb;
BEGIN
  -- Create a building for the user if they're a director
  IF NEW.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director') THEN
    INSERT INTO buildings (
      name,
      address,
      total_units,
      management_structure
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'buildingName', 'My Building'),
      COALESCE(NEW.raw_user_meta_data->>'buildingAddress', 'Address not set'),
      1,
      CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'rtm-director' THEN 'rtm'
        ELSE 'share-of-freehold'
      END
    )
    RETURNING id INTO v_building_id;

    -- Create building_users entry
    INSERT INTO building_users (
      building_id,
      user_id,
      role
    ) VALUES (
      v_building_id,
      NEW.id,
      (NEW.raw_user_meta_data->>'role')::user_role
    );

    -- Create onboarding steps
    PERFORM create_user_onboarding_steps(
      NEW.id,
      v_building_id,
      NEW.raw_user_meta_data->>'role'
    );

    -- Update user metadata to include building_id
    v_user_metadata = NEW.raw_user_meta_data || jsonb_build_object('buildingId', v_building_id);
    
    UPDATE auth.users
    SET raw_user_meta_data = v_user_metadata
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- Create a function to update building details in onboarding
CREATE OR REPLACE FUNCTION update_building_details()
RETURNS trigger AS $$
BEGIN
  -- Mark the building step as complete
  UPDATE onboarding_steps
  SET 
    completed = true,
    completed_at = NOW()
  WHERE 
    building_id = NEW.id
    AND step_name = 'building';
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Conditionally create the trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_building_details') THEN
        CREATE TRIGGER update_building_details
        AFTER UPDATE ON buildings
        FOR EACH ROW
        EXECUTE FUNCTION update_building_details();
    END IF;
END$$;