/*
  # RTM Director Onboarding Schema

  1. Changes
    - Add safety checks for existing policies
    - Improve error handling in trigger function
    - Fix policy creation
*/

-- Create onboarding status table
CREATE TABLE IF NOT EXISTS onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  building_id uuid REFERENCES buildings(id),
  profile_completed boolean DEFAULT false,
  building_setup_completed boolean DEFAULT false,
  documents_uploaded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own onboarding status" ON onboarding_status;
  DROP POLICY IF EXISTS "Users can update their own onboarding status" ON onboarding_status;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Users can view their own onboarding status"
ON onboarding_status FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding status"
ON onboarding_status FOR UPDATE
USING (auth.uid() = user_id);

-- Function to set up initial RTM data
CREATE OR REPLACE FUNCTION create_initial_rtm_setup(
  p_user_id uuid,
  p_building_name text,
  p_building_address text,
  p_unit_number text,
  p_total_units integer,
  p_building_age integer,
  p_building_type text,
  p_service_charge_frequency text
) RETURNS uuid AS $$
DECLARE
  v_building_id uuid;
  v_unit_id uuid;
BEGIN
  -- Create building with full details
  INSERT INTO buildings (
    name, 
    address, 
    total_units,
    building_age,
    building_type,
    service_charge_frequency,
    management_type
  )
  VALUES (
    p_building_name,
    p_building_address,
    p_total_units,
    p_building_age,
    p_building_type,
    p_service_charge_frequency,
    'RTM'
  )
  RETURNING id INTO v_building_id;

  -- Create initial unit
  INSERT INTO units (building_id, unit_number)
  VALUES (v_building_id, p_unit_number)
  RETURNING id INTO v_unit_id;

  -- Link user to building as RTM director
  INSERT INTO building_users (building_id, user_id, role, unit_id)
  VALUES (v_building_id, p_user_id, 'rtm-director', v_unit_id);

  -- Create onboarding status
  INSERT INTO onboarding_status (user_id, building_id)
  VALUES (p_user_id, v_building_id);

  RETURN v_building_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new RTM signups
CREATE OR REPLACE FUNCTION handle_new_rtm_signup()
RETURNS trigger AS $$
BEGIN
  -- Only proceed if this is an RTM director signup and NOT a demo user
  IF (NEW.raw_user_meta_data->>'role' = 'rtm-director' AND (NEW.raw_user_meta_data->>'isDemo')::boolean IS NOT TRUE) THEN
    -- Check if required metadata exists
    IF (
      NEW.raw_user_meta_data->>'buildingName' IS NOT NULL AND
      NEW.raw_user_meta_data->>'buildingAddress' IS NOT NULL AND
      NEW.raw_user_meta_data->>'unitNumber' IS NOT NULL AND
      NEW.raw_user_meta_data->>'totalUnits' IS NOT NULL AND
      NEW.raw_user_meta_data->>'buildingAge' IS NOT NULL AND
      NEW.raw_user_meta_data->>'buildingType' IS NOT NULL AND
      NEW.raw_user_meta_data->>'serviceChargeFrequency' IS NOT NULL
    ) THEN
      -- Create initial RTM setup
      PERFORM create_initial_rtm_setup(
        NEW.id,
        NEW.raw_user_meta_data->>'buildingName',
        NEW.raw_user_meta_data->>'buildingAddress',
        NEW.raw_user_meta_data->>'unitNumber',
        (NEW.raw_user_meta_data->>'totalUnits')::integer,
        (NEW.raw_user_meta_data->>'buildingAge')::integer,
        NEW.raw_user_meta_data->>'buildingType',
        NEW.raw_user_meta_data->>'serviceChargeFrequency'
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_rtm_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_rtm_signup ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_rtm_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_rtm_signup();