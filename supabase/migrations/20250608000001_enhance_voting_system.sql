/*
  # Enhanced Voting System

  1. New Tables
    - `poll_options` - Support multiple choice and ranked voting
    - `poll_attachments` - File attachments for polls
    - `poll_comments` - Comments and discussion on polls
    - Enhanced `polls` table with new poll types

  2. Poll Types Supported
    - Binary (Yes/No/Abstain)
    - Multiple Choice (Supplier Selection)
    - Ranked Choice (Project Prioritization)
    - Rating Scale (Satisfaction Surveys)
    - Date Selection (Meeting Scheduling)

  3. Features
    - File attachments (quotes, documents)
    - Comments and discussion
    - Anonymous voting option
    - Real-time results
*/

-- Add new columns to polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS poll_type text DEFAULT 'binary';
ALTER TABLE polls ADD COLUMN IF NOT EXISTS voting_method text DEFAULT 'single_choice';
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_comments boolean DEFAULT true;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_anonymous boolean DEFAULT false;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS show_results_during boolean DEFAULT false;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS attachments_allowed boolean DEFAULT true;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS max_selections integer DEFAULT 1;

-- Create poll options table for multiple choice polls
CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  option_description text,
  option_order integer NOT NULL DEFAULT 0,
  attachment_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create poll attachments table
CREATE TABLE IF NOT EXISTS poll_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create poll comments table
CREATE TABLE IF NOT EXISTS poll_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  parent_comment_id uuid REFERENCES poll_comments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhance poll_votes table to support multiple options and rankings
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS option_id uuid REFERENCES poll_options(id);
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS ranking integer;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS rating integer;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Drop the unique constraint to allow multiple votes per poll (for ranked choice)
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_poll_id_user_id_key;

-- Add new unique constraint that allows multiple votes but prevents duplicate option votes
ALTER TABLE poll_votes ADD CONSTRAINT poll_votes_unique_option 
  UNIQUE(poll_id, user_id, option_id);

-- Enable RLS on new tables
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poll_options
CREATE POLICY "Users can view poll options in their buildings"
  ON poll_options FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM polls p
    JOIN building_users bu ON bu.building_id = p.building_id
    WHERE p.id = poll_options.poll_id
    AND bu.user_id = auth.uid()
  ));

CREATE POLICY "Poll creators can manage poll options"
  ON poll_options FOR ALL
  USING (EXISTS (
    SELECT 1 FROM polls p
    WHERE p.id = poll_options.poll_id
    AND p.created_by = auth.uid()
  ));

-- RLS Policies for poll_attachments
CREATE POLICY "Users can view poll attachments in their buildings"
  ON poll_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM polls p
    JOIN building_users bu ON bu.building_id = p.building_id
    WHERE p.id = poll_attachments.poll_id
    AND bu.user_id = auth.uid()
  ));

CREATE POLICY "Users can upload poll attachments"
  ON poll_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM polls p
    JOIN building_users bu ON bu.building_id = p.building_id
    WHERE p.id = poll_attachments.poll_id
    AND bu.user_id = auth.uid()
  ));

-- RLS Policies for poll_comments
CREATE POLICY "Users can view poll comments in their buildings"
  ON poll_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM polls p
    JOIN building_users bu ON bu.building_id = p.building_id
    WHERE p.id = poll_comments.poll_id
    AND bu.user_id = auth.uid()
  ));

CREATE POLICY "Users can create poll comments"
  ON poll_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM polls p
    JOIN building_users bu ON bu.building_id = p.building_id
    WHERE p.id = poll_comments.poll_id
    AND bu.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own comments"
  ON poll_comments FOR UPDATE
  USING (user_id = auth.uid());

-- Update poll_votes RLS policy to handle new voting methods
DROP POLICY IF EXISTS "Users can vote once per poll" ON poll_votes;

CREATE POLICY "Users can vote in their building polls"
  ON poll_votes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM polls p
    JOIN building_users bu ON bu.building_id = p.building_id
    WHERE p.id = poll_votes.poll_id
    AND bu.user_id = auth.uid()
    AND p.status = 'active'
    AND p.start_date <= NOW()
    AND p.end_date >= NOW()
  ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_attachments_poll_id ON poll_attachments(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_comments_poll_id ON poll_comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON poll_votes(option_id);

-- Create function to get poll results
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  poll_record polls%ROWTYPE;
  result jsonb := '{}';
BEGIN
  SELECT * INTO poll_record FROM polls WHERE id = poll_uuid;
  
  IF poll_record.poll_type = 'binary' THEN
    -- Binary poll results
    SELECT jsonb_build_object(
      'total_votes', COUNT(*),
      'yes', COUNT(*) FILTER (WHERE vote = 'yes'),
      'no', COUNT(*) FILTER (WHERE vote = 'no'),
      'abstain', COUNT(*) FILTER (WHERE vote = 'abstain')
    ) INTO result
    FROM poll_votes WHERE poll_id = poll_uuid;
    
  ELSIF poll_record.poll_type = 'multiple_choice' THEN
    -- Multiple choice results
    SELECT jsonb_agg(
      jsonb_build_object(
        'option_id', po.id,
        'option_text', po.option_text,
        'votes', COALESCE(vote_counts.count, 0)
      )
    ) INTO result
    FROM poll_options po
    LEFT JOIN (
      SELECT option_id, COUNT(*) as count
      FROM poll_votes 
      WHERE poll_id = poll_uuid
      GROUP BY option_id
    ) vote_counts ON po.id = vote_counts.option_id
    WHERE po.poll_id = poll_uuid;
    
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add sample enhanced polls
INSERT INTO polls (
  building_id, title, description, category, poll_type, voting_method,
  required_majority, start_date, end_date, status, created_by,
  allow_comments, show_results_during, max_selections
) VALUES
(
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  'CCTV System Supplier Selection',
  'Choose the best supplier for our new CCTV security system installation. Please review the attached quotes and specifications.',
  'Supplier Selection',
  'multiple_choice',
  'single_choice',
  50,
  NOW(),
  NOW() + INTERVAL '14 days',
  'active',
  (SELECT id FROM auth.users WHERE email = 'rtm@demo.com' LIMIT 1),
  true,
  true,
  1
),
(
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  'Building Improvement Priorities',
  'Rank the following improvement projects in order of priority for the next financial year.',
  'Project Prioritisation',
  'multiple_choice',
  'ranked_choice',
  50,
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '21 days',
  'upcoming',
  (SELECT id FROM auth.users WHERE email = 'sof@demo.com' LIMIT 1),
  true,
  false,
  5
),
(
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  'AGM Date Selection',
  'Select all dates you are available for the Annual General Meeting.',
  'Date Scheduling',
  'multiple_choice',
  'multi_select',
  50,
  NOW(),
  NOW() + INTERVAL '10 days',
  'active',
  (SELECT id FROM auth.users WHERE email = 'management@demo.com' LIMIT 1),
  false,
  true,
  3
);

-- Add poll options for CCTV supplier selection
INSERT INTO poll_options (poll_id, option_text, option_description, option_order)
SELECT p.id, option_text, option_description, option_order
FROM polls p,
(VALUES
  ('SecureVision Ltd', 'Complete 16-camera system with 4K resolution, night vision, and mobile app. 3-year warranty. £8,500', 1),
  ('Guardian Security', '12-camera HD system with cloud storage and professional monitoring. 2-year warranty. £6,200', 2),
  ('TechWatch Pro', '20-camera system with AI detection, facial recognition, and 5-year warranty. £12,000', 3)
) AS options(option_text, option_description, option_order)
WHERE p.title = 'CCTV System Supplier Selection';

-- Add poll options for building improvements
INSERT INTO poll_options (poll_id, option_text, option_description, option_order)
SELECT p.id, option_text, option_description, option_order
FROM polls p,
(VALUES
  ('Roof Repairs', 'Fix leaking roof sections and replace damaged tiles. Est. £15,000', 1),
  ('Garden Landscaping', 'Redesign communal garden with new seating and lighting. Est. £8,000', 2),
  ('Entrance Renovation', 'Modernize main entrance with new doors and intercom. Est. £12,000', 3),
  ('Bike Storage', 'Install secure bike storage area in basement. Est. £5,000', 4),
  ('EV Charging Points', 'Install 4 electric vehicle charging stations. Est. £10,000', 5)
) AS options(option_text, option_description, option_order)
WHERE p.title = 'Building Improvement Priorities';

-- Add poll options for AGM dates
INSERT INTO poll_options (poll_id, option_text, option_description, option_order)
SELECT p.id, option_text, option_description, option_order
FROM polls p,
(VALUES
  ('Saturday, June 14th - 10:00 AM', 'Weekend morning session in community room', 1),
  ('Wednesday, June 18th - 7:00 PM', 'Weekday evening session in community room', 2),
  ('Saturday, June 21st - 2:00 PM', 'Weekend afternoon session in community room', 3),
  ('Thursday, June 26th - 6:30 PM', 'Weekday evening session in community room', 4)
) AS options(option_text, option_description, option_order)
WHERE p.title = 'AGM Date Selection';

SELECT 'Enhanced voting system migration completed!' as status;
