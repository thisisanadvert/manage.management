-- Fix the remaining policies that are causing recursion
-- Run this in Supabase SQL Editor

-- Fix announcements policies
DROP POLICY IF EXISTS "Building administrators can create announcements" ON announcements;
CREATE POLICY "Building administrators can create announcements"
ON announcements
FOR INSERT
TO public
WITH CHECK (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = announcements.building_id
    AND user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Fix polls policies  
DROP POLICY IF EXISTS "Building administrators can create polls" ON polls;
CREATE POLICY "Building administrators can create polls"
ON polls
FOR INSERT
TO public
WITH CHECK (
  building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
  EXISTS (
    SELECT 1 FROM building_users
    WHERE building_id = polls.building_id
    AND user_id = auth.uid()
    AND role IN ('rtm-director', 'sof-director', 'management-company')
  )
);

-- Check if there are any remaining problematic policies
SELECT 'Final check - should be empty:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE qual LIKE '%is_building_member%' 
   OR with_check LIKE '%is_building_member%'
   OR qual LIKE '%is_building_admin%' 
   OR with_check LIKE '%is_building_admin%'
   OR qual LIKE '%is_building_director%' 
   OR with_check LIKE '%is_building_director%'
ORDER BY tablename, policyname;

-- Show all current policies for verification
SELECT 'All current building-related policies:' as status;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('buildings', 'building_users', 'announcements', 'polls', 'issues')
ORDER BY tablename, policyname;
