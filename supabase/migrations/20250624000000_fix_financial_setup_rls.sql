/*
  # Fix Financial Setup RLS Policies

  ## Problem
  Users are getting "row-level security policy for table 'financial_setup'" errors
  when trying to access the financial setup page.

  ## Root Cause
  The RLS policies for financial_setup table are too restrictive and don't account for:
  1. Super user access (frankie@manage.management)
  2. Users whose building association is stored in user metadata
  3. Potential issues with building_users table access

  ## Solution
  Update the financial_setup RLS policies to:
  1. Allow super user access
  2. Check both building_users table and user metadata for building association
  3. Provide fallback access methods
*/

-- Drop existing financial_setup policies
DROP POLICY IF EXISTS "Users can view financial setup for their buildings" ON financial_setup;
DROP POLICY IF EXISTS "Directors can manage financial setup" ON financial_setup;

-- Create enhanced policies for financial_setup
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

-- Also add a policy for INSERT operations specifically for directors
CREATE POLICY "Directors can create financial setup"
  ON financial_setup
  FOR INSERT
  WITH CHECK (
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
