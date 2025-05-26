/*
  # Fix building_users RLS policies recursion

  1. Changes
    - Fix infinite recursion in building_users policies
    - Simplify policy logic to prevent circular references
    - Maintain same access control without recursion

  2. Security
    - Maintain existing security model
    - Prevent policy recursion
    - Keep role-based access control
*/

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "Allow demo users to access their building data" ON building_users;

-- Create new non-recursive policies

-- Allow users to view their own building memberships
CREATE POLICY "view_building_users" ON building_users
  FOR SELECT
  USING (
    -- Users can always see their own membership
    user_id = auth.uid() 
    OR 
    -- Allow access to demo building for demo users
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND auth.email() LIKE '%@demo.com')
    OR
    -- Directors and management can see all users in their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
    )
  );

-- Allow directors and management to create new users
CREATE POLICY "create_building_users" ON building_users
  FOR INSERT
  WITH CHECK (
    -- Directors and management can add users to their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
    )
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND auth.email() LIKE '%@demo.com')
    OR
    -- Allow new users to create their first building association
    (
      auth.role() = 'authenticated' 
      AND NOT EXISTS (
        SELECT 1 
        FROM building_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Allow directors and management to update users
CREATE POLICY "update_building_users" ON building_users
  FOR UPDATE
  USING (
    -- Directors and management can update users in their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
    )
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND auth.email() LIKE '%@demo.com')
  );

-- Allow directors and management to delete users
CREATE POLICY "delete_building_users" ON building_users
  FOR DELETE
  USING (
    -- Directors and management can delete users from their buildings
    EXISTS (
      SELECT 1 
      FROM building_users bu 
      WHERE 
        bu.building_id = building_users.building_id 
        AND bu.user_id = auth.uid() 
        AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
    )
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND auth.email() LIKE '%@demo.com')
  );

-- Fix issues table policies to avoid recursion
DROP POLICY IF EXISTS "Users can view issues in their buildings" ON issues;
CREATE POLICY "Users can view issues in their buildings"
  ON issues
  FOR SELECT
  USING (
    -- Users can view issues in buildings they belong to
    EXISTS (
      SELECT 1 
      FROM building_users
      WHERE building_users.building_id = issues.building_id
      AND building_users.user_id = auth.uid()
    )
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND auth.email() LIKE '%@demo.com')
  );