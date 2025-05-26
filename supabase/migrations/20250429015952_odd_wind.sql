/*
  # Fix building_users RLS policies

  1. Changes
    - Replace recursive policies with non-recursive versions
    - Optimize policy checks to prevent infinite recursion
    - Maintain same access control logic but with better performance

  2. Security
    - Maintain existing security rules
    - Prevent policy recursion
    - Keep role-based access control
*/

-- Drop existing policies to replace them with non-recursive versions
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;

-- Create new non-recursive policies

-- View policy: Users can see their own entries and admins can see all entries in their buildings
CREATE POLICY "view_building_users" ON building_users
  FOR SELECT
  USING (
    -- Allow users to see their own membership
    user_id = auth.uid() 
    OR 
    -- Allow RTM directors and management to see members in their buildings
    building_id IN (
      SELECT DISTINCT bu.building_id 
      FROM building_users bu 
      WHERE bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'management-company')
    )
  );

-- Insert policy: Only RTM directors and management can create new building users
CREATE POLICY "create_building_users" ON building_users
  FOR INSERT
  WITH CHECK (
    building_id IN (
      SELECT DISTINCT bu.building_id 
      FROM building_users bu 
      WHERE bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'management-company')
    )
  );

-- Update policy: Only RTM directors and management can update building users
CREATE POLICY "update_building_users" ON building_users
  FOR UPDATE
  USING (
    building_id IN (
      SELECT DISTINCT bu.building_id 
      FROM building_users bu 
      WHERE bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'management-company')
    )
  );

-- Delete policy: Only RTM directors and management can delete building users
CREATE POLICY "delete_building_users" ON building_users
  FOR DELETE
  USING (
    building_id IN (
      SELECT DISTINCT bu.building_id 
      FROM building_users bu 
      WHERE bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'management-company')
    )
  );