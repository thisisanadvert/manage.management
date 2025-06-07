-- MANUAL FIX FOR FINANCIAL SETUP TRIGGER ERROR
-- Run this SQL directly in your Supabase SQL Editor to fix the "role" field error

-- Step 1: Drop all problematic triggers on financial_setup table
DROP TRIGGER IF EXISTS on_financial_setup_complete ON financial_setup;
DROP TRIGGER IF EXISTS update_financial_setup ON financial_setup;
DROP TRIGGER IF EXISTS update_document_upload ON financial_setup;

-- Step 2: Create a clean, specific trigger function for financial setup
CREATE OR REPLACE FUNCTION handle_financial_setup_completion()
RETURNS trigger AS $$
BEGIN
  -- Update the setup_completed flag if not already set
  IF NEW.setup_completed IS NULL THEN
    NEW.setup_completed := true;
  END IF;
  
  -- Mark the financial_setup onboarding step as complete
  -- for all users associated with this building
  UPDATE onboarding_steps os
  SET 
    completed = true,
    completed_at = NOW()
  FROM building_users bu
  WHERE 
    bu.building_id = NEW.building_id 
    AND bu.user_id = os.user_id 
    AND os.step_name = 'financial_setup'
    AND os.completed = false;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger specifically for financial setup
CREATE TRIGGER on_financial_setup_complete
  BEFORE INSERT OR UPDATE ON financial_setup
  FOR EACH ROW
  EXECUTE FUNCTION handle_financial_setup_completion();

-- Step 4: Clean up the general onboarding trigger function
-- to ensure it doesn't interfere with financial_setup table
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

  -- Profile completion - only handle auth.users table
  IF TG_TABLE_NAME = 'users' AND NEW.raw_user_meta_data->>'firstName' IS NOT NULL THEN
    UPDATE onboarding_steps
    SET completed = true, completed_at = NOW()
    WHERE user_id = NEW.id AND step_name = 'profile';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Remove any other triggers that might be causing conflicts
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- List all triggers on financial_setup table and drop any that aren't our specific one
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'financial_setup'::regclass 
        AND tgname != 'on_financial_setup_complete'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON financial_setup';
    END LOOP;
END $$;

-- Step 6: Verify the fix by checking current triggers
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'financial_setup'::regclass;
