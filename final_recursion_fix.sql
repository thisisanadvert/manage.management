-- Final fix for building_users recursion - replace ALL problematic policies
-- Run this in Supabase SQL Editor

-- First, drop ALL existing policies on building_users to start fresh
DROP POLICY IF EXISTS "Super user can access all buildings" ON building_users;
DROP POLICY IF EXISTS "allow_initial_user_creation" ON building_users;
DROP POLICY IF EXISTS "demo_building_access" ON building_users;
DROP POLICY IF EXISTS "directors_create_users" ON building_users;
DROP POLICY IF EXISTS "directors_view_members" ON building_users;
DROP POLICY IF EXISTS "join_buildings_v2" ON building_users;
DROP POLICY IF EXISTS "manage_building_users_v2" ON building_users;
DROP POLICY IF EXISTS "new_user_first_association" ON building_users;
DROP POLICY IF EXISTS "onboarding_create_first_building" ON building_users;
DROP POLICY IF EXISTS "users_view_own_memberships" ON building_users;
DROP POLICY IF EXISTS "view_own_building_associations_v2" ON building_users;

-- Create simple, non-recursive policies

-- 1. Users can view their own memberships (simple, no recursion)
CREATE POLICY "users_view_own_memberships"
ON building_users
FOR SELECT
TO public
USING (user_id = auth.uid());

-- 2. Demo building access (simple, no recursion)
CREATE POLICY "demo_building_access"
ON building_users
FOR ALL
TO public
USING (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid);

-- 3. Super user access (simplified, no building_users reference)
CREATE POLICY "super_user_access"
ON building_users
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'frankie@manage.management'
  )
);

-- 4. Allow new users to create their first building association (simplified)
CREATE POLICY "new_user_first_association"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id AND
  auth.role() = 'authenticated'
);

-- 5. Allow authenticated users to join buildings (simplified)
CREATE POLICY "authenticated_user_insert"
ON building_users
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id AND
  auth.role() = 'authenticated'
);

-- 6. Allow users to update their own records (simplified)
CREATE POLICY "users_update_own_records"
ON building_users
FOR UPDATE
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Verify no policies reference building_users in their conditions
SELECT 'Verification - should be empty:' as status;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'building_users'
AND (qual LIKE '%building_users%' OR with_check LIKE '%building_users%')
ORDER BY policyname;

-- Show all new policies
SELECT 'New building_users policies:' as status;
SELECT policyname, cmd, 
       CASE WHEN qual IS NOT NULL THEN 'Has USING' ELSE 'No USING' END as using_clause,
       CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK' ELSE 'No WITH CHECK' END as check_clause
FROM pg_policies 
WHERE tablename = 'building_users'
ORDER BY policyname;
