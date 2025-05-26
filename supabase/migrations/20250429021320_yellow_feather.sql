/*
  # RTM Director Onboarding Schema

  1. New Tables
    - `onboarding_steps`
      - Tracks completion of each onboarding step
    - `building_details`
      - Additional building information collected during onboarding
    - `onboarding_documents`
      - Required documents uploaded during onboarding

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create onboarding steps table
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  building_id uuid REFERENCES buildings(id),
  step_name text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create building details table
CREATE TABLE IF NOT EXISTS building_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) UNIQUE,
  building_age integer,
  building_type text,
  service_charge_frequency text,
  management_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create onboarding documents table
CREATE TABLE IF NOT EXISTS onboarding_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  document_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_steps
CREATE POLICY "Users can view their own onboarding steps"
  ON onboarding_steps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding steps"
  ON onboarding_steps
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for building_details
CREATE POLICY "Users can view building details they belong to"
  ON building_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = building_details.building_id
      AND building_users.user_id = auth.uid()
    )
  );

CREATE POLICY "RTM directors can update their building details"
  ON building_details
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = building_details.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role = 'rtm-director'
    )
  );

-- RLS Policies for onboarding_documents
CREATE POLICY "Users can view documents for their buildings"
  ON onboarding_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = onboarding_documents.building_id
      AND building_users.user_id = auth.uid()
    )
  );

CREATE POLICY "RTM directors can upload documents"
  ON onboarding_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = onboarding_documents.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role = 'rtm-director'
    )
  );

-- Add columns to buildings table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'building_age'
  ) THEN
    ALTER TABLE buildings ADD COLUMN building_age integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'building_type'
  ) THEN
    ALTER TABLE buildings ADD COLUMN building_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'service_charge_frequency'
  ) THEN
    ALTER TABLE buildings ADD COLUMN service_charge_frequency text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'management_type'
  ) THEN
    ALTER TABLE buildings ADD COLUMN management_type text;
  END IF;
END $$;