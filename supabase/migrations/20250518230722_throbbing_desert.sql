-- First, check if tables exist before creating them
DO $$ 
BEGIN
  -- Create issue_timeline table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issue_timeline') THEN
    CREATE TABLE issue_timeline (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      issue_id uuid REFERENCES issues(id),
      event_type text NOT NULL,
      description text NOT NULL,
      created_by uuid REFERENCES auth.users(id),
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- Create issue_comments table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issue_comments') THEN
    CREATE TABLE issue_comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      issue_id uuid REFERENCES issues(id),
      content text NOT NULL,
      author_id uuid REFERENCES auth.users(id),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS on these tables
ALTER TABLE issue_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view timeline for issues in their buildings" ON issue_timeline;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view comments for issues in their buildings" ON issue_comments;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create comments on issues in their buildings" ON issue_comments;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for issue_timeline
CREATE POLICY "Users can view timeline for issues in their buildings"
  ON issue_timeline FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_timeline.issue_id
    AND bu.user_id = auth.uid()
  ));

-- Create policies for issue_comments
CREATE POLICY "Users can view comments for issues in their buildings"
  ON issue_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_comments.issue_id
    AND bu.user_id = auth.uid()
  ));

CREATE POLICY "Users can create comments on issues in their buildings"
  ON issue_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_comments.issue_id
    AND bu.user_id = auth.uid()
  ));

-- Drop existing policies to recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "users_view_building_issues" ON issues;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "users_create_building_issues" ON issues;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "users_update_building_issues" ON issues;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Allow users to view issues in their buildings
CREATE POLICY "users_view_building_issues"
  ON issues FOR SELECT
  USING (
    building_id IN (
      SELECT building_id 
      FROM building_users
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to create issues in their buildings
CREATE POLICY "users_create_building_issues"
  ON issues FOR INSERT
  WITH CHECK (
    building_id IN (
      SELECT building_id 
      FROM building_users
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to update issues in their buildings
CREATE POLICY "users_update_building_issues"
  ON issues FOR UPDATE
  USING (
    building_id IN (
      SELECT building_id 
      FROM building_users
      WHERE user_id = auth.uid()
    )
  );

-- Create a function to automatically add a timeline entry when an issue status changes
CREATE OR REPLACE FUNCTION log_issue_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO issue_timeline (
      issue_id,
      event_type,
      description,
      created_by
    ) VALUES (
      NEW.id,
      'status_change',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for issue status changes
DROP TRIGGER IF EXISTS issue_status_change ON issues;
CREATE TRIGGER issue_status_change
  AFTER UPDATE OF status ON issues
  FOR EACH ROW
  EXECUTE FUNCTION log_issue_status_change();

-- Create a function to automatically add a timeline entry when a new issue is created
CREATE OR REPLACE FUNCTION log_issue_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO issue_timeline (
    issue_id,
    event_type,
    description,
    created_by
  ) VALUES (
    NEW.id,
    'created',
    'Issue reported',
    NEW.reported_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for issue creation
DROP TRIGGER IF EXISTS issue_creation ON issues;
CREATE TRIGGER issue_creation
  AFTER INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION log_issue_creation();

-- Create a function to automatically add a timeline entry when a comment is added
CREATE OR REPLACE FUNCTION log_issue_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO issue_timeline (
    issue_id,
    event_type,
    description,
    created_by
  ) VALUES (
    NEW.issue_id,
    'comment',
    'Comment added: ' || substring(NEW.content from 1 for 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END,
    NEW.author_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for issue comments
DROP TRIGGER IF EXISTS issue_comment ON issue_comments;
CREATE TRIGGER issue_comment
  AFTER INSERT ON issue_comments
  FOR EACH ROW
  EXECUTE FUNCTION log_issue_comment();

-- Add location column to issues table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'issues' AND column_name = 'location'
  ) THEN
    ALTER TABLE issues ADD COLUMN location JSONB;
    COMMENT ON COLUMN issues.location IS 'JSON object containing unit and area information for the issue location';
  END IF;
END $$;

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
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "users_access_building_documents" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "directors_upload_documents" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Add storage policies for documents bucket
CREATE POLICY "users_access_building_documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND (
      -- Allow users to access documents from their buildings
      SPLIT_PART(name, '/', 1) IN (
        SELECT building_id::text
        FROM building_users
        WHERE user_id = auth.uid()
      )
      OR
      -- Allow access to issue documents
      SPLIT_PART(name, '/', 1) = 'issues' AND
      EXISTS (
        SELECT 1 FROM issues i
        JOIN building_users bu ON bu.building_id = i.building_id
        WHERE i.id::text = SPLIT_PART(name, '/', 2)
        AND bu.user_id = auth.uid()
      )
    )
  );

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