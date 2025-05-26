/*
  # Add Issue Timeline and Comments Schema

  1. New Tables
    - `issue_timeline`
      - Tracks all events and updates for an issue
    - `issue_comments`
      - Stores user comments on issues
    - `issue_documents`
      - Links to uploaded files and documents

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create issue timeline table
CREATE TABLE IF NOT EXISTS issue_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES issues(id),
  event_type text NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create issue comments table
CREATE TABLE IF NOT EXISTS issue_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES issues(id),
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create issue documents table
CREATE TABLE IF NOT EXISTS issue_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES issues(id),
  file_name text NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE issue_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Issue timeline
CREATE POLICY "Users can view timeline for issues in their buildings"
  ON issue_timeline FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_timeline.issue_id
    AND bu.user_id = auth.uid()
  ));

-- Issue comments
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

-- Issue documents
CREATE POLICY "Users can view documents for issues in their buildings"
  ON issue_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_documents.issue_id
    AND bu.user_id = auth.uid()
  ));

CREATE POLICY "Users can upload documents to issues in their buildings"
  ON issue_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM issues i
    JOIN building_users bu ON bu.building_id = i.building_id
    WHERE i.id = issue_documents.issue_id
    AND bu.user_id = auth.uid()
  ));