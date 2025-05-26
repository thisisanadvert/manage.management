/*
  # Financial Setup Onboarding Integration

  1. Changes
    - Add trigger to update onboarding steps when financial setup is completed
    - Ensure financial setup is properly linked to onboarding process
    - Add step_name and title fields to onboarding_steps if they don't exist

  2. Security
    - Maintains existing RLS policies
    - No changes to access control required
*/

-- Add title and description columns to onboarding_steps if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_steps' AND column_name = 'title'
  ) THEN
    ALTER TABLE onboarding_steps ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_steps' AND column_name = 'description'
  ) THEN
    ALTER TABLE onboarding_steps ADD COLUMN description text;
  END IF;
END $$;

-- Create function to update onboarding step
CREATE OR REPLACE FUNCTION update_onboarding_step()
RETURNS trigger AS $$
BEGIN
  -- Profile completion
  IF TG_TABLE_NAME = 'users' AND NEW.raw_user_meta_data->>'firstName' IS NOT NULL THEN
    UPDATE onboarding_steps
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.id AND step_name = 'profile';
  END IF;

  -- Financial setup
  IF TG_TABLE_NAME = 'financial_setup' THEN
    UPDATE onboarding_steps
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.user_id = onboarding_steps.user_id 
    AND onboarding_steps.step_name = 'financial_setup';
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
    AND os.step_name = 'building';
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for financial setup
DROP TRIGGER IF EXISTS update_financial_setup ON financial_setup;
CREATE TRIGGER update_financial_setup
  AFTER INSERT OR UPDATE ON financial_setup
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();