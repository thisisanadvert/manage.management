-- SIMPLE RLS FIX - Run this first
-- This removes all RLS restrictions temporarily

-- Drop ALL building policies
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
DROP POLICY IF EXISTS "management_company_view_buildings" ON buildings;
DROP POLICY IF EXISTS "building_admins_view_buildings" ON buildings;
DROP POLICY IF EXISTS "authenticated_users_view_buildings" ON buildings;
DROP POLICY IF EXISTS "allow_all_authenticated_buildings" ON buildings;

-- Create a super permissive policy
CREATE POLICY "temp_allow_all_buildings"
ON buildings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Test it works
SELECT 'Buildings should now be visible:' as test;
SELECT id, name, address FROM buildings LIMIT 5;
