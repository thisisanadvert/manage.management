/*
  # Fix authentication policies

  1. Changes
    - Add basic RLS policies for auth.users
    - Ensure public can create new users
    - Fix user authentication grants
    
  2. Security
    - Enable RLS on auth schema tables
    - Add policies for user authentication
*/

-- Enable RLS on auth schema tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public to create new users
CREATE POLICY "Public can create new users"
ON auth.users
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data"
ON auth.users
FOR SELECT
TO public
USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data"
ON auth.users
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticated;

-- Ensure authenticated role has necessary permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;