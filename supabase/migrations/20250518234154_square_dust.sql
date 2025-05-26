/*
  # Fix Building Setup Functionality

  1. Changes
    - Fix the handle_new_user_signup function to properly create buildings
    - Ensure building_id is correctly stored in user metadata
    - Add proper error handling and logging
    - Fix role conversion issues

  2. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

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
  -- Make sure role is not null
  IF NEW.role IS NULL THEN
    RAISE EXCEPTION 'Role cannot be null';
  END IF;
  
  -- Convert text role to user_role enum if needed
  IF pg_typeof(NEW.role) = 'text'::regtype THEN
    BEGIN
      NEW.role := NEW.role::user_role;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid role: %', NEW.role;
    END;
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

-- Create a function to update user metadata with building ID
CREATE OR REPLACE FUNCTION update_user_building_metadata()
RETURNS trigger AS $$
DECLARE
  v_user_metadata jsonb;
BEGIN
  -- Get current user metadata
  SELECT raw_user_meta_data INTO v_user_metadata
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Update user metadata to include building_id if not already present
  IF v_user_metadata->>'buildingId' IS NULL THEN
    v_user_metadata := v_user_metadata || jsonb_build_object('buildingId', NEW.building_id);
    
    UPDATE auth.users
    SET raw_user_meta_data = v_user_metadata
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in update_user_building_metadata: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user metadata when building_users is created
DROP TRIGGER IF EXISTS update_user_building_metadata ON building_users;
CREATE TRIGGER update_user_building_metadata
  AFTER INSERT ON building_users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_building_metadata();