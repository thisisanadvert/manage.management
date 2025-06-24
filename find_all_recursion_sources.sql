-- Comprehensive search for ALL sources of recursion
-- Run this in Supabase SQL Editor

-- 1. Find ALL policies that reference building_users in any way
SELECT 'Policies referencing building_users:' as section;
SELECT schemaname, tablename, policyname, cmd, 
       CASE 
         WHEN qual LIKE '%building_users%' THEN 'USING clause'
         WHEN with_check LIKE '%building_users%' THEN 'WITH CHECK clause'
         ELSE 'Other'
       END as reference_type,
       qual, with_check
FROM pg_policies 
WHERE qual LIKE '%building_users%' 
   OR with_check LIKE '%building_users%'
ORDER BY tablename, policyname;

-- 2. Find ALL functions that reference building_users
SELECT 'Functions referencing building_users:' as section;
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%building_users%'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. Check for any triggers that might be causing issues
SELECT 'Triggers on building_users:' as section;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'building_users'
ORDER BY trigger_name;

-- 4. Check for any views that might reference building_users
SELECT 'Views referencing building_users:' as section;
SELECT table_name, view_definition
FROM information_schema.views
WHERE view_definition LIKE '%building_users%'
ORDER BY table_name;

-- 5. Show current RLS status
SELECT 'RLS Status:' as section;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('buildings', 'building_users', 'announcements', 'polls', 'issues')
ORDER BY tablename;

-- 6. Emergency fix - temporarily disable RLS on building_users to test
-- UNCOMMENT THE NEXT LINE ONLY FOR TESTING
-- ALTER TABLE building_users DISABLE ROW LEVEL SECURITY;

-- 7. Show all current policies on building_users specifically
SELECT 'All building_users policies:' as section;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'building_users'
ORDER BY policyname;
