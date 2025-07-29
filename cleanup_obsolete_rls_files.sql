-- Cleanup Script for Obsolete RLS Files and Policies
-- Run this in Supabase SQL Editor AFTER applying the canonical migrations

-- ============================================================================
-- STEP 1: Verify Canonical Policies Are Applied
-- ============================================================================

-- Check that our canonical helper functions exist
SELECT 'Canonical Helper Functions Status:' as section;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'is_super_admin',
  'is_building_director', 
  'is_building_member',
  'user_has_no_buildings'
)
AND routine_schema = 'public'
ORDER BY routine_name;

-- Check that canonical policies exist
SELECT 'Canonical Policies Status:' as section;
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE policyname LIKE 'canonical_%'
ORDER BY tablename, policyname;

-- ============================================================================
-- STEP 2: Identify Remaining Problematic Policies
-- ============================================================================

-- Find any remaining policies that use old helper functions
SELECT 'Remaining Problematic Policies:' as section;
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE (
  qual LIKE '%is_building_admin%' OR
  with_check LIKE '%is_building_admin%' OR
  qual LIKE '%user_has_building_access%' OR
  with_check LIKE '%user_has_building_access%'
)
AND policyname NOT LIKE 'canonical_%'
ORDER BY tablename, policyname;

-- Find any remaining old helper functions
SELECT 'Remaining Old Helper Functions:' as section;
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name IN (
  'is_building_admin',
  'user_has_building_access'
)
AND routine_schema = 'public'
ORDER BY routine_name;

-- ============================================================================
-- STEP 3: Clean Up Remaining Issues
-- ============================================================================

-- Drop any remaining old helper functions
DROP FUNCTION IF EXISTS is_building_admin(uuid);
DROP FUNCTION IF EXISTS user_has_building_access(uuid);

-- Drop any remaining problematic policies on MRI tables
DO $$
DECLARE
    table_name text;
    policy_name text;
    mri_tables text[] := ARRAY[
        'mri_auth_tokens', 'mri_budgets', 'mri_invoices', 'mri_maintenance',
        'mri_residents', 'mri_sync_status', 'mri_audit_log'
    ];
BEGIN
    FOREACH table_name IN ARRAY mri_tables
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name) THEN
            -- Drop old policies that might use problematic functions
            FOR policy_name IN 
                SELECT policyname FROM pg_policies 
                WHERE tablename = table_name 
                AND (
                    qual LIKE '%is_building_admin%' OR
                    with_check LIKE '%is_building_admin%' OR
                    qual LIKE '%user_has_building_access%' OR
                    with_check LIKE '%user_has_building_access%'
                )
            LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
            END LOOP;
            
            -- Create canonical policies for MRI tables
            EXECUTE format('
                CREATE POLICY canonical_%s_select ON %I
                FOR SELECT TO authenticated
                USING (
                    is_super_admin() OR
                    is_building_member(building_id)
                )', table_name, table_name);
                
            EXECUTE format('
                CREATE POLICY canonical_%s_manage ON %I
                FOR ALL TO authenticated
                USING (
                    is_super_admin() OR
                    is_building_director(building_id)
                )
                WITH CHECK (
                    is_super_admin() OR
                    is_building_director(building_id)
                )', table_name, table_name);
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Final Verification
-- ============================================================================

-- Verify no problematic policies remain
SELECT 'Final Check - Should Be Empty:' as section;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE (
  qual LIKE '%is_building_admin%' OR
  with_check LIKE '%is_building_admin%' OR
  qual LIKE '%user_has_building_access%' OR
  with_check LIKE '%user_has_building_access%'
)
AND policyname NOT LIKE 'canonical_%'
ORDER BY tablename, policyname;

-- Show summary of all canonical policies
SELECT 'All Canonical Policies Summary:' as section;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE policyname LIKE 'canonical_%'
GROUP BY tablename
ORDER BY tablename;

-- Show all tables with RLS enabled
SELECT 'Tables with RLS Enabled:' as section;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE rowsecurity = true
AND schemaname = 'public'
ORDER BY tablename;

-- Test basic functionality
SELECT 'Basic Functionality Test:' as section;
SELECT 
  'Super Admin Check' as test,
  is_super_admin() as result
UNION ALL
SELECT 
  'Demo Building Member Check' as test,
  is_building_member('b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid) as result
UNION ALL
SELECT 
  'User Has No Buildings Check' as test,
  user_has_no_buildings() as result;
