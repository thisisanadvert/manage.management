-- Fix new user onboarding and clean up demo data for real users
-- This migration ensures new users get a clean slate experience

-- Create announcements table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_pinned BOOLEAN DEFAULT FALSE,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for announcements
CREATE POLICY "Users can view announcements for their building" ON announcements
  FOR SELECT USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create announcements for their building" ON announcements
  FOR INSERT WITH CHECK (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own announcements" ON announcements
  FOR UPDATE USING (posted_by = auth.uid());

CREATE POLICY "Users can delete their own announcements" ON announcements
  FOR DELETE USING (posted_by = auth.uid());

-- Create function to clean up demo data for real users
CREATE OR REPLACE FUNCTION cleanup_demo_data_for_real_users()
RETURNS void AS $$
BEGIN
  -- Remove demo building associations for non-demo users
  DELETE FROM building_users 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
  AND user_id IN (
    SELECT id FROM auth.users 
    WHERE email NOT LIKE '%@demo.com' 
    AND (raw_user_meta_data->>'isDemo')::boolean IS NOT TRUE
  );

  -- Clean up user metadata for non-demo users who might have demo building IDs
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data - 'buildingId'
  WHERE email NOT LIKE '%@demo.com'
  AND (raw_user_meta_data->>'isDemo')::boolean IS NOT TRUE
  AND raw_user_meta_data->>'buildingId' = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';

  -- Reset onboarding for real users who might have been marked as complete incorrectly
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('onboardingComplete', false)
  WHERE email NOT LIKE '%@demo.com'
  AND (raw_user_meta_data->>'isDemo')::boolean IS NOT TRUE
  AND (raw_user_meta_data->>'needsBuildingSetup')::boolean IS TRUE;

END;
$$ LANGUAGE plpgsql;

-- Run the cleanup function
SELECT cleanup_demo_data_for_real_users();

-- Update the handle_new_user_signup function to ensure clean slate for new users
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_building_id uuid;
  v_user_metadata jsonb;
BEGIN
  -- Only process if this is a new signup with needsBuildingSetup flag
  IF NEW.raw_user_meta_data->>'needsBuildingSetup' = 'true' THEN
    v_role := NEW.raw_user_meta_data->>'role';
    
    -- Validate role
    IF v_role IS NULL OR v_role NOT IN ('rtm-director', 'sof-director', 'leaseholder', 'shareholder', 'management-company') THEN
      RAISE LOG 'Invalid or missing role for user %: %', NEW.email, v_role;
      RETURN NEW;
    END IF;

    -- Create a new building for the user
    INSERT INTO buildings (
      name,
      address,
      management_structure,
      management_type,
      created_by
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'buildingName', 'My Building'),
      COALESCE(NEW.raw_user_meta_data->>'buildingAddress', ''),
      CASE 
        WHEN v_role LIKE 'rtm-%' THEN 'rtm'
        WHEN v_role LIKE 'sof-%' THEN 'share-of-freehold'
        ELSE 'landlord-managed'
      END,
      CASE 
        WHEN v_role LIKE 'rtm-%' THEN 'Right to Manage'
        WHEN v_role LIKE 'sof-%' THEN 'Share of Freehold'
        ELSE 'Landlord Managed'
      END,
      NEW.id
    )
    RETURNING id INTO v_building_id;

    -- Create building_users entry with proper role conversion
    BEGIN
      INSERT INTO building_users (
        building_id,
        user_id,
        role
      ) VALUES (
        v_building_id,
        NEW.id,
        v_role::user_role
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating building_users entry: %', SQLERRM;
    END;

    -- Update user metadata with building ID and clean flags
    v_user_metadata := NEW.raw_user_meta_data || jsonb_build_object(
      'buildingId', v_building_id,
      'onboardingComplete', false,
      'needsBuildingSetup', false
    );
    
    UPDATE auth.users
    SET raw_user_meta_data = v_user_metadata
    WHERE id = NEW.id;
    
    -- Create onboarding steps for the user
    BEGIN
      PERFORM create_user_onboarding_steps(
        NEW.id,
        v_building_id,
        v_role
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating onboarding steps: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_building_id ON announcements(building_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements(is_pinned) WHERE is_pinned = true;

-- Add updated_at trigger for announcements
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Clean up any orphaned onboarding steps for users without buildings
DELETE FROM onboarding_steps 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email NOT LIKE '%@demo.com' 
  AND (raw_user_meta_data->>'isDemo')::boolean IS NOT TRUE
  AND raw_user_meta_data->>'buildingId' IS NULL
);
