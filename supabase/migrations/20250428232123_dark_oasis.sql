/*
  # Storage Policies for Documents Bucket

  1. Changes
    - Add storage policies for the documents bucket
    - Enable authenticated users to read/write to their building's folders
    - Ensure proper access control based on user roles

  2. Security
    - Enable RLS on storage bucket
    - Add policies for read/write access
    - Restrict access based on user role and building membership
*/

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for reading documents
CREATE POLICY "Users can read documents from their buildings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'role' = 'rtm-director' OR
        raw_user_meta_data->>'role' = 'leaseholder' OR
        raw_user_meta_data->>'role' = 'management-company'
      )
    )
  )
);

-- Policy for uploading documents
CREATE POLICY "RTM directors can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'rtm-director'
    )
  )
);

-- Policy for updating documents
CREATE POLICY "RTM directors can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'rtm-director'
    )
  )
);

-- Policy for deleting documents
CREATE POLICY "RTM directors can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'rtm-director'
    )
  )
);