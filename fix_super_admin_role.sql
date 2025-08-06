-- Fix super-admin role for frankie@manage.management
-- Run this in your Supabase SQL Editor

-- Update the user metadata to set role as super-admin
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super-admin"}'::jsonb
WHERE email = 'frankie@manage.management';

-- Also update app_metadata if it exists
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "super-admin"}'::jsonb
WHERE email = 'frankie@manage.management';

-- Verify the update
SELECT 
  email,
  raw_user_meta_data->>'role' as user_role,
  raw_app_meta_data->>'role' as app_role,
  created_at
FROM auth.users 
WHERE email = 'frankie@manage.management';
