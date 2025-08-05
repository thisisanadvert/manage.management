-- Quick diagnostic to check user permissions for document deletion
-- Run this in Supabase SQL Editor to check the specific user's setup

-- 1. Check the user's role and building association
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  bu.role as building_role,
  bu.building_id,
  u.raw_user_meta_data->>'buildingId' as metadata_building_id
FROM auth.users u
LEFT JOIN building_users bu ON bu.user_id = u.id
WHERE u.email = 'basiliobaeza@hotmail.com';

-- 2. Check if the storage policies exist
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%document%';

-- 3. Check if the user_role enum includes rmc-director
SELECT unnest(enum_range(NULL::user_role)) as available_roles;

-- 4. Check a specific document to see its path structure
SELECT 
  id,
  title,
  file_path,
  building_id,
  uploaded_by
FROM document_repository 
WHERE title LIKE '%PATCHBM1355%'
LIMIT 1;
