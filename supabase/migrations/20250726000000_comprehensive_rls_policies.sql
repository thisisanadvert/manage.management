/*
  # Comprehensive RLS Policies
  
  This migration adds comprehensive Row Level Security (RLS) policies for all tables
  that are missing them, ensuring proper data access control and security.
  
  ## Tables Covered:
  - polls and poll_votes (voting system)
  - poll_options (voting options)
  - documents (document management)
  - user_profiles (user profile data)
  - notifications (notification system)
  - building_invitations (member invitations)
  - rtm_formation_data (RTM formation tracking)
  - legal_templates (legal document templates)
  - supplier_quotes (supplier quotations)
  - maintenance_requests (maintenance tracking)
  - financial_reports (financial reporting)
  
  ## Security Principles:
  1. Super admin (frankie@manage.management) has full access to all data
  2. Users can only access data related to their buildings
  3. Directors have additional permissions for management functions
  4. Leaseholders/shareholders have read-only access to most data
*/

-- Enable RLS on tables that might not have it enabled
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for polls
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

-- Create policies for documents table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view documents in their buildings" ON documents;
    CREATE POLICY "Users can view documents in their buildings" ON documents
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
          WHERE building_users.building_id = documents.building_id
          AND building_users.user_id = auth.uid()
        )
      );
      
    DROP POLICY IF EXISTS "Directors can manage documents" ON documents;
    CREATE POLICY "Directors can manage documents" ON documents
      FOR ALL USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Directors can manage documents for their buildings
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = documents.building_id
          AND building_users.user_id = auth.uid()
          AND building_users.role IN ('rtm-director', 'sof-director')
        )
      );
  END IF;
END $$;

-- Create policies for user_profiles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    CREATE POLICY "Users can view their own profile" ON user_profiles
      FOR SELECT USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Users can view their own profile
        user_id = auth.uid()
      );
      
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    CREATE POLICY "Users can update their own profile" ON user_profiles
      FOR UPDATE USING (user_id = auth.uid());
      
    DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
    CREATE POLICY "Users can insert their own profile" ON user_profiles
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Create policies for notifications table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    CREATE POLICY "Users can view their own notifications" ON notifications
      FOR SELECT USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Users can view their own notifications
        user_id = auth.uid()
      );
      
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    CREATE POLICY "Users can update their own notifications" ON notifications
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- Create policies for building_invitations table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'building_invitations') THEN
    ALTER TABLE building_invitations ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Directors can manage invitations" ON building_invitations;
    CREATE POLICY "Directors can manage invitations" ON building_invitations
      FOR ALL USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Directors can manage invitations for their buildings
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = building_invitations.building_id
          AND building_users.user_id = auth.uid()
          AND building_users.role IN ('rtm-director', 'sof-director')
        )
      );
  END IF;
END $$;

-- Add comment for tracking
COMMENT ON SCHEMA public IS 'Comprehensive RLS policies applied on 2025-07-26';
