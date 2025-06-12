-- Cleanup script for basiliobaeza@hotmail.com account
-- Run this in the Supabase SQL editor to fix the onboarding issues

-- 1. Remove any demo building associations
DELETE FROM building_users 
WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
AND user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'basiliobaeza@hotmail.com'
);

-- 2. Clean up user metadata to remove demo building ID
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'buildingId'
WHERE email = 'basiliobaeza@hotmail.com'
AND raw_user_meta_data->>'buildingId' = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f';

-- 3. Reset onboarding status to ensure proper flow
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'onboardingComplete', false,
  'needsBuildingSetup', true
)
WHERE email = 'basiliobaeza@hotmail.com';

-- 4. Remove any orphaned onboarding steps
DELETE FROM onboarding_steps 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'basiliobaeza@hotmail.com'
);

-- 5. Create announcements table if it doesn't exist
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

-- 6. Enable RLS on announcements if not already enabled
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for announcements (if they don't exist)
DO $$
BEGIN
  -- Check if policies exist before creating them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'announcements' 
    AND policyname = 'Users can view announcements for their building'
  ) THEN
    CREATE POLICY "Users can view announcements for their building" ON announcements
      FOR SELECT USING (
        building_id IN (
          SELECT building_id FROM building_users WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'announcements' 
    AND policyname = 'Users can create announcements for their building'
  ) THEN
    CREATE POLICY "Users can create announcements for their building" ON announcements
      FOR INSERT WITH CHECK (
        building_id IN (
          SELECT building_id FROM building_users WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'announcements' 
    AND policyname = 'Users can update their own announcements'
  ) THEN
    CREATE POLICY "Users can update their own announcements" ON announcements
      FOR UPDATE USING (posted_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'announcements' 
    AND policyname = 'Users can delete their own announcements'
  ) THEN
    CREATE POLICY "Users can delete their own announcements" ON announcements
      FOR DELETE USING (posted_by = auth.uid());
  END IF;
END $$;

-- 8. Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_announcements_building_id ON announcements(building_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements(is_pinned) WHERE is_pinned = true;

-- 9. Verify the cleanup
SELECT 
  email,
  raw_user_meta_data->>'buildingId' as building_id,
  raw_user_meta_data->>'onboardingComplete' as onboarding_complete,
  raw_user_meta_data->>'needsBuildingSetup' as needs_building_setup
FROM auth.users 
WHERE email = 'basiliobaeza@hotmail.com';
