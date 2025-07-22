-- Quick fix for building selector issue
-- Run this first to immediately fix the problem

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
DROP POLICY IF EXISTS "management_company_view_buildings" ON buildings;

-- Create a simple, working policy
CREATE POLICY "users_can_view_their_buildings"
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

-- Verify it works
SELECT 'Testing the fix:' as result;
SELECT id, name 
FROM buildings 
WHERE id IN (
  SELECT building_id 
  FROM building_users 
  WHERE user_id = auth.uid()
  AND role = 'management-company'
);
