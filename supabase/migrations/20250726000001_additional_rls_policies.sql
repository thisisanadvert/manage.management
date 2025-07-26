/*
  # Additional RLS Policies - Part 2
  
  This migration adds RLS policies for additional tables that might exist
  and need proper security policies.
  
  ## Tables Covered:
  - rtm_formation_data (RTM formation process)
  - legal_templates (legal document templates)
  - supplier_quotes (supplier quotations)
  - maintenance_requests (maintenance tracking)
  - financial_reports (financial reporting)
  - audit_logs (system audit logging)
  - system_settings (application settings)
  - email_templates (email template management)
  - form_submissions (form data)
  - file_uploads (file upload tracking)
*/

-- Create policies for rtm_formation_data table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rtm_formation_data') THEN
    ALTER TABLE rtm_formation_data ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own RTM formation data" ON rtm_formation_data;
    CREATE POLICY "Users can view their own RTM formation data" ON rtm_formation_data
      FOR SELECT USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Users can view their own RTM formation data
        user_id = auth.uid()
        OR
        -- Building members can view RTM data for their building
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = rtm_formation_data.building_id
          AND building_users.user_id = auth.uid()
        )
      );
      
    DROP POLICY IF EXISTS "Users can manage their own RTM formation data" ON rtm_formation_data;
    CREATE POLICY "Users can manage their own RTM formation data" ON rtm_formation_data
      FOR ALL USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Users can manage their own RTM formation data
        user_id = auth.uid()
      );
  END IF;
END $$;

-- Create policies for legal_templates table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'legal_templates') THEN
    ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "All authenticated users can view legal templates" ON legal_templates;
    CREATE POLICY "All authenticated users can view legal templates" ON legal_templates
      FOR SELECT USING (auth.uid() IS NOT NULL);
      
    DROP POLICY IF EXISTS "Only super admin can manage legal templates" ON legal_templates;
    CREATE POLICY "Only super admin can manage legal templates" ON legal_templates
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
      );
  END IF;
END $$;

-- Create policies for supplier_quotes table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'supplier_quotes') THEN
    ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view quotes for their buildings" ON supplier_quotes;
    CREATE POLICY "Users can view quotes for their buildings" ON supplier_quotes
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
          WHERE building_users.building_id = supplier_quotes.building_id
          AND building_users.user_id = auth.uid()
        )
      );
      
    DROP POLICY IF EXISTS "Directors can manage quotes" ON supplier_quotes;
    CREATE POLICY "Directors can manage quotes" ON supplier_quotes
      FOR ALL USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Directors can manage quotes for their buildings
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = supplier_quotes.building_id
          AND building_users.user_id = auth.uid()
          AND building_users.role IN ('rtm-director', 'sof-director')
        )
      );
  END IF;
END $$;

-- Create policies for maintenance_requests table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'maintenance_requests') THEN
    ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view maintenance requests for their buildings" ON maintenance_requests;
    CREATE POLICY "Users can view maintenance requests for their buildings" ON maintenance_requests
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
          WHERE building_users.building_id = maintenance_requests.building_id
          AND building_users.user_id = auth.uid()
        )
        OR
        -- Users can view their own requests
        requested_by = auth.uid()
      );
      
    DROP POLICY IF EXISTS "Users can create maintenance requests" ON maintenance_requests;
    CREATE POLICY "Users can create maintenance requests" ON maintenance_requests
      FOR INSERT WITH CHECK (
        -- Users can create requests for buildings they belong to
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = maintenance_requests.building_id
          AND building_users.user_id = auth.uid()
        )
        AND requested_by = auth.uid()
      );
      
    DROP POLICY IF EXISTS "Directors can update maintenance requests" ON maintenance_requests;
    CREATE POLICY "Directors can update maintenance requests" ON maintenance_requests
      FOR UPDATE USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Directors can update requests for their buildings
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = maintenance_requests.building_id
          AND building_users.user_id = auth.uid()
          AND building_users.role IN ('rtm-director', 'sof-director')
        )
        OR
        -- Users can update their own requests
        requested_by = auth.uid()
      );
  END IF;
END $$;

-- Create policies for financial_reports table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financial_reports') THEN
    ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view financial reports for their buildings" ON financial_reports;
    CREATE POLICY "Users can view financial reports for their buildings" ON financial_reports
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
          WHERE building_users.building_id = financial_reports.building_id
          AND building_users.user_id = auth.uid()
        )
      );
      
    DROP POLICY IF EXISTS "Directors can manage financial reports" ON financial_reports;
    CREATE POLICY "Directors can manage financial reports" ON financial_reports
      FOR ALL USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Directors can manage reports for their buildings
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = financial_reports.building_id
          AND building_users.user_id = auth.uid()
          AND building_users.role IN ('rtm-director', 'sof-director')
        )
      );
  END IF;
END $$;

-- Create policies for audit_logs table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Only super admin can view audit logs" ON audit_logs;
    CREATE POLICY "Only super admin can view audit logs" ON audit_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
      );
      
    DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
    CREATE POLICY "System can insert audit logs" ON audit_logs
      FOR INSERT WITH CHECK (true); -- Allow system to insert audit logs
  END IF;
END $$;

-- Create policies for system_settings table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Only super admin can manage system settings" ON system_settings;
    CREATE POLICY "Only super admin can manage system settings" ON system_settings
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
      );
  END IF;
END $$;

-- Create policies for email_templates table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_templates') THEN
    ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "All authenticated users can view email templates" ON email_templates;
    CREATE POLICY "All authenticated users can view email templates" ON email_templates
      FOR SELECT USING (auth.uid() IS NOT NULL);
      
    DROP POLICY IF EXISTS "Only super admin can manage email templates" ON email_templates;
    CREATE POLICY "Only super admin can manage email templates" ON email_templates
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
      );
  END IF;
END $$;

-- Create policies for form_submissions table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'form_submissions') THEN
    ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own form submissions" ON form_submissions;
    CREATE POLICY "Users can view their own form submissions" ON form_submissions
      FOR SELECT USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Users can view their own submissions
        user_id = auth.uid()
      );
      
    DROP POLICY IF EXISTS "Users can create form submissions" ON form_submissions;
    CREATE POLICY "Users can create form submissions" ON form_submissions
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Create policies for file_uploads table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_uploads') THEN
    ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view their own file uploads" ON file_uploads;
    CREATE POLICY "Users can view their own file uploads" ON file_uploads
      FOR SELECT USING (
        -- Super admin access
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'frankie@manage.management'
        )
        OR
        -- Users can view their own uploads
        uploaded_by = auth.uid()
        OR
        -- Building members can view uploads for their buildings
        EXISTS (
          SELECT 1 FROM building_users
          WHERE building_users.building_id = file_uploads.building_id
          AND building_users.user_id = auth.uid()
        )
      );
      
    DROP POLICY IF EXISTS "Users can upload files" ON file_uploads;
    CREATE POLICY "Users can upload files" ON file_uploads
      FOR INSERT WITH CHECK (
        uploaded_by = auth.uid()
        AND (
          building_id IS NULL OR
          EXISTS (
            SELECT 1 FROM building_users
            WHERE building_users.building_id = file_uploads.building_id
            AND building_users.user_id = auth.uid()
          )
        )
      );
  END IF;
END $$;

-- Add final comment
COMMENT ON SCHEMA public IS 'Additional comprehensive RLS policies applied on 2025-07-26';
