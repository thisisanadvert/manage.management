-- MRI Qube Integration Database Schema
-- Creates tables for storing MRI Qube data with proper relationships and RLS policies

-- ============================================================================
-- Authentication & Configuration Tables
-- ============================================================================

-- Store MRI OAuth tokens securely
CREATE TABLE IF NOT EXISTS mri_auth_tokens (
  id TEXT PRIMARY KEY DEFAULT 'current',
  token_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MRI sync configuration per building
CREATE TABLE IF NOT EXISTS mri_sync_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  mri_property_id TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  sync_frequency JSONB NOT NULL DEFAULT '{
    "properties": "daily",
    "tenancies": "daily", 
    "transactions": "hourly",
    "budgets": "weekly",
    "invoices": "hourly",
    "maintenance": "daily",
    "documents": "weekly"
  }'::jsonb,
  last_config_update TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, mri_property_id)
);

-- ============================================================================
-- MRI Property & Building Data
-- ============================================================================

-- MRI Properties (buildings)
CREATE TABLE IF NOT EXISTS mri_properties (
  id TEXT PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial', 'mixed')),
  total_units INTEGER DEFAULT 0,
  management_type TEXT CHECK (management_type IN ('rtm', 'rmc', 'landlord', 'freehold')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  portfolio TEXT,
  manager JSONB,
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MRI Units
CREATE TABLE IF NOT EXISTS mri_units (
  id TEXT PRIMARY KEY,
  mri_property_id TEXT NOT NULL REFERENCES mri_properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('flat', 'house', 'commercial', 'parking')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor_area DECIMAL(10,2),
  service_charge_percentage DECIMAL(5,2),
  status TEXT DEFAULT 'occupied' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MRI Tenancy & Contact Data
-- ============================================================================

-- MRI Tenancies
CREATE TABLE IF NOT EXISTS mri_tenancies (
  id TEXT PRIMARY KEY,
  mri_property_id TEXT NOT NULL REFERENCES mri_properties(id) ON DELETE CASCADE,
  mri_unit_id TEXT REFERENCES mri_units(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  tenancy_type TEXT NOT NULL CHECK (tenancy_type IN ('leasehold', 'freehold', 'rental', 'commercial')),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  rent_amount DECIMAL(10,2),
  service_charge_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MRI Contacts
CREATE TABLE IF NOT EXISTS mri_contacts (
  id TEXT PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('tenant', 'owner', 'director', 'agent', 'supplier')),
  title TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  address JSONB,
  is_active BOOLEAN DEFAULT true,
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MRI Financial Data
-- ============================================================================

-- MRI Transactions
CREATE TABLE IF NOT EXISTS mri_transactions (
  id TEXT PRIMARY KEY,
  mri_property_id TEXT NOT NULL REFERENCES mri_properties(id) ON DELETE CASCADE,
  mri_unit_id TEXT REFERENCES mri_units(id) ON DELETE CASCADE,
  mri_tenancy_id TEXT REFERENCES mri_tenancies(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'charge', 'refund', 'adjustment')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  transaction_date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference TEXT,
  payment_method TEXT,
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MRI Budgets
CREATE TABLE IF NOT EXISTS mri_budgets (
  id TEXT PRIMARY KEY,
  mri_property_id TEXT NOT NULL REFERENCES mri_properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('annual', 'quarterly', 'monthly')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_amount DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2),
  variance DECIMAL(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'closed')),
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MRI Invoices
CREATE TABLE IF NOT EXISTS mri_invoices (
  id TEXT PRIMARY KEY,
  mri_property_id TEXT NOT NULL REFERENCES mri_properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'overdue', 'disputed')),
  category TEXT NOT NULL,
  vat_amount DECIMAL(12,2),
  net_amount DECIMAL(12,2),
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MRI Maintenance & Work Orders
-- ============================================================================

-- MRI Work Orders
CREATE TABLE IF NOT EXISTS mri_maintenance (
  id TEXT PRIMARY KEY,
  mri_property_id TEXT NOT NULL REFERENCES mri_properties(id) ON DELETE CASCADE,
  mri_unit_id TEXT REFERENCES mri_units(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to TEXT,
  requested_by TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  scheduled_date DATE,
  completed_date DATE,
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MRI Documents & Compliance
-- ============================================================================

-- MRI Documents
CREATE TABLE IF NOT EXISTS mri_documents (
  id TEXT PRIMARY KEY,
  mri_property_id TEXT NOT NULL REFERENCES mri_properties(id) ON DELETE CASCADE,
  mri_unit_id TEXT REFERENCES mri_units(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('legal', 'financial', 'insurance', 'maintenance', 'compliance')),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  upload_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  tags TEXT[],
  mri_created_date TIMESTAMPTZ,
  mri_last_modified TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Sync Status & Error Tracking
-- ============================================================================

-- Sync status tracking
CREATE TABLE IF NOT EXISTS mri_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('properties', 'tenancies', 'transactions', 'budgets', 'invoices', 'maintenance', 'documents')),
  last_sync_date TIMESTAMPTZ NOT NULL,
  next_sync_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'in_progress', 'pending')),
  records_processed INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  sync_duration INTEGER, -- in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, entity_type)
);

-- Sync error tracking
CREATE TABLE IF NOT EXISTS mri_sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID REFERENCES mri_sync_status(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  error_type TEXT NOT NULL CHECK (error_type IN ('validation', 'api', 'database', 'mapping')),
  error_message TEXT NOT NULL,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  resolved BOOLEAN DEFAULT false,
  resolved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Property and unit indexes
CREATE INDEX IF NOT EXISTS idx_mri_properties_building_id ON mri_properties(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_properties_status ON mri_properties(status);
CREATE INDEX IF NOT EXISTS idx_mri_units_property_id ON mri_units(mri_property_id);
CREATE INDEX IF NOT EXISTS idx_mri_units_building_id ON mri_units(building_id);

-- Tenancy and contact indexes
CREATE INDEX IF NOT EXISTS idx_mri_tenancies_property_id ON mri_tenancies(mri_property_id);
CREATE INDEX IF NOT EXISTS idx_mri_tenancies_building_id ON mri_tenancies(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_tenancies_status ON mri_tenancies(status);
CREATE INDEX IF NOT EXISTS idx_mri_contacts_building_id ON mri_contacts(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_contacts_type ON mri_contacts(contact_type);

-- Financial data indexes
CREATE INDEX IF NOT EXISTS idx_mri_transactions_property_id ON mri_transactions(mri_property_id);
CREATE INDEX IF NOT EXISTS idx_mri_transactions_building_id ON mri_transactions(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_transactions_date ON mri_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_mri_transactions_status ON mri_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mri_budgets_property_id ON mri_budgets(mri_property_id);
CREATE INDEX IF NOT EXISTS idx_mri_budgets_year ON mri_budgets(year);
CREATE INDEX IF NOT EXISTS idx_mri_invoices_property_id ON mri_invoices(mri_property_id);
CREATE INDEX IF NOT EXISTS idx_mri_invoices_status ON mri_invoices(status);
CREATE INDEX IF NOT EXISTS idx_mri_invoices_due_date ON mri_invoices(due_date);

-- Maintenance and document indexes
CREATE INDEX IF NOT EXISTS idx_mri_maintenance_property_id ON mri_maintenance(mri_property_id);
CREATE INDEX IF NOT EXISTS idx_mri_maintenance_building_id ON mri_maintenance(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_maintenance_status ON mri_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_mri_documents_property_id ON mri_documents(mri_property_id);
CREATE INDEX IF NOT EXISTS idx_mri_documents_building_id ON mri_documents(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_documents_category ON mri_documents(category);

-- Sync tracking indexes
CREATE INDEX IF NOT EXISTS idx_mri_sync_status_building_id ON mri_sync_status(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_sync_status_entity_type ON mri_sync_status(entity_type);
CREATE INDEX IF NOT EXISTS idx_mri_sync_errors_building_id ON mri_sync_errors(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_sync_errors_resolved ON mri_sync_errors(resolved);

-- ============================================================================
-- Updated At Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all MRI tables
CREATE TRIGGER update_mri_auth_tokens_updated_at BEFORE UPDATE ON mri_auth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_sync_configs_updated_at BEFORE UPDATE ON mri_sync_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_properties_updated_at BEFORE UPDATE ON mri_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_units_updated_at BEFORE UPDATE ON mri_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_tenancies_updated_at BEFORE UPDATE ON mri_tenancies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_contacts_updated_at BEFORE UPDATE ON mri_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_transactions_updated_at BEFORE UPDATE ON mri_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_budgets_updated_at BEFORE UPDATE ON mri_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_invoices_updated_at BEFORE UPDATE ON mri_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_maintenance_updated_at BEFORE UPDATE ON mri_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_documents_updated_at BEFORE UPDATE ON mri_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_sync_status_updated_at BEFORE UPDATE ON mri_sync_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mri_sync_errors_updated_at BEFORE UPDATE ON mri_sync_errors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
