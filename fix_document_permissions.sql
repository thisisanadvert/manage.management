-- Fix document upload and deletion permissions
-- Run this in your Supabase SQL Editor to fix the document repository issues

-- IMPORTANT: First add the missing 'rmc-director' role to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'rmc-director';

-- First, let's check what storage policies currently exist
-- You can run this query to see current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_delete_documents" ON storage.objects;
DROP POLICY IF EXISTS "users_upload_documents" ON storage.objects;

-- Create comprehensive upload policy that includes all director roles
CREATE POLICY "users_upload_documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND (
      -- Allow directors to upload documents to their buildings
      SPLIT_PART(name, '/', 1) IN (
        SELECT building_id::text
        FROM building_users
        WHERE user_id = auth.uid()
        AND role IN ('rtm-director', 'sof-director', 'rmc-director')
      )
      OR
      -- Allow users to upload issue documents
      SPLIT_PART(name, '/', 1) = 'issues' AND
      EXISTS (
        SELECT 1 FROM issues i
        JOIN building_users bu ON bu.building_id = i.building_id
        WHERE i.id::text = SPLIT_PART(name, '/', 2)
        AND bu.user_id = auth.uid()
      )
    )
  );

-- Create DELETE policy for documents storage bucket (THIS WAS MISSING!)
CREATE POLICY "users_delete_documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND (
      -- Allow directors to delete documents from their buildings
      SPLIT_PART(name, '/', 1) IN (
        SELECT building_id::text
        FROM building_users
        WHERE user_id = auth.uid()
        AND role IN ('rtm-director', 'sof-director', 'rmc-director')
      )
      OR
      -- Allow users to delete issue documents they uploaded
      SPLIT_PART(name, '/', 1) = 'issues' AND
      EXISTS (
        SELECT 1 FROM issues i
        JOIN building_users bu ON bu.building_id = i.building_id
        WHERE i.id::text = SPLIT_PART(name, '/', 2)
        AND bu.user_id = auth.uid()
      )
    )
  );

-- Verify the policies were created successfully
-- You can run this to check:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%documents%';
