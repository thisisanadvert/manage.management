-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "onboarding_create_first_building" ON building_users;
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;

-- Create a special policy for first-time building creation
-- This policy allows authenticated users to create their first building association
-- without requiring them to already have a building (which would cause recursion)
CREATE POLICY "onboarding_create_first_building"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  (auth.role() = 'authenticated')
);

-- Create a function to check if a user has any existing buildings
CREATE OR REPLACE FUNCTION user_has_no_buildings()
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM building_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy for users to create their first building association
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  user_has_no_buildings()
);

-- Create a function to handle new user signup without recursion
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

    -- Create building_users entry with security definer context
    EXECUTE 'INSERT INTO building_users (building_id, user_id, role) VALUES ($1, $2, $3::user_role)'
    USING v_building_id, NEW.id, v_role;

    -- Update user metadata with building ID
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('buildingId', v_building_id)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();