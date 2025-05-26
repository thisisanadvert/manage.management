/*
  # Add display_order, route, title, and description to onboarding_steps

  1. Changes
    - Add display_order column to onboarding_steps table
    - Add route column to onboarding_steps table
    - Add title column to onboarding_steps table
    - Add description column to onboarding_steps table
    - These fields help with UI display and navigation
*/

-- Add columns to onboarding_steps if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_steps' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE onboarding_steps ADD COLUMN display_order integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_steps' AND column_name = 'route'
  ) THEN
    ALTER TABLE onboarding_steps ADD COLUMN route text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_steps' AND column_name = 'title'
  ) THEN
    ALTER TABLE onboarding_steps ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboarding_steps' AND column_name = 'description'
  ) THEN
    ALTER TABLE onboarding_steps ADD COLUMN description text;
  END IF;
END $$;

-- Create function to set up onboarding steps for new users
CREATE OR REPLACE FUNCTION create_user_onboarding_steps(
  p_user_id uuid,
  p_building_id uuid,
  p_role text
)
RETURNS void AS $$
BEGIN
  -- Profile Setup
  INSERT INTO onboarding_steps (
    user_id, 
    building_id, 
    step_name, 
    completed, 
    display_order, 
    route, 
    title, 
    description
  )
  VALUES (
    p_user_id,
    p_building_id,
    'profile',
    false,
    1,
    '/profile',
    'Complete Your Profile',
    'Add your personal information and contact details'
  );

  -- Building Setup
  INSERT INTO onboarding_steps (
    user_id, 
    building_id, 
    step_name, 
    completed, 
    display_order, 
    route, 
    title, 
    description
  )
  VALUES (
    p_user_id,
    p_building_id,
    'building',
    false,
    2,
    '/' || SPLIT_PART(p_role, '-', 1) || '/building-setup',
    'Building Information',
    'Add details about your building'
  );

  -- Documents
  INSERT INTO onboarding_steps (
    user_id, 
    building_id, 
    step_name, 
    completed, 
    display_order, 
    route, 
    title, 
    description
  )
  VALUES (
    p_user_id,
    p_building_id,
    'documents',
    false,
    3,
    '/' || SPLIT_PART(p_role, '-', 1) || '/documents',
    'Upload Documents',
    'Add important building documents'
  );

  -- Add role-specific steps
  IF p_role IN ('rtm-director', 'sof-director') THEN
    -- Financial Setup
    INSERT INTO onboarding_steps (
      user_id, 
      building_id, 
      step_name, 
      completed, 
      display_order, 
      route, 
      title, 
      description
    )
    VALUES (
      p_user_id,
      p_building_id,
      'financial_setup',
      false,
      4,
      '/' || SPLIT_PART(p_role, '-', 1) || '/finances',
      'Financial Setup',
      'Configure your financial information'
    );
    
    -- Member Invites
    INSERT INTO onboarding_steps (
      user_id, 
      building_id, 
      step_name, 
      completed, 
      display_order, 
      route, 
      title, 
      description
    )
    VALUES (
      p_user_id,
      p_building_id,
      'member_invites',
      false,
      5,
      '/' || SPLIT_PART(p_role, '-', 1) || '/members',
      'Invite Members',
      'Add other residents to your building'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to create onboarding steps for new users
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  v_building_id uuid;
BEGIN
  -- Create a building for the user if they're a director
  IF NEW.raw_user_meta_data->>'role' IN ('rtm-director', 'sof-director') THEN
    INSERT INTO buildings (
      name,
      address,
      total_units,
      management_structure
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'buildingName', 'My Building'),
      COALESCE(NEW.raw_user_meta_data->>'buildingAddress', 'Address not set'),
      1,
      CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'rtm-director' THEN 'rtm'
        ELSE 'share-of-freehold'
      END
    )
    RETURNING id INTO v_building_id;

    -- Create building_users entry
    INSERT INTO building_users (
      building_id,
      user_id,
      role
    ) VALUES (
      v_building_id,
      NEW.id,
      (NEW.raw_user_meta_data->>'role')::user_role
    );

    -- Create onboarding steps
    PERFORM create_user_onboarding_steps(
      NEW.id,
      v_building_id,
      NEW.raw_user_meta_data->>'role'
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();