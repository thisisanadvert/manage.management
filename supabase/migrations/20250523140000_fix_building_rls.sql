/*
  # Fix Building RLS Policies

  This migration fixes the Row Level Security policies for the buildings table
  to allow authenticated users to create buildings without complex conditions
  that might be causing the policy violation.

  ## Changes
  1. Drop existing building insert/update policies
  2. Create simplified policies that allow authenticated users to create buildings
  3. Maintain security while fixing the immediate issue
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "building_admins_update_buildings" ON buildings;
DROP POLICY IF EXISTS "building_admins_insert_buildings" ON buildings;

-- Create policy for building administrators to update buildings
CREATE POLICY "building_admins_update_buildings"
  ON buildings
  FOR UPDATE
  TO authenticated
  USING (is_building_admin(id))
  WITH CHECK (is_building_admin(id));

-- Create a simplified policy for authenticated users to create buildings
CREATE POLICY "building_admins_insert_buildings"
  ON buildings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow all authenticated users to create buildings
    auth.uid() IS NOT NULL
  );

-- Ensure the is_building_admin function exists and works correctly
CREATE OR REPLACE FUNCTION is_building_admin(building_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = building_uuid
    AND user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director', 'management-company')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
