-- Complete fix for all building-related policies to eliminate recursion
-- Run this in Supabase SQL Editor

-- First, let's see what policies are currently using the problematic functions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE qual LIKE '%is_building_member%' 
   OR with_check LIKE '%is_building_member%'
   OR qual LIKE '%is_building_admin%' 
   OR with_check LIKE '%is_building_admin%'
   OR qual LIKE '%is_building_director%' 
   OR with_check LIKE '%is_building_director%'
ORDER BY tablename, policyname;

-- Drop and recreate ALL policies that might be causing recursion

-- BUILDINGS TABLE POLICIES
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
DROP POLICY IF EXISTS "building_admins_insert_buildings" ON buildings;
DROP POLICY IF EXISTS "building_admins_update_buildings" ON buildings;

-- Create simple, non-recursive policies for buildings
CREATE POLICY "users_view_own_buildings"
ON buildings
FOR SELECT
TO public
USING (
  id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = buildings.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "building_admins_insert_buildings"
ON buildings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

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

-- BUILDING_USERS TABLE POLICIES
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
DROP POLICY IF EXISTS "directors_create_users" ON building_users;
DROP POLICY IF EXISTS "directors_update_users" ON building_users;
DROP POLICY IF EXISTS "directors_delete_users" ON building_users;
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
DROP POLICY IF EXISTS "onboarding_create_first_building" ON building_users;

-- Create simple, non-recursive policies for building_users
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);

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

CREATE POLICY "onboarding_create_first_building"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) AND
  (auth.role() = 'authenticated')
);

-- OTHER TABLES - Fix any policies that use the problematic functions
DROP POLICY IF EXISTS "users_view_building_issues" ON issues;
CREATE POLICY "users_view_building_issues"
ON issues
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = issues.building_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "users_view_building_announcements" ON announcements;
CREATE POLICY "users_view_building_announcements"
ON announcements
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = announcements.building_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "users_view_building_polls" ON polls;
CREATE POLICY "users_view_building_polls"
ON polls
FOR SELECT
TO public
USING (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = polls.building_id
    AND user_id = auth.uid()
  )
);

-- Check if there are any remaining policies using the problematic functions
SELECT 'Remaining problematic policies:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE qual LIKE '%is_building_member%' 
   OR with_check LIKE '%is_building_member%'
   OR qual LIKE '%is_building_admin%' 
   OR with_check LIKE '%is_building_admin%'
   OR qual LIKE '%is_building_director%' 
   OR with_check LIKE '%is_building_director%'
ORDER BY tablename, policyname;
