/*
  # Add Building Profile Fields

  1. Changes
    - Add new fields to buildings table for enhanced profiles:
      - building_age: Age of the building in years
      - building_type: Type of building (e.g., Apartment Block, Mixed Use)
      - service_charge_frequency: How often service charges are collected
      - management_type: Type of management structure

  2. Security
    - Maintains existing RLS policies
    - No changes to access control required
*/

DO $$ 
BEGIN
  -- Add building_age column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'building_age'
  ) THEN
    ALTER TABLE buildings ADD COLUMN building_age integer;
  END IF;

  -- Add building_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'building_type'
  ) THEN
    ALTER TABLE buildings ADD COLUMN building_type text;
  END IF;

  -- Add service_charge_frequency column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'service_charge_frequency'
  ) THEN
    ALTER TABLE buildings ADD COLUMN service_charge_frequency text;
  END IF;

  -- Add management_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'buildings' AND column_name = 'management_type'
  ) THEN
    ALTER TABLE buildings ADD COLUMN management_type text;
  END IF;
END $$;