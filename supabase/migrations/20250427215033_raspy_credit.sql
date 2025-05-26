/*
  # Core Database Schema

  1. New Tables
    - `buildings`
      - Building details and management information
    - `units`
      - Individual units/apartments within buildings
    - `issues`
      - Maintenance and repair issues
    - `announcements`
      - Building-wide announcements
    - `polls`
      - Voting records and results
    - `building_users`
      - Links users to buildings with roles

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  total_units integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Units table
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  unit_number text NOT NULL,
  floor_plan_type text,
  square_footage numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  reported_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  posted_by uuid REFERENCES auth.users(id),
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  required_majority integer NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id),
  user_id uuid REFERENCES auth.users(id),
  vote text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Building users table
CREATE TABLE IF NOT EXISTS building_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL,
  unit_id uuid REFERENCES units(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(building_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Buildings
CREATE POLICY "Users can view buildings they belong to"
  ON buildings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = buildings.id
      AND building_users.user_id = auth.uid()
    )
  );

-- Units
CREATE POLICY "Users can view units in their buildings"
  ON units
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = units.building_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Issues
CREATE POLICY "Users can view issues in their buildings"
  ON issues
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = issues.building_id
      AND building_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create issues in their buildings"
  ON issues
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = issues.building_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Announcements
CREATE POLICY "Users can view announcements in their buildings"
  ON announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = announcements.building_id
      AND building_users.user_id = auth.uid()
    )
  );

CREATE POLICY "RTM directors and management can create announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = announcements.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'management-company')
    )
  );

-- Polls
CREATE POLICY "Users can view polls in their buildings"
  ON polls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = polls.building_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Poll votes
CREATE POLICY "Users can view votes in their buildings"
  ON poll_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users bu
      JOIN polls p ON p.building_id = bu.building_id
      WHERE p.id = poll_votes.poll_id
      AND bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can vote once per poll"
  ON poll_votes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM building_users bu
      JOIN polls p ON p.building_id = bu.building_id
      WHERE p.id = poll_votes.poll_id
      AND bu.user_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM poll_votes
      WHERE poll_id = poll_votes.poll_id
      AND user_id = auth.uid()
    )
  );

-- Building users
CREATE POLICY "Users can view members in their buildings"
  ON building_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users bu2
      WHERE bu2.building_id = building_users.building_id
      AND bu2.user_id = auth.uid()
    )
  );