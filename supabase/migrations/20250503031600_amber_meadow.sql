/*
  # User Authentication Setup

  1. New Functions
    - `handle_new_user_signup`: Handles new user registration
      - Creates initial user records
      - Sets up proper role assignments
      - Ensures proper authentication flow

  2. Security
    - Function is security definer to run with elevated privileges
    - Proper error handling for edge cases
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  building_id uuid;
BEGIN
  -- Create a demo building if the user is a director
  IF NEW.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director') THEN
    INSERT INTO buildings (
      name,
      address,
      total_units,
      management_structure
    ) VALUES (
      NEW.raw_user_meta_data->>'buildingName',
      NEW.raw_user_meta_data->>'buildingAddress',
      3,
      CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'rtm-director' THEN 'rtm'
        ELSE 'share-of-freehold'
      END
    )
    RETURNING id INTO building_id;

    -- Create building_users entry
    INSERT INTO building_users (
      building_id,
      user_id,
      role
    ) VALUES (
      building_id,
      NEW.id,
      (NEW.raw_user_meta_data->>'role')::user_role
    );

    -- Create demo units
    INSERT INTO units (building_id, unit_number)
    VALUES
      (building_id, '101'),
      (building_id, '102'),
      (building_id, '103');

  -- Handle other user types
  ELSIF NEW.raw_user_meta_data->>'role' IN ('leaseholder', 'shareholder', 'management-company') THEN
    -- For demo purposes, we'll create a basic building if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM buildings LIMIT 1) THEN
      INSERT INTO buildings (
        name,
        address,
        total_units,
        management_structure
      ) VALUES (
        'Demo Building',
        '123 Demo Street',
        3,
        'rtm'
      )
      RETURNING id INTO building_id;

      -- Create demo units if they don't exist
      INSERT INTO units (building_id, unit_number)
      VALUES
        (building_id, '101'),
        (building_id, '102'),
        (building_id, '103');
    ELSE
      SELECT id INTO building_id FROM buildings LIMIT 1;
    END IF;

    -- Create building_users entry
    INSERT INTO building_users (
      building_id,
      user_id,
      role,
      unit_id
    ) VALUES (
      building_id,
      NEW.id,
      (NEW.raw_user_meta_data->>'role')::user_role,
      CASE 
        WHEN NEW.raw_user_meta_data->>'unitNumber' IS NOT NULL THEN
          (SELECT id FROM units WHERE building_id = building_id AND unit_number = NEW.raw_user_meta_data->>'unitNumber' LIMIT 1)
        ELSE NULL
      END
    );
  END IF;

  -- Initialize onboarding status
  INSERT INTO onboarding_status (
    user_id,
    building_id,
    profile_completed,
    building_setup_completed,
    documents_uploaded
  ) VALUES (
    NEW.id,
    building_id,
    NEW.raw_user_meta_data->>'onboardingComplete' = 'true',
    NEW.raw_user_meta_data->>'onboardingComplete' = 'true',
    NEW.raw_user_meta_data->>'onboardingComplete' = 'true'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Ensure RLS is enabled on all relevant tables
ALTER TABLE public.building_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_status ENABLE ROW LEVEL SECURITY;