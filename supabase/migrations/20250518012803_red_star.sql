/*
  # Add location column to issues table

  1. Changes
    - Add location column to issues table as JSONB type
    - Update existing issues to use the new column format
    - Ensure backward compatibility

  2. Security
    - Maintains existing RLS policies
*/

-- Add location column to issues table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'issues' AND column_name = 'location'
  ) THEN
    ALTER TABLE issues ADD COLUMN location JSONB;
  END IF;
END $$;

-- Update existing issues to use the new location column format
UPDATE issues
SET location = jsonb_build_object(
  'unit', SPLIT_PART(location::text, ' - ', 1),
  'area', COALESCE(NULLIF(SPLIT_PART(location::text, ' - ', 2), ''), 'General Area')
)
WHERE location IS NOT NULL AND jsonb_typeof(location) IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN issues.location IS 'JSON object containing unit and area information for the issue location';