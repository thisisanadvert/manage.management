/*
  # Add SOF Onboarding Steps

  1. Changes
    - Add default onboarding steps for SOF directors
    - Link steps to specific product features
    - Track completion status
*/

-- Insert default SOF onboarding steps when a new SOF director signs up
CREATE OR REPLACE FUNCTION create_sof_onboarding_steps(
  p_user_id uuid,
  p_building_id uuid
) RETURNS void AS $$
BEGIN
  -- Profile Setup
  INSERT INTO onboarding_steps (user_id, building_id, step_name, title, description)
  VALUES (
    p_user_id,
    p_building_id,
    'profile_setup',
    'Complete Your Profile',
    'Add your contact details and preferences'
  );

  -- Share Certificates
  INSERT INTO onboarding_steps (user_id, building_id, step_name, title, description)
  VALUES (
    p_user_id,
    p_building_id,
    'share_certificates',
    'Set Up Share Certificates',
    'Add share certificates for all shareholders'
  );

  -- Building Details
  INSERT INTO onboarding_steps (user_id, building_id, step_name, title, description)
  VALUES (
    p_user_id,
    p_building_id,
    'building_details',
    'Building Information',
    'Add building details and service charge structure'
  );

  -- Financial Setup
  INSERT INTO onboarding_steps (user_id, building_id, step_name, title, description)
  VALUES (
    p_user_id,
    p_building_id,
    'financial_setup',
    'Financial Setup',
    'Configure service charges and payment schedules'
  );

  -- Document Upload
  INSERT INTO onboarding_steps (user_id, building_id, step_name, title, description)
  VALUES (
    p_user_id,
    p_building_id,
    'document_upload',
    'Upload Documents',
    'Add important building documents and certificates'
  );

  -- Invite Members
  INSERT INTO onboarding_steps (user_id, building_id, step_name, title, description)
  VALUES (
    p_user_id,
    p_building_id,
    'invite_members',
    'Invite Shareholders',
    'Add other shareholders to the platform'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to create onboarding steps for new SOF directors
CREATE OR REPLACE FUNCTION handle_new_sof_signup()
RETURNS trigger AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'sof-director' THEN
    -- Create onboarding steps after building is created
    PERFORM create_sof_onboarding_steps(
      NEW.id,
      (
        SELECT building_id 
        FROM building_users 
        WHERE user_id = NEW.id 
        LIMIT 1
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_sof_signup ON auth.users;
CREATE TRIGGER on_sof_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_sof_signup();

-- Add triggers to automatically mark steps as complete
CREATE OR REPLACE FUNCTION update_onboarding_step()
RETURNS trigger AS $$
BEGIN
  -- Profile completion
  IF TG_TABLE_NAME = 'users' AND NEW.raw_user_meta_data->>'firstName' IS NOT NULL THEN
    UPDATE onboarding_steps
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.id AND step_name = 'profile_setup';
  END IF;

  -- Share certificates
  IF TG_TABLE_NAME = 'share_certificates' THEN
    UPDATE onboarding_steps
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.holder_id AND step_name = 'share_certificates';
  END IF;

  -- Building details
  IF TG_TABLE_NAME = 'buildings' AND 
     NEW.building_type IS NOT NULL AND 
     NEW.service_charge_frequency IS NOT NULL THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.id 
    AND bu.user_id = os.user_id 
    AND os.step_name = 'building_details';
  END IF;

  -- Financial setup
  IF TG_TABLE_NAME = 'service_charges' THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.user_id = os.user_id 
    AND os.step_name = 'financial_setup';
  END IF;

  -- Document upload
  IF TG_TABLE_NAME = 'onboarding_documents' THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.user_id = os.user_id 
    AND os.step_name = 'document_upload';
  END IF;

  -- Member invites
  IF TG_TABLE_NAME = 'building_users' AND NEW.role = 'shareholder' THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.role = 'sof-director'
    AND bu.user_id = os.user_id 
    AND os.step_name = 'invite_members';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each relevant table
CREATE TRIGGER update_profile_completion
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

CREATE TRIGGER update_share_certificates
  AFTER INSERT ON share_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

CREATE TRIGGER update_building_details
  AFTER UPDATE ON buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

CREATE TRIGGER update_financial_setup
  AFTER INSERT ON service_charges
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

CREATE TRIGGER update_document_upload
  AFTER INSERT ON onboarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();

CREATE TRIGGER update_member_invites
  AFTER INSERT ON building_users
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();