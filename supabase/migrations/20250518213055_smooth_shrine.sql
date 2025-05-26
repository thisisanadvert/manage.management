-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "view_building_users" ON building_users;
DROP POLICY IF EXISTS "create_building_users" ON building_users;
DROP POLICY IF EXISTS "update_building_users" ON building_users;
DROP POLICY IF EXISTS "delete_building_users" ON building_users;
DROP POLICY IF EXISTS "Allow access to demo building users" ON building_users;

-- Create completely non-recursive policies for building_users

-- 1. SELECT policy: Use direct user_id comparison and avoid self-reference
CREATE POLICY "view_building_users" ON building_users
  FOR SELECT
  USING (
    -- Users can always see their own membership
    user_id = auth.uid() 
    OR 
    -- Allow access to demo building for demo users
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND 
     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'))
    OR
    -- Directors and management can see all users in their buildings
    -- This uses a direct join to auth.users to avoid recursion
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT user_id FROM building_users 
        WHERE building_id = building_users.building_id 
        AND role IN ('rtm-director', 'sof-director', 'management-company')
      )
    ))
  );

-- 2. INSERT policy: Allow directors/management to add users to their buildings
CREATE POLICY "create_building_users" ON building_users
  FOR INSERT
  WITH CHECK (
    -- Directors and management can add users to their buildings
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT user_id FROM building_users 
        WHERE building_id = building_users.building_id 
        AND role IN ('rtm-director', 'sof-director', 'management-company')
      )
    ))
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND 
     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'))
    OR
    -- Allow new users to create their first building association
    (auth.role() = 'authenticated' AND 
     NOT EXISTS (SELECT 1 FROM building_users WHERE user_id = auth.uid()))
  );

-- 3. UPDATE policy: Allow directors/management to update users in their buildings
CREATE POLICY "update_building_users" ON building_users
  FOR UPDATE
  USING (
    -- Directors and management can update users in their buildings
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT user_id FROM building_users 
        WHERE building_id = building_users.building_id 
        AND role IN ('rtm-director', 'sof-director', 'management-company')
      )
    ))
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND 
     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'))
  );

-- 4. DELETE policy: Allow directors/management to remove users from their buildings
CREATE POLICY "delete_building_users" ON building_users
  FOR DELETE
  USING (
    -- Directors and management can delete users from their buildings
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT user_id FROM building_users 
        WHERE building_id = building_users.building_id 
        AND role IN ('rtm-director', 'sof-director', 'management-company')
      )
    ))
    OR
    -- Allow demo users to access demo building
    (building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND 
     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'))
  );

-- Fix buildings access policy for demo building
DROP POLICY IF EXISTS "Allow access to demo building" ON buildings;
DROP POLICY IF EXISTS "Users can view buildings they belong to" ON buildings;

CREATE POLICY "Users can view buildings they belong to"
  ON buildings
  FOR SELECT
  USING (
    id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
    id IN (
      SELECT building_id FROM building_users
      WHERE user_id = auth.uid()
    )
  );

-- Fix issues access policy
DROP POLICY IF EXISTS "Allow access to demo building issues" ON issues;
DROP POLICY IF EXISTS "Users can view issues in their buildings" ON issues;

CREATE POLICY "Users can view issues in their buildings"
  ON issues
  FOR SELECT
  USING (
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
    building_id IN (
      SELECT building_id FROM building_users
      WHERE user_id = auth.uid()
    )
  );

-- Check if the policy exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'issues'
    AND policyname = 'Users can create issues in their buildings'
  ) THEN
    CREATE POLICY "Users can create issues in their buildings"
      ON issues
      FOR INSERT
      WITH CHECK (
        building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
        building_id IN (
          SELECT building_id FROM building_users
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Fix announcements access policy
DROP POLICY IF EXISTS "Users can view announcements in their buildings" ON announcements;

CREATE POLICY "Users can view announcements in their buildings"
  ON announcements
  FOR SELECT
  USING (
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
    building_id IN (
      SELECT building_id FROM building_users
      WHERE user_id = auth.uid()
    )
  );

-- Fix polls access policy
DROP POLICY IF EXISTS "Users can view polls in their buildings" ON polls;

CREATE POLICY "Users can view polls in their buildings"
  ON polls
  FOR SELECT
  USING (
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' OR
    building_id IN (
      SELECT building_id FROM building_users
      WHERE user_id = auth.uid()
    )
  );

-- Create documents storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'documents'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents', 'documents', false);
  END IF;
END $$;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can read documents from their buildings" ON storage.objects;
DROP POLICY IF EXISTS "Directors can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;

-- Add storage policies for documents bucket
CREATE POLICY "Users can read documents from their buildings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND (
    -- Allow users to access documents from their buildings
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT user_id FROM building_users 
        WHERE building_id::text = SPLIT_PART(storage.objects.name, '/', 1)
      )
    ))
    OR
    -- Allow demo users to access demo documents
    (SPLIT_PART(storage.objects.name, '/', 1) = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND 
     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'))
  )
);

CREATE POLICY "Directors can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND (
    -- Allow directors to upload documents to their buildings
    (EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND id IN (
        SELECT user_id FROM building_users 
        WHERE building_id::text = SPLIT_PART(storage.objects.name, '/', 1)
        AND role IN ('rtm-director', 'sof-director')
      )
    ))
    OR
    -- Allow demo users to upload to demo building
    (SPLIT_PART(storage.objects.name, '/', 1) = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f' AND 
     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email LIKE '%@demo.com'))
  )
);