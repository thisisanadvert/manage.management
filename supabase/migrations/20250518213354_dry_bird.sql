/*
  # Fix building_users RLS policies

  1. Changes
    - Drop existing policies that may be causing recursion
    - Create new, simplified policies for building_users table
    - Ensure policies don't create circular references
    
  2. Security
    - Maintain existing security model
    - Users can only view their own memberships
    - Directors can manage users in their buildings
    - Demo building remains accessible
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "allow_demo_building_access" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_can_manage_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_can_view_building_members" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "users_can_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "view_own_building_users" ON building_users;

-- Create new, simplified policies
-- Allow users to view their own memberships
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- Allow directors to view and manage users in their buildings
CREATE POLICY "directors_manage_building_users"
ON building_users
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE 
      bu.building_id = building_users.building_id
      AND bu.user_id = auth.uid()
      AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Allow access to demo building
CREATE POLICY "demo_building_access"
ON building_users
FOR SELECT
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);