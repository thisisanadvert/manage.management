-- Fix document deletion policy for storage.objects
-- This migration adds the missing DELETE policy that prevents users from deleting documents

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "users_delete_documents" ON storage.objects;

-- Create DELETE policy for documents storage bucket
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

-- Also update the upload policy to include rmc-director role
DROP POLICY IF EXISTS "users_upload_documents" ON storage.objects;

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
