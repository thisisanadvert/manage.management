-- Manual fix for building_users infinite recursion issue
-- Run this in Supabase SQL Editor to fix the recursion problem

-- Fix the buildings policy to avoid recursion
-- Instead of using is_building_member, use a direct subquery
DROP POLICY IF EXISTS "users_view_own_buildings" ON buildings;
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

-- Also fix other policies that might use is_building_member to avoid similar issues
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
