/*
  # Canonical RLS Policies - Financial and MRI Tables
  
  This migration continues the canonical RLS policy implementation for
  financial and MRI integration tables, ensuring consistent security
  across all database tables.
  
  ## Tables Covered:
  - transactions, financial_setup (financial data)
  - All MRI integration tables (mri_*)
  - documents, notifications (user data)
  - poll_votes, poll_options (voting system)
  
  ## Security Model:
  - Super admin has full access to everything
  - Demo building data is accessible to all authenticated users
  - Building members can view financial data for their buildings
  - Directors can manage financial data for their buildings
  - MRI data follows building-based access patterns
*/

-- ============================================================================
-- FINANCIAL TABLES POLICIES
-- ============================================================================

-- TRANSACTIONS TABLE POLICIES
DROP POLICY IF EXISTS "Users can access transactions for their buildings" ON transactions;
DROP POLICY IF EXISTS "Directors can manage transactions" ON transactions;

CREATE POLICY "canonical_transactions_select" ON transactions
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_member(building_id)
  );

CREATE POLICY "canonical_transactions_insert" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_director(building_id)
  );

CREATE POLICY "canonical_transactions_update" ON transactions
  FOR UPDATE TO authenticated
  USING (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_director(building_id)
  )
  WITH CHECK (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_director(building_id)
  );

-- FINANCIAL_SETUP TABLE POLICIES
DROP POLICY IF EXISTS "Users can view financial setup for their buildings" ON financial_setup;
DROP POLICY IF EXISTS "Directors can manage financial setup" ON financial_setup;

CREATE POLICY "canonical_financial_setup_select" ON financial_setup
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_member(building_id)
  );

CREATE POLICY "canonical_financial_setup_insert" ON financial_setup
  FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_director(building_id)
  );

CREATE POLICY "canonical_financial_setup_update" ON financial_setup
  FOR UPDATE TO authenticated
  USING (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_director(building_id)
  )
  WITH CHECK (
    is_super_admin() OR
    building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
    is_building_director(building_id)
  );

-- ============================================================================
-- VOTING SYSTEM POLICIES
-- ============================================================================

-- POLL_VOTES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view poll votes in their buildings" ON poll_votes;
DROP POLICY IF EXISTS "Users can vote in polls" ON poll_votes;

CREATE POLICY "canonical_poll_votes_select" ON poll_votes
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_votes.poll_id
      AND (
        polls.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
        is_building_member(polls.building_id)
      )
    )
  );

CREATE POLICY "canonical_poll_votes_insert" ON poll_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_votes.poll_id
      AND (
        polls.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
        is_building_member(polls.building_id)
      )
    )
  );

-- POLL_OPTIONS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view poll options in their buildings" ON poll_options;
DROP POLICY IF EXISTS "Directors can manage poll options" ON poll_options;

CREATE POLICY "canonical_poll_options_select" ON poll_options
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND (
        polls.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
        is_building_member(polls.building_id)
      )
    )
  );

CREATE POLICY "canonical_poll_options_insert" ON poll_options
  FOR INSERT TO authenticated
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND (
        polls.building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
        is_building_director(polls.building_id)
      )
    )
  );

-- ============================================================================
-- MRI INTEGRATION TABLES POLICIES
-- ============================================================================

-- MRI_CREDENTIALS TABLE POLICIES
DROP POLICY IF EXISTS "Super admin can manage all MRI credentials" ON mri_credentials;
DROP POLICY IF EXISTS "Directors can manage MRI credentials for their buildings" ON mri_credentials;

CREATE POLICY "canonical_mri_credentials_all" ON mri_credentials
  FOR ALL TO authenticated
  USING (
    is_super_admin() OR
    is_building_director(building_id)
  )
  WITH CHECK (
    is_super_admin() OR
    is_building_director(building_id)
  );

-- MRI_SYNC_CONFIGS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view MRI sync configs for their buildings" ON mri_sync_configs;
DROP POLICY IF EXISTS "Directors can manage MRI sync configs for their buildings" ON mri_sync_configs;

CREATE POLICY "canonical_mri_sync_configs_select" ON mri_sync_configs
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    is_building_member(building_id)
  );

CREATE POLICY "canonical_mri_sync_configs_manage" ON mri_sync_configs
  FOR ALL TO authenticated
  USING (
    is_super_admin() OR
    is_building_director(building_id)
  )
  WITH CHECK (
    is_super_admin() OR
    is_building_director(building_id)
  );

-- MRI_PROPERTIES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view MRI properties for their buildings" ON mri_properties;
DROP POLICY IF EXISTS "Directors can manage MRI properties for their buildings" ON mri_properties;

CREATE POLICY "canonical_mri_properties_select" ON mri_properties
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    is_building_member(building_id)
  );

CREATE POLICY "canonical_mri_properties_manage" ON mri_properties
  FOR ALL TO authenticated
  USING (
    is_super_admin() OR
    is_building_director(building_id)
  )
  WITH CHECK (
    is_super_admin() OR
    is_building_director(building_id)
  );

-- MRI_UNITS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view MRI units for their buildings" ON mri_units;
DROP POLICY IF EXISTS "Directors can manage MRI units for their buildings" ON mri_units;

CREATE POLICY "canonical_mri_units_select" ON mri_units
  FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    is_building_member(building_id)
  );

CREATE POLICY "canonical_mri_units_manage" ON mri_units
  FOR ALL TO authenticated
  USING (
    is_super_admin() OR
    is_building_director(building_id)
  )
  WITH CHECK (
    is_super_admin() OR
    is_building_director(building_id)
  );

-- ============================================================================
-- DOCUMENTS AND NOTIFICATIONS POLICIES
-- ============================================================================

-- DOCUMENTS TABLE POLICIES (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
    DROP POLICY IF EXISTS "Users can view documents in their buildings" ON documents;
    DROP POLICY IF EXISTS "Directors can manage documents" ON documents;
    
    CREATE POLICY "canonical_documents_select" ON documents
      FOR SELECT TO authenticated
      USING (
        is_super_admin() OR
        building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
        is_building_member(building_id)
      );
      
    CREATE POLICY "canonical_documents_manage" ON documents
      FOR ALL TO authenticated
      USING (
        is_super_admin() OR
        building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
        is_building_director(building_id)
      )
      WITH CHECK (
        is_super_admin() OR
        building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'::uuid OR
        is_building_director(building_id)
      );
  END IF;
END $$;

-- NOTIFICATIONS TABLE POLICIES (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    
    CREATE POLICY "canonical_notifications_select" ON notifications
      FOR SELECT TO authenticated
      USING (
        is_super_admin() OR
        user_id = auth.uid()
      );
      
    CREATE POLICY "canonical_notifications_insert" ON notifications
      FOR INSERT TO authenticated
      WITH CHECK (
        is_super_admin() OR
        user_id = auth.uid()
      );
  END IF;
END $$;

-- Add comment for tracking
COMMENT ON SCHEMA public IS 'Canonical RLS policies for financial and MRI tables applied on 2025-07-29';
