/*
  # Fix Interest Registrations Table

  1. Changes
    - Drops existing policies before recreating them
    - Ensures table exists with proper structure
    - Adds proper RLS policies with IF NOT EXISTS checks
*/

-- Create interest registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS interest_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL,
  phone text,
  building_name text,
  building_address text,
  unit_number text,
  company_name text,
  created_at timestamptz DEFAULT now(),
  contacted boolean DEFAULT false,
  contacted_at timestamptz,
  notes text
);

-- Enable RLS
ALTER TABLE interest_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Only admins can view interest registrations" ON interest_registrations;
DROP POLICY IF EXISTS "Only admins can insert interest registrations" ON interest_registrations;
DROP POLICY IF EXISTS "Only admins can update interest registrations" ON interest_registrations;

-- Create RLS policies with IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'interest_registrations'
    AND policyname = 'Only admins can view interest registrations'
  ) THEN
    CREATE POLICY "Only admins can view interest registrations"
      ON interest_registrations
      FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'interest_registrations'
    AND policyname = 'Only admins can insert interest registrations'
  ) THEN
    CREATE POLICY "Only admins can insert interest registrations"
      ON interest_registrations
      FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'interest_registrations'
    AND policyname = 'Only admins can update interest registrations'
  ) THEN
    CREATE POLICY "Only admins can update interest registrations"
      ON interest_registrations
      FOR UPDATE
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Create index on email for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS interest_registrations_email_idx ON interest_registrations (email);