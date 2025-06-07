-- Fix the document upload trigger that's causing role field error
-- The issue is that the trigger function is trying to access a "role" field 
-- that doesn't exist on the onboarding_documents table

-- Drop the problematic trigger temporarily
DROP TRIGGER IF EXISTS update_document_upload ON onboarding_documents;

-- Create a corrected version of the trigger function
CREATE OR REPLACE FUNCTION update_onboarding_step()
RETURNS trigger AS $$
BEGIN
  -- Document upload - only handle onboarding_documents table
  IF TG_TABLE_NAME = 'onboarding_documents' THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.user_id = os.user_id 
    AND os.step_name = 'documents';
  END IF;

  -- Member invites - only handle building_users table
  IF TG_TABLE_NAME = 'building_users' AND NEW.role IN ('leaseholder', 'shareholder') THEN
    UPDATE onboarding_steps os
    SET completed = true, completed_at = NOW()
    FROM building_users bu
    WHERE bu.building_id = NEW.building_id 
    AND bu.role IN ('rtm-director', 'sof-director')
    AND bu.user_id = os.user_id 
    AND os.step_name = 'member_invites';
  END IF;

  -- Financial setup - only handle financial_setup table
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

-- Re-create the trigger for document uploads
CREATE TRIGGER update_document_upload
  AFTER INSERT ON onboarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();
