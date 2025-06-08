/*
  # Fix Issue Timeline RLS Policy

  1. Problem
    - Missing INSERT policy for issue_timeline table
    - When creating issues, the trigger tries to insert into issue_timeline but RLS blocks it
    - Error: "new row violates row-level security policy for table 'issue_timeline'"

  2. Solution
    - Add INSERT policy for issue_timeline table
    - Allow users to create timeline entries for issues in their buildings
    - Ensure triggers can execute properly
*/

-- Add missing INSERT policy for issue_timeline
CREATE POLICY "Users can create timeline entries for issues in their buildings"
  ON issue_timeline FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_timeline.issue_id
    AND bu.user_id = auth.uid()
  ));

-- Also add UPDATE policy for issue_timeline (in case needed)
CREATE POLICY "Users can update timeline entries for issues in their buildings"
  ON issue_timeline FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_timeline.issue_id
    AND bu.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_timeline.issue_id
    AND bu.user_id = auth.uid()
  ));

-- Ensure the trigger functions have proper security context
-- Update the log_issue_creation function to use SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the log_issue_status_change function to use SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the log_issue_comment function to use SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
