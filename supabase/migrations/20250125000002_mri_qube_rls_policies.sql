-- MRI Qube Integration RLS Policies
-- Row Level Security policies for MRI data tables

-- ============================================================================
-- Enable RLS on all MRI tables
-- ============================================================================

ALTER TABLE mri_auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_sync_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE mri_sync_errors ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper function for building access
-- ============================================================================

-- Function to check if user has access to a building
CREATE OR REPLACE FUNCTION user_has_building_access(building_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admin has access to everything
  IF auth.jwt() ->> 'email' = 'frankie@manage.management' THEN
    RETURN TRUE;
  END IF;

  -- Check if user is associated with the building
  RETURN EXISTS (
    SELECT 1 FROM building_users 
    WHERE user_id = auth.uid() 
    AND building_id = building_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MRI Auth Tokens - Super admin only
-- ============================================================================

CREATE POLICY "Super admin can manage MRI auth tokens" ON mri_auth_tokens
  FOR ALL USING (auth.jwt() ->> 'email' = 'frankie@manage.management');

-- ============================================================================
-- MRI Sync Configs - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI sync configs for their buildings" ON mri_sync_configs
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI sync configs for their buildings" ON mri_sync_configs
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_sync_configs.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Properties - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI properties for their buildings" ON mri_properties
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI properties for their buildings" ON mri_properties
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_properties.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Units - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI units for their buildings" ON mri_units
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI units for their buildings" ON mri_units
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_units.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Tenancies - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI tenancies for their buildings" ON mri_tenancies
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI tenancies for their buildings" ON mri_tenancies
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_tenancies.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Contacts - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI contacts for their buildings" ON mri_contacts
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI contacts for their buildings" ON mri_contacts
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_contacts.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Transactions - Building-based access with role restrictions
-- ============================================================================

CREATE POLICY "Users can view MRI transactions for their buildings" ON mri_transactions
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI transactions for their buildings" ON mri_transactions
  FOR INSERT WITH CHECK (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_transactions.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

CREATE POLICY "Directors can update MRI transactions for their buildings" ON mri_transactions
  FOR UPDATE USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_transactions.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Budgets - Building-based access with role restrictions
-- ============================================================================

CREATE POLICY "Users can view MRI budgets for their buildings" ON mri_budgets
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI budgets for their buildings" ON mri_budgets
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_budgets.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Invoices - Building-based access with role restrictions
-- ============================================================================

CREATE POLICY "Users can view MRI invoices for their buildings" ON mri_invoices
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI invoices for their buildings" ON mri_invoices
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_invoices.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Maintenance - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI maintenance for their buildings" ON mri_maintenance
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI maintenance for their buildings" ON mri_maintenance
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_maintenance.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Documents - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI documents for their buildings" ON mri_documents
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI documents for their buildings" ON mri_documents
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_documents.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Sync Status - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI sync status for their buildings" ON mri_sync_status
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI sync status for their buildings" ON mri_sync_status
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_sync_status.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- MRI Sync Errors - Building-based access
-- ============================================================================

CREATE POLICY "Users can view MRI sync errors for their buildings" ON mri_sync_errors
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "Directors can manage MRI sync errors for their buildings" ON mri_sync_errors
  FOR ALL USING (
    user_has_building_access(building_id) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_sync_errors.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

-- ============================================================================
-- Management Company Access
-- ============================================================================

-- Management companies can access MRI data for buildings they manage
CREATE POLICY "Management companies can view MRI data for managed buildings" ON mri_properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data ->> 'role' = 'management-company'
    ) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_properties.building_id
      AND role = 'management-company'
    )
  );

-- Apply similar management company policies to other tables
CREATE POLICY "Management companies can view MRI units for managed buildings" ON mri_units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data ->> 'role' = 'management-company'
    ) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_units.building_id
      AND role = 'management-company'
    )
  );

CREATE POLICY "Management companies can view MRI transactions for managed buildings" ON mri_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data ->> 'role' = 'management-company'
    ) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_transactions.building_id
      AND role = 'management-company'
    )
  );

-- ============================================================================
-- Audit and Logging
-- ============================================================================

-- Create audit log for MRI data changes
CREATE TABLE IF NOT EXISTS mri_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  building_id UUID REFERENCES buildings(id)
);

-- Enable RLS on audit log
ALTER TABLE mri_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view MRI audit log for their buildings" ON mri_audit_log
  FOR SELECT USING (user_has_building_access(building_id));

CREATE POLICY "System can insert MRI audit log entries" ON mri_audit_log
  FOR INSERT WITH CHECK (true);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION mri_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO mri_audit_log (table_name, record_id, action, old_values, changed_by, building_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid(), OLD.building_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO mri_audit_log (table_name, record_id, action, old_values, new_values, changed_by, building_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), NEW.building_id);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO mri_audit_log (table_name, record_id, action, new_values, changed_by, building_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid(), NEW.building_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key MRI tables
CREATE TRIGGER mri_properties_audit AFTER INSERT OR UPDATE OR DELETE ON mri_properties
  FOR EACH ROW EXECUTE FUNCTION mri_audit_trigger();

CREATE TRIGGER mri_transactions_audit AFTER INSERT OR UPDATE OR DELETE ON mri_transactions
  FOR EACH ROW EXECUTE FUNCTION mri_audit_trigger();

CREATE TRIGGER mri_budgets_audit AFTER INSERT OR UPDATE OR DELETE ON mri_budgets
  FOR EACH ROW EXECUTE FUNCTION mri_audit_trigger();

CREATE TRIGGER mri_invoices_audit AFTER INSERT OR UPDATE OR DELETE ON mri_invoices
  FOR EACH ROW EXECUTE FUNCTION mri_audit_trigger();
