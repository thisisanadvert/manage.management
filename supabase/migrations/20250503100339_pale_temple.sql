-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create types
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

DO $$ BEGIN
  CREATE TYPE management_structure AS ENUM (
    'rtm',
    'share-of-freehold',
    'landlord-managed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create tables
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

CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  unit_number text NOT NULL,
  floor_plan_type text,
  square_footage numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

-- Enable RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'buildings'
    AND policyname = 'Users can view buildings they belong to'
  ) THEN
    CREATE POLICY "Users can view buildings they belong to"
      ON buildings FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM building_users
        WHERE building_users.building_id = buildings.id
        AND building_users.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'units'
    AND policyname = 'Users can view units in their buildings'
  ) THEN
    CREATE POLICY "Users can view units in their buildings"
      ON units FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM building_users
        WHERE building_users.building_id = units.building_id
        AND building_users.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'building_users'
    AND policyname = 'view_building_users'
  ) THEN
    CREATE POLICY "view_building_users"
      ON building_users FOR SELECT
      USING (
        user_id = auth.uid() OR
        building_id IN (
          SELECT DISTINCT bu.building_id 
          FROM building_users bu 
          WHERE bu.user_id = auth.uid() 
          AND bu.role IN ('rtm-director', 'sof-director', 'management-company')
        )
      );
  END IF;
END $$;