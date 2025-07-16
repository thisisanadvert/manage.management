-- =====================================================
-- MIGRATION VERIFICATION TESTS
-- =====================================================

-- Test 1: Verify all new tables exist
SELECT 'Tables Created' as test_name, 
       COUNT(*) as tables_found,
       CASE WHEN COUNT(*) = 11 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_company_directors',
  'rtm_notices',
  'document_repository',
  'document_access_log',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
);

-- Test 2: Verify RLS is enabled on all new tables
SELECT 'RLS Enabled' as test_name,
       COUNT(*) as tables_with_rls,
       CASE WHEN COUNT(*) = 11 THEN 'PASS' ELSE 'FAIL' END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_company_directors',
  'rtm_notices',
  'document_repository',
  'document_access_log',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
)
AND c.relrowsecurity = true;

-- Test 3: Verify foreign key constraints exist
SELECT 'Foreign Keys' as test_name,
       COUNT(*) as foreign_keys_found,
       CASE WHEN COUNT(*) >= 10 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
AND table_name IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_company_directors',
  'rtm_notices',
  'document_repository',
  'document_access_log',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
);

-- Test 4: Verify indexes were created
SELECT 'Indexes Created' as test_name,
       COUNT(*) as indexes_found,
       CASE WHEN COUNT(*) >= 11 THEN 'PASS' ELSE 'FAIL' END as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND tablename IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_company_directors',
  'rtm_notices',
  'document_repository',
  'document_access_log',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
);

-- Test 5: Verify update triggers exist
SELECT 'Update Triggers' as test_name,
       COUNT(*) as triggers_found,
       CASE WHEN COUNT(*) >= 8 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.triggers
WHERE trigger_name LIKE '%updated_at%'
AND event_object_table IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_notices',
  'document_repository',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
);

-- Test 6: Verify policies exist
SELECT 'RLS Policies' as test_name,
       COUNT(*) as policies_found,
       CASE WHEN COUNT(*) >= 11 THEN 'PASS' ELSE 'FAIL' END as status
FROM pg_policies 
WHERE tablename IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_company_directors',
  'rtm_notices',
  'document_repository',
  'document_access_log',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
);

-- Test 7: Verify update_updated_at_column function exists
SELECT 'Update Function' as test_name,
       COUNT(*) as function_found,
       CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.routines
WHERE routine_name = 'update_updated_at_column'
AND routine_type = 'FUNCTION';

-- =====================================================
-- DETAILED TABLE STRUCTURE VERIFICATION
-- =====================================================

-- Show all new tables with their column counts
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_company_directors',
  'rtm_notices',
  'document_repository',
  'document_access_log',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
)
GROUP BY table_name
ORDER BY table_name;

-- Show all foreign key relationships
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN (
  'rtm_eligibility_assessments',
  'leaseholder_surveys', 
  'leaseholder_records',
  'rtm_company_formations',
  'rtm_company_directors',
  'rtm_notices',
  'document_repository',
  'document_access_log',
  'document_comments',
  'service_charge_demands',
  'section20_consultations'
)
ORDER BY tc.table_name, kcu.column_name;
