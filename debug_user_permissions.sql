-- Debug user permissions for document upload/deletion issues
-- Run these queries in your Supabase SQL Editor to diagnose the problem

-- 1. Check the user's role and metadata
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'buildingId' as building_id,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'basiliobaeza@hotmail.com';

-- 2. Check building_users table for this user
SELECT 
  bu.id,
  bu.user_id,
  bu.building_id,
  bu.role,
  bu.created_at
FROM building_users bu
JOIN auth.users u ON u.id = bu.user_id
WHERE u.email = 'basiliobaeza@hotmail.com';

-- 3. Check what storage policies exist
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%document%';

-- 4. Check if documents bucket exists
SELECT * FROM storage.buckets WHERE name = 'documents';

-- 5. Check document_repository permissions
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'document_repository' 
AND schemaname = 'public';

-- 6. Test if user can see their building documents
SELECT 
  dr.id,
  dr.title,
  dr.file_name,
  dr.building_id,
  dr.uploaded_by
FROM document_repository dr
JOIN building_users bu ON bu.building_id = dr.building_id
JOIN auth.users u ON u.id = bu.user_id
WHERE u.email = 'basiliobaeza@hotmail.com'
LIMIT 5;
