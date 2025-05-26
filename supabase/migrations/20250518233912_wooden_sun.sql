-- Create a simpler, more reliable function to handle new user signup
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

    -- Create building_users entry
    INSERT INTO building_users (
      building_id,
      user_id,
      role
    ) VALUES (
      v_building_id,
      NEW.id,
      v_role
    );

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

-- Create a function to ensure building_users entries have the correct role type
CREATE OR REPLACE FUNCTION ensure_valid_building_user_role()
RETURNS trigger AS $$
BEGIN
  -- Convert text role to user_role enum if needed
  IF pg_typeof(NEW.role) = 'text'::regtype THEN
    NEW.role := NEW.role::user_role;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for building_users
DROP TRIGGER IF EXISTS ensure_valid_role ON building_users;
CREATE TRIGGER ensure_valid_role
  BEFORE INSERT OR UPDATE ON building_users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_valid_building_user_role();

-- Create a function to validate user roles
-- First drop the existing constraint if it exists
ALTER TABLE building_users
DROP CONSTRAINT IF EXISTS valid_role;

-- Create a function to validate user roles
CREATE OR REPLACE FUNCTION validate_user_role(role user_role)
RETURNS boolean AS $$
BEGIN
  RETURN role IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to building_users table
ALTER TABLE building_users
ADD CONSTRAINT valid_role CHECK (validate_user_role(role));