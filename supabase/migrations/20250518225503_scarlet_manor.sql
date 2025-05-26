/*
  # Fix Building Setup and User Association

  1. Changes
    - Create a function to properly update building information
    - Fix user-building association during signup
    - Ensure building ID is stored in user metadata
    - Add trigger to update onboarding steps when building is updated

  2. Security
    - Maintains existing RLS policies
    - No changes to access control required
*/

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

-- Create a function to handle new user signup with proper building association
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  v_building_id uuid;
  v_user_metadata jsonb;
  v_role user_role;
BEGIN
  -- Extract role from user metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    v_role := (NEW.raw_user_meta_data->>'role')::user_role;
  ELSE
    RETURN NEW;
  END IF;

  -- Create a building for the user if they're a director
  IF v_role IN ('rtm-director', 'sof-director') THEN
    INSERT INTO buildings (
      name,
      address,
      total_units,
      management_structure
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'buildingName', 'My Building'),
      COALESCE(NEW.raw_user_meta_data->>'buildingAddress', 'Address not set'),
      COALESCE((NEW.raw_user_meta_data->>'totalUnits')::integer, 1),
      CASE 
        WHEN v_role = 'rtm-director' THEN 'rtm'
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
      v_role
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

-- Drop the trigger if it exists to avoid the error
DROP TRIGGER IF EXISTS update_building_details ON buildings;

-- Create the trigger
CREATE TRIGGER update_building_details
  AFTER UPDATE ON buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_building_details();

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
    v_user_metadata = v_user_metadata || jsonb_build_object('buildingId', NEW.building_id);
    
    UPDATE auth.users
    SET raw_user_meta_data = v_user_metadata
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user metadata when building_users is created
DROP TRIGGER IF EXISTS update_user_building_metadata ON building_users;
CREATE TRIGGER update_user_building_metadata
  AFTER INSERT ON building_users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_building_metadata();

-- Create a function to update onboarding steps when member invites are created
CREATE OR REPLACE FUNCTION update_onboarding_step()
RETURNS trigger AS $$
BEGIN
  -- Member invites
  IF TG_TABLE_NAME = 'building_users' AND NEW.role IN ('leaseholder', 'shareholder') THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.role IN ('rtm-director', 'sof-director')
    AND bu.user_id = os.user_id 
    AND os.step_name = 'member_invites';
  END IF;

  -- Document upload
  IF TG_TABLE_NAME = 'onboarding_documents' THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.user_id = os.user_id 
    AND os.step_name = 'documents';
  END IF;

  -- Financial setup
  IF TG_TABLE_NAME = 'financial_setup' THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.user_id = os.user_id 
    AND os.step_name = 'financial_setup';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for onboarding step updates
DROP TRIGGER IF EXISTS update_member_invites ON building_users;
CREATE TRIGGER update_member_invites
  AFTER INSERT ON building_users
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

DROP TRIGGER IF EXISTS update_document_upload ON onboarding_documents;
CREATE TRIGGER update_document_upload
  AFTER INSERT ON onboarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

DROP TRIGGER IF EXISTS update_financial_setup ON financial_setup;
CREATE TRIGGER update_financial_setup
  AFTER INSERT ON financial_setup
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

-- Create a function to handle share certificate creation
CREATE OR REPLACE FUNCTION update_share_certificates()
RETURNS trigger AS $$
BEGIN
  -- Mark the share_certificates step as complete
  UPDATE onboarding_steps os
  SET 
    completed = true,
    completed_at = NOW()
  FROM building_users bu
  WHERE 
    bu.building_id = NEW.building_id
    AND bu.user_id = os.user_id
    AND bu.role = 'sof-director'
    AND os.step_name = 'share_certificates';
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for share certificate creation
DROP TRIGGER IF EXISTS update_share_certificates ON share_certificates;
CREATE TRIGGER update_share_certificates
  AFTER INSERT ON share_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_share_certificates();