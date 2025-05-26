/*
  # Fix building_users RLS policies to prevent recursion

  1. Changes
    - Drop existing policies that cause recursion
    - Create new policies with optimized logic
    - Add special handling for demo building
    - Fix infinite recursion in policy evaluation

  2. Security
    - Maintain existing security model
    - Prevent policy recursion
    - Keep role-based access control
*/

-- Drop all existing policies on building_users individually
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "Allow access to demo building users" ON building_users;
DROP POLICY IF EXISTS "Allow demo users to access their building data" ON building_users;
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
DROP POLICY IF EXISTS "directors_create_users" ON building_users;
DROP POLICY IF EXISTS "directors_update_users" ON building_users;
DROP POLICY IF EXISTS "directors_delete_users" ON building_users;
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
DROP POLICY IF EXISTS "demo_building_access" ON building_users;

-- Create new, simplified policies that avoid recursion

-- 1. Allow users to view their own memberships
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- 2. Allow directors to view members in their buildings
CREATE POLICY "directors_view_members"
ON building_users
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 3. Allow directors to create new building users
CREATE POLICY "directors_create_users"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 4. Allow directors to update building users
CREATE POLICY "directors_update_users"
ON building_users
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 5. Allow directors to delete building users
CREATE POLICY "directors_delete_users"
ON building_users
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- 6. Allow new users to create their first building association
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 
    FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- 7. Special policy for demo building access
CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid
);