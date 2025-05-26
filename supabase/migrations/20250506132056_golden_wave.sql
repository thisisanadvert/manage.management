/*
  # Create Interest Registrations Table

  1. New Tables
    - `interest_registrations`
      - Stores information about users who have registered interest
      - Tracks role, contact details, and building information

  2. Security
    - Enable RLS on the table
    - Add policies for proper access control
*/

-- Create interest registrations table
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

-- Create RLS policies
CREATE POLICY "Only admins can view interest registrations"
  ON interest_registrations
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Only admins can insert interest registrations"
  ON interest_registrations
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only admins can update interest registrations"
  ON interest_registrations
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS interest_registrations_email_idx ON interest_registrations (email);