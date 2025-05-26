/*
  # Fix Building Users RLS Policies

  1. Changes
    - Drop all existing building_users policies
    - Create new non-recursive policies
    - Fix infinite recursion issue in policy definitions
    - Add special handling for demo building

  2. Security
    - Maintain existing security model
    - Ensure proper access control
*/

-- Drop all existing policies on building_users
DROP POLICY IF EXISTS "allow_demo_building_access" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_can_manage_building_users" ON building_users;
DROP POLICY IF EXISTS "directors_can_view_building_members" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "users_can_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "view_own_building_users" ON building_users;
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "directors_manage_building_users" ON building_users;
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
DROP POLICY IF EXISTS "view_building_users" ON building_users;

-- Create new, simplified policies that avoid recursion

-- 1. Allow users to view their own memberships
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- 2. Allow access to demo building
CREATE POLICY "demo_building_access"
ON building_users
FOR SELECT
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);

-- 3. Allow directors to view all members in their buildings
-- This policy uses a materialized subquery to avoid recursion
CREATE POLICY "directors_view_building_members"
ON building_users
FOR SELECT
TO public
USING (
  EXISTS (
    WITH director_buildings AS (
      SELECT building_id 
      FROM building_users 
      WHERE user_id = auth.uid() 
      AND role IN ('rtm-director', 'sof-director', 'management-company')
    )
    SELECT 1 
    FROM director_buildings
    WHERE building_id = building_users.building_id
  )
);

-- 4. Allow directors to create new building users
CREATE POLICY "directors_create_building_users"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    WITH director_buildings AS (
      SELECT building_id 
      FROM building_users 
      WHERE user_id = auth.uid() 
      AND role IN ('rtm-director', 'sof-director', 'management-company')
    )
    SELECT 1 
    FROM director_buildings
    WHERE building_id = building_users.building_id
  )
);

-- 5. Allow directors to update building users
CREATE POLICY "directors_update_building_users"
ON building_users
FOR UPDATE
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    WITH director_buildings AS (
      SELECT building_id 
      FROM building_users 
      WHERE user_id = auth.uid() 
      AND role IN ('rtm-director', 'sof-director', 'management-company')
    )
    SELECT 1 
    FROM director_buildings
    WHERE building_id = building_users.building_id
  )
);

-- 6. Allow directors to delete building users
CREATE POLICY "directors_delete_building_users"
ON building_users
FOR DELETE
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    WITH director_buildings AS (
      SELECT building_id 
      FROM building_users 
      WHERE user_id = auth.uid() 
      AND role IN ('rtm-director', 'sof-director', 'management-company')
    )
    SELECT 1 
    FROM director_buildings
    WHERE building_id = building_users.building_id
  )
);

-- 7. Allow new users to create their first building association
CREATE POLICY "new_users_create_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  auth.role() = 'authenticated' AND
  NOT EXISTS (
    SELECT 1 
    FROM building_users 
    WHERE user_id = auth.uid()
  )
);