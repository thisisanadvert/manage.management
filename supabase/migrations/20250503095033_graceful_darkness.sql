-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create role types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'rtm-director',
    'sof-director',
    'leaseholder',
    'shareholder',
    'management-company'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create management structure type
DO $$ BEGIN
  CREATE TYPE management_structure AS ENUM (
    'rtm',
    'share-of-freehold',
    'landlord-managed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  total_units integer NOT NULL,
  building_type text,
  management_structure management_structure NOT NULL,
  building_age integer,
  service_charge_frequency text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  unit_number text NOT NULL,
  floor_plan_type text,
  square_footage numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create building_users table
CREATE TABLE IF NOT EXISTS building_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  user_id uuid REFERENCES auth.users(id),
  role user_role NOT NULL,
  unit_id uuid REFERENCES units(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(building_id, user_id)
);

-- Create issues table
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

-- Create announcements table
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

-- Create polls table
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

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id),
  user_id uuid REFERENCES auth.users(id),
  vote text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Create onboarding_status table
CREATE TABLE IF NOT EXISTS onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  building_id uuid REFERENCES buildings(id),
  profile_completed boolean DEFAULT false,
  building_setup_completed boolean DEFAULT false,
  documents_uploaded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;