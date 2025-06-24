-- Debug script to check current policies and fix any remaining issues
-- Run this in Supabase SQL Editor to diagnose and fix policy problems

-- Check current policies on building_users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'building_users'
ORDER BY policyname;

-- Check current policies on buildings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'buildings'
ORDER BY policyname;

-- Ensure building_users policies are simple and don't cause recursion
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- Allow demo building access
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);

-- Allow directors to view members in their buildings (simplified)
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
CREATE POLICY "directors_view_members"
ON building_users
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Allow directors to create users (simplified)
DROP POLICY IF EXISTS "directors_create_users" ON building_users;
CREATE POLICY "directors_create_users"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM building_users bu
    WHERE bu.building_id = building_users.building_id
    AND bu.user_id = auth.uid()
    AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Allow new users to create their first building association
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  NOT EXISTS (
    SELECT 1 FROM building_users
    WHERE user_id = auth.uid()
  )
);

-- Allow onboarding users to create building associations
DROP POLICY IF EXISTS "onboarding_create_first_building" ON building_users;
CREATE POLICY "onboarding_create_first_building"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  (auth.role() = 'authenticated')
);

-- Ensure buildings table has proper policies
DROP POLICY IF EXISTS "building_admins_insert_buildings" ON buildings;
CREATE POLICY "building_admins_insert_buildings"
ON buildings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "building_admins_update_buildings" ON buildings;
CREATE POLICY "building_admins_update_buildings"
ON buildings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = buildings.id
    AND user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director', 'management-company')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = buildings.id
    AND user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Check if there are any remaining function dependencies
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%building%'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
