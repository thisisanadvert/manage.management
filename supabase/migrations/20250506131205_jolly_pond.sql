-- Drop dependent tables with CASCADE to handle dependencies
DO $$ 
BEGIN
  -- Drop tables that might have dependencies
  DROP TABLE IF EXISTS poll_votes CASCADE;
  DROP TABLE IF EXISTS polls CASCADE;
  DROP TABLE IF EXISTS announcements CASCADE;
  DROP TABLE IF EXISTS issue_timeline CASCADE;
  DROP TABLE IF EXISTS issue_comments CASCADE;
  DROP TABLE IF EXISTS issue_documents CASCADE;
  DROP TABLE IF EXISTS issues CASCADE;
  DROP TABLE IF EXISTS onboarding_status CASCADE;
  DROP TABLE IF EXISTS onboarding_steps CASCADE;
  DROP TABLE IF EXISTS document_metadata CASCADE;
  DROP TABLE IF EXISTS onboarding_documents CASCADE;
  DROP TABLE IF EXISTS building_details CASCADE;
  DROP TABLE IF EXISTS share_certificates CASCADE;
  DROP TABLE IF EXISTS building_metrics CASCADE;
  DROP TABLE IF EXISTS building_health CASCADE;
  DROP TABLE IF EXISTS compliance_records CASCADE;
  DROP TABLE IF EXISTS compliance_requirements CASCADE;
  DROP TABLE IF EXISTS maintenance_schedule CASCADE;
  DROP TABLE IF EXISTS service_bookings CASCADE;
  DROP TABLE IF EXISTS transactions CASCADE;
  DROP TABLE IF EXISTS budgets CASCADE;
  DROP TABLE IF EXISTS service_charges CASCADE;
  DROP TABLE IF EXISTS building_users CASCADE;
  DROP TABLE IF EXISTS units CASCADE;
  DROP TABLE IF EXISTS buildings CASCADE;
  DROP TABLE IF EXISTS supplier_reviews CASCADE;
  DROP TABLE IF EXISTS supplier_services CASCADE;
  DROP TABLE IF EXISTS suppliers CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping tables: %', SQLERRM;
END $$;

-- Drop types safely
DO $$ 
BEGIN
  DROP TYPE IF EXISTS management_structure CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping management_structure type: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP TYPE IF EXISTS user_role CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping user_role type: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP TYPE IF EXISTS document_category CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping document_category type: %', SQLERRM;
END $$;

-- Drop views
DO $$ 
BEGIN
  DROP VIEW IF EXISTS role_hierarchy CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping role_hierarchy view: %', SQLERRM;
END $$;

-- Drop functions with specific signatures
DO $$ 
BEGIN
  -- Try to drop functions with various signatures
  DROP FUNCTION IF EXISTS public.validate_user_role(user_role) CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping validate_user_role function: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.is_building_admin(uuid) CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping is_building_admin function: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.create_initial_rtm_setup(uuid, text, text, text) CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping create_initial_rtm_setup function (4 params): %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.create_initial_rtm_setup(uuid, text, text, text, integer, integer, text, text) CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping create_initial_rtm_setup function (8 params): %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.handle_new_rtm_signup() CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping handle_new_rtm_signup function: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.handle_new_sof_signup() CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping handle_new_sof_signup function: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.create_sof_onboarding_steps(uuid, uuid) CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping create_sof_onboarding_steps function: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.update_onboarding_step() CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping update_onboarding_step function: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.handle_new_user_signup() CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping handle_new_user_signup function: %', SQLERRM;
END $$;

-- Drop triggers safely
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_rtm_signup ON auth.users CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping on_rtm_signup trigger: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_sof_signup ON auth.users CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping on_sof_signup trigger: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping on_auth_user_created trigger: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_profile_completion ON auth.users CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping update_profile_completion trigger: %', SQLERRM;
END $$;

-- These triggers depend on tables that might not exist anymore, so we'll skip them
-- but keep them commented for reference
/*
DROP TRIGGER IF EXISTS update_share_certificates ON share_certificates CASCADE;
DROP TRIGGER IF EXISTS update_building_details ON buildings CASCADE;
DROP TRIGGER IF EXISTS update_financial_setup ON service_charges CASCADE;
DROP TRIGGER IF EXISTS update_document_upload ON onboarding_documents CASCADE;
DROP TRIGGER IF EXISTS update_member_invites ON building_users CASCADE;
*/