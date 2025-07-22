-- Fix Building Selector RLS Issue
-- This fixes the issue where management company users can't see buildings in the dropdown

-- First, let's check the current state
SELECT 'Current building_users records:' as status;
SELECT user_id, building_id, role 
FROM building_users 
WHERE role = 'management-company'
ORDER BY building_id;

-- Check current buildings table policies
SELECT 'Current buildings table policies:' as status;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'buildings'
ORDER BY policyname;

-- Drop and recreate the buildings SELECT policy to ensure it works correctly
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;

-- Create a simple, working policy for buildings SELECT
CREATE POLICY "management_company_view_buildings"
ON buildings
FOR SELECT
TO public
USING (
  -- Allow access to demo building
  id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  -- Allow users to see buildings they are associated with
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_users.building_id = buildings.id
    AND building_users.user_id = auth.uid()
  )
);

-- Verify the policy was created
SELECT 'New buildings policy created:' as status;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'buildings' AND policyname = 'management_company_view_buildings';

-- Test the query that the app is making
SELECT 'Testing buildings query:' as status;
SELECT id, name, address, total_units, building_type, management_structure
FROM buildings
WHERE id IN (
  SELECT building_id
  FROM building_users
  WHERE user_id = 'b0c62088-ab80-463d-949f-3905888b279b'
  AND role = 'management-company'
)
ORDER BY name;

-- Also test a direct buildings query to see if RLS is working
SELECT 'Direct buildings query test:' as status;
SELECT id, name FROM buildings LIMIT 5;

-- Check if there are any conflicting policies
SELECT 'All policies on buildings table:' as status;
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'buildings';

-- Test the exact query the app is making step by step
SELECT 'Step 1 - Building IDs from building_users:' as status;
SELECT building_id
FROM building_users
WHERE user_id = 'b0c62088-ab80-463d-949f-3905888b279b'
AND role = 'management-company';

SELECT 'Step 2 - Buildings with those IDs:' as status;
SELECT id, name, address
FROM buildings
WHERE id IN (
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- If the above fails, let's temporarily disable RLS to test
-- IMPORTANT: Only run this for testing, then re-enable RLS!
-- ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
-- SELECT 'RLS disabled test:' as status;
-- SELECT id, name FROM buildings LIMIT 5;
-- ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
