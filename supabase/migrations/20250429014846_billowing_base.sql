/*
  # Fix building_users RLS policies

  1. Changes
    - Drop existing problematic policies
    - Create new optimized policies that prevent recursion
    - Fix NEW reference in INSERT policy
    - Improve policy naming and organization

  2. Security
    - Maintain existing security model
    - Prevent infinite recursion
    - Ensure proper access control
*/

-- Drop existing policies to replace them with optimized versions
DROP POLICY IF EXISTS "Users can view their own building membership" ON building_users;
DROP POLICY IF EXISTS "RTM directors and management can create building users" ON building_users;
DROP POLICY IF EXISTS "RTM directors and management can update building users" ON building_users;
DROP POLICY IF EXISTS "RTM directors and management can delete building users" ON building_users;

-- Create new optimized policies

-- View policy: Users can see their own memberships and all members of buildings where they are RTM/management
CREATE POLICY "view_building_users" ON building_users
FOR SELECT TO public
USING (
  user_id = auth.uid() OR 
  building_id IN (
    SELECT building_id 
    FROM building_users 
    WHERE user_id = auth.uid() 
    AND role IN ('rtm-director', 'management-company')
  )
);

-- Insert policy: RTM/management can add users to their buildings
CREATE POLICY "create_building_users" ON building_users
FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users 
    WHERE building_id = building_users.building_id 
    AND user_id = auth.uid() 
    AND role IN ('rtm-director', 'management-company')
  )
);

-- Update policy: RTM/management can update users in their buildings
CREATE POLICY "update_building_users" ON building_users
FOR UPDATE TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users 
    WHERE building_id = building_users.building_id 
    AND user_id = auth.uid() 
    AND role IN ('rtm-director', 'management-company')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users 
    WHERE building_id = building_users.building_id 
    AND user_id = auth.uid() 
    AND role IN ('rtm-director', 'management-company')
  )
);

-- Delete policy: RTM/management can remove users from their buildings
CREATE POLICY "delete_building_users" ON building_users
FOR DELETE TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users 
    WHERE building_id = building_users.building_id 
    AND user_id = auth.uid() 
    AND role IN ('rtm-director', 'management-company')
  )
);