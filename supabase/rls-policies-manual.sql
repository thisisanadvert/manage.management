-- Manual RLS Policies Application
-- Run this script in the Supabase SQL Editor to apply comprehensive RLS policies

-- Enable RLS on core voting tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

-- Polls policies
DROP POLICY IF EXISTS "Users can view polls in their buildings" ON polls;
CREATE POLICY "Users can view polls in their buildings" ON polls
  FOR SELECT USING (
    -- Super admin access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Building members access
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = polls.building_id
      AND building_users.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Directors can create polls" ON polls;
CREATE POLICY "Directors can create polls" ON polls
  FOR INSERT WITH CHECK (
    -- Super admin access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Directors can create polls for their buildings
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = polls.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'sof-director')
    )
  );

DROP POLICY IF EXISTS "Directors can update polls" ON polls;
CREATE POLICY "Directors can update polls" ON polls
  FOR UPDATE USING (
    -- Super admin access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Directors can update polls for their buildings
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = polls.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'sof-director')
    )
  );

-- Poll options policies
DROP POLICY IF EXISTS "Users can view poll options" ON poll_options;
CREATE POLICY "Users can view poll options" ON poll_options
  FOR SELECT USING (
    -- Super admin access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Users can view options for polls in their buildings
    EXISTS (
      SELECT 1 FROM polls
      JOIN building_users ON building_users.building_id = polls.building_id
      WHERE polls.id = poll_options.poll_id
      AND building_users.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Directors can manage poll options" ON poll_options;
CREATE POLICY "Directors can manage poll options" ON poll_options
  FOR ALL USING (
    -- Super admin access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Directors can manage options for polls in their buildings
    EXISTS (
      SELECT 1 FROM polls
      JOIN building_users ON building_users.building_id = polls.building_id
      WHERE polls.id = poll_options.poll_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'sof-director')
    )
  );

-- Poll votes policies
DROP POLICY IF EXISTS "Users can view their own votes" ON poll_votes;
CREATE POLICY "Users can view their own votes" ON poll_votes
  FOR SELECT USING (
    -- Super admin access
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
    OR
    -- Users can view their own votes
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can cast votes" ON poll_votes;
CREATE POLICY "Users can cast votes" ON poll_votes
  FOR INSERT WITH CHECK (
    -- Users can only vote as themselves
    user_id = auth.uid()
    AND
    -- And only for polls in their buildings
    EXISTS (
      SELECT 1 FROM polls
      JOIN building_users ON building_users.building_id = polls.building_id
      WHERE polls.id = poll_votes.poll_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Enable RLS on other common tables if they exist
DO $$
BEGIN
  -- Documents table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view documents in their buildings" ON documents;
    CREATE POLICY "Users can view documents in their buildings" ON documents
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = documents.building_id
          AND building_users.user_id = auth.uid()
        )
      );
  END IF;

  -- User profiles table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    CREATE POLICY "Users can view their own profile" ON user_profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        user_id = auth.uid()
      );
  END IF;

  -- Notifications table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    CREATE POLICY "Users can view their own notifications" ON notifications
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        user_id = auth.uid()
      );
  END IF;
END $$;

-- Add comment for tracking
COMMENT ON SCHEMA public IS 'Manual RLS policies applied on 2025-07-26';
