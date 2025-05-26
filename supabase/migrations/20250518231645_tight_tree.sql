/*
  # Enhance Financial Setup Schema

  1. Changes
    - Add additional fields to financial_setup table
    - Add default values for better user experience
    - Create function to mark financial setup as complete
    - Add trigger to update onboarding steps

  2. Security
    - Maintain existing RLS policies
*/

-- Add additional fields to financial_setup table if they don't exist
DO $$ 
BEGIN
  -- Add annual_maintenance_budget column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'annual_maintenance_budget'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN annual_maintenance_budget decimal DEFAULT 0;
  END IF;

  -- Add annual_insurance_budget column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'annual_insurance_budget'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN annual_insurance_budget decimal DEFAULT 0;
  END IF;

  -- Add annual_utilities_budget column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'annual_utilities_budget'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN annual_utilities_budget decimal DEFAULT 0;
  END IF;

  -- Add annual_cleaning_budget column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'annual_cleaning_budget'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN annual_cleaning_budget decimal DEFAULT 0;
  END IF;

  -- Add annual_management_fee column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'annual_management_fee'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN annual_management_fee decimal DEFAULT 0;
  END IF;

  -- Add annual_reserve_contribution column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'annual_reserve_contribution'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN annual_reserve_contribution decimal DEFAULT 0;
  END IF;

  -- Add currency column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'currency'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN currency text DEFAULT 'GBP';
  END IF;

  -- Add setup_completed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_setup' AND column_name = 'setup_completed'
  ) THEN
    ALTER TABLE financial_setup ADD COLUMN setup_completed boolean DEFAULT false;
  END IF;
END $$;

-- Create or replace function to mark financial setup as complete
CREATE OR REPLACE FUNCTION mark_financial_setup_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the setup_completed flag
  NEW.setup_completed := true;
  
  -- Update the onboarding step
  UPDATE onboarding_steps
  SET 
    completed = true,
    completed_at = NOW()
  FROM building_users bu
  WHERE 
    bu.building_id = NEW.building_id
    AND bu.user_id = onboarding_steps.user_id
    AND onboarding_steps.step_name = 'financial_setup';
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for financial setup completion if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_financial_setup_complete'
  ) THEN
    CREATE TRIGGER on_financial_setup_complete
      AFTER INSERT OR UPDATE ON financial_setup
      FOR EACH ROW
      EXECUTE FUNCTION mark_financial_setup_complete();
  END IF;
END $$;

-- Create a function to calculate total budget from components
CREATE OR REPLACE FUNCTION calculate_total_budget()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total budget from components
  NEW.total_annual_budget := 
    COALESCE(NEW.annual_maintenance_budget, 0) +
    COALESCE(NEW.annual_insurance_budget, 0) +
    COALESCE(NEW.annual_utilities_budget, 0) +
    COALESCE(NEW.annual_cleaning_budget, 0) +
    COALESCE(NEW.annual_management_fee, 0) +
    COALESCE(NEW.annual_reserve_contribution, 0);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget calculation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'calculate_total_budget'
  ) THEN
    CREATE TRIGGER calculate_total_budget
      BEFORE INSERT OR UPDATE ON financial_setup
      FOR EACH ROW
      EXECUTE FUNCTION calculate_total_budget();
  END IF;
END $$;