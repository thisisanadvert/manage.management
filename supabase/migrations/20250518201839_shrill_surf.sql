/*
  # Add Financial Setup Table

  1. New Tables
    - `financial_setup` - Stores building financial configuration
  
  2. Changes
    - Create schema for tracking financial setup
    - Add policies for proper access control
*/

-- Create financial_setup table
CREATE TABLE IF NOT EXISTS financial_setup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) UNIQUE,
  service_charge_account_balance decimal DEFAULT 0,
  reserve_fund_balance decimal DEFAULT 0,
  service_charge_frequency text DEFAULT 'Quarterly',
  total_annual_budget decimal DEFAULT 0,
  has_major_works boolean DEFAULT false,
  major_works_description text,
  major_works_cost decimal DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE financial_setup ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_setup
CREATE POLICY "Users can view financial setup for their buildings"
  ON financial_setup
  FOR SELECT
  USING (
    -- Allow super user access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Allow users associated with the building
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = financial_setup.building_id
      AND building_users.user_id = auth.uid()
    )
    OR
    -- Allow users whose metadata contains the building ID
    building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
  );

CREATE POLICY "Directors can manage financial setup"
  ON financial_setup
  FOR ALL
  USING (
    -- Allow super user access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Allow directors associated with the building
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = financial_setup.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'sof-director')
    )
    OR
    -- Allow directors whose metadata contains the building ID
    (
      building_id::text = (auth.jwt() -> 'user_metadata' ->> 'buildingId')
      AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('rtm-director', 'sof-director')
    )
  );

-- Create function to mark financial setup step as complete
CREATE OR REPLACE FUNCTION mark_financial_setup_complete()
RETURNS trigger AS $$
BEGIN
  -- Mark the financial_setup step as complete for the user who created it
  UPDATE onboarding_steps
  SET 
    completed = true,
    completed_at = NOW()
  WHERE 
    user_id = NEW.created_by
    AND step_name = 'financial_setup';
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for financial setup completion
CREATE TRIGGER on_financial_setup_complete
  AFTER INSERT OR UPDATE ON financial_setup
  FOR EACH ROW
  EXECUTE FUNCTION mark_financial_setup_complete();