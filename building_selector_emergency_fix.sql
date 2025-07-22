-- EMERGENCY FIX FOR BUILDING SELECTOR
-- Run this FIRST in Supabase SQL Editor

-- Drop all existing building policies that might be conflicting
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
DROP POLICY IF EXISTS "management_company_view_buildings" ON buildings;
DROP POLICY IF EXISTS "building_admins_view_buildings" ON buildings;

-- Create a simple, working policy
CREATE POLICY "authenticated_users_view_buildings"
ON buildings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = buildings.id
    AND building_users.user_id = auth.uid()
  )
);

-- Test the fix immediately
SELECT 'Testing building access:' as test;
SELECT b.id, b.name, b.address, b.total_units
FROM buildings b
WHERE EXISTS (
  SELECT 1 FROM building_users bu
  WHERE bu.building_id = b.id
  AND bu.user_id = auth.uid()
)
ORDER BY b.name;
