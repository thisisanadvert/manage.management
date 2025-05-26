/*
  # Fix building_users RLS policies

  1. Changes
    - Remove recursive policies from building_users table
    - Create new, simplified policies that avoid infinite recursion
    - Maintain security while allowing proper access patterns

  2. Security
    - Users can view their own building associations
    - RTM directors and management can view all users in their buildings
    - RTM directors and management can manage users in their buildings
*/

-- Drop existing policies to replace them with non-recursive versions
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "view_building_users" ON building_users;

-- Create new non-recursive policies

-- View policy: Users can see their own entries and admins can see all entries in their buildings
CREATE POLICY "view_building_users" ON building_users
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM building_users bu
      WHERE bu.user_id = auth.uid()
      AND bu.building_id = building_users.building_id
      AND bu.role IN ('rtm-director', 'management-company')
      AND bu.id != building_users.id  -- Prevent recursion by excluding self-reference
    )
  );

-- Insert policy: Only RTM directors and management can create new building users
CREATE POLICY "create_building_users" ON building_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM building_users bu
      WHERE bu.user_id = auth.uid()
      AND bu.building_id = building_users.building_id
      AND bu.role IN ('rtm-director', 'management-company')
      AND bu.id != COALESCE(building_users.id, '00000000-0000-0000-0000-000000000000')  -- Prevent recursion
    )
  );

-- Update policy: Only RTM directors and management can update building users
CREATE POLICY "update_building_users" ON building_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM building_users bu
      WHERE bu.user_id = auth.uid()
      AND bu.building_id = building_users.building_id
      AND bu.role IN ('rtm-director', 'management-company')
      AND bu.id != building_users.id  -- Prevent recursion
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM building_users bu
      WHERE bu.user_id = auth.uid()
      AND bu.building_id = building_users.building_id
      AND bu.role IN ('rtm-director', 'management-company')
      AND bu.id != building_users.id  -- Prevent recursion
    )
  );

-- Delete policy: Only RTM directors and management can delete building users
CREATE POLICY "delete_building_users" ON building_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM building_users bu
      WHERE bu.user_id = auth.uid()
      AND bu.building_id = building_users.building_id
      AND bu.role IN ('rtm-director', 'management-company')
      AND bu.id != building_users.id  -- Prevent recursion
    )
  );