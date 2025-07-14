/*
  # Complete Financial Management System Database
  
  This migration ensures all financial data can be properly stored and connected.
  It creates missing tables and ensures proper relationships between all components.
*/

-- =====================================================
-- CORE FINANCIAL TABLES (Enhanced/Missing)
-- =====================================================

-- Enhanced transactions table (ensure it exists with all fields)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  subcategory text,
  transaction_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_method text,
  reference_number text,
  bank_account text,
  receipt_url text,
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  ai_category text,
  ai_confidence decimal(3,2),
  recurring_transaction_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service charge payments tracking
CREATE TABLE IF NOT EXISTS service_charge_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  unit_id uuid REFERENCES units(id),
  demand_id uuid, -- Reference to service charge demand
  amount decimal(10,2) NOT NULL,
  payment_date date NOT NULL,
  payment_method text,
  reference_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue', 'partial')),
  late_fee decimal(10,2) DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reserve fund management
CREATE TABLE IF NOT EXISTS reserve_fund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('contribution', 'withdrawal', 'interest', 'transfer')),
  transaction_date date NOT NULL,
  balance_after decimal(12,2),
  purpose text, -- What the withdrawal was for
  approved_by uuid REFERENCES auth.users(id),
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Major works projects
CREATE TABLE IF NOT EXISTS major_works_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  project_name text NOT NULL,
  description text,
  estimated_cost decimal(12,2),
  actual_cost decimal(12,2) DEFAULT 0,
  start_date date,
  completion_date date,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'consultation', 'approved', 'in_progress', 'completed', 'cancelled')),
  section20_required boolean DEFAULT true,
  section20_consultation_id uuid,
  contractor_name text,
  contractor_contact text,
  warranty_period integer, -- months
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Major works expenses (linked to projects)
CREATE TABLE IF NOT EXISTS major_works_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES major_works_projects(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  expense_date date NOT NULL,
  category text, -- materials, labour, equipment, etc.
  supplier_name text,
  invoice_number text,
  receipt_url text,
  approved_by uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Financial reports storage
CREATE TABLE IF NOT EXISTS financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  report_type text NOT NULL, -- 'monthly', 'quarterly', 'annual', 'budget_variance', 'cashflow'
  report_period text NOT NULL, -- '2025-Q1', '2025-07', '2025'
  report_data jsonb NOT NULL, -- Stores the actual report data
  generated_by uuid REFERENCES auth.users(id) NOT NULL,
  file_url text, -- PDF/Excel export URL
  created_at timestamptz DEFAULT now()
);

-- Recurring transactions (for regular income/expenses)
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'annually')),
  start_date date NOT NULL,
  end_date date,
  next_due_date date NOT NULL,
  is_active boolean DEFAULT true,
  auto_approve boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bank account management
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  account_name text NOT NULL,
  account_number text,
  sort_code text,
  bank_name text,
  account_type text CHECK (account_type IN ('current', 'savings', 'reserve')),
  current_balance decimal(12,2) DEFAULT 0,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transactions_building_date ON transactions(building_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type_category ON transactions(type, category);
CREATE INDEX IF NOT EXISTS idx_service_charge_payments_building ON service_charge_payments(building_id);
CREATE INDEX IF NOT EXISTS idx_service_charge_payments_unit ON service_charge_payments(unit_id);
CREATE INDEX IF NOT EXISTS idx_service_charge_payments_status ON service_charge_payments(status);
CREATE INDEX IF NOT EXISTS idx_reserve_fund_building_date ON reserve_fund_transactions(building_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_major_works_building_status ON major_works_projects(building_id, status);
CREATE INDEX IF NOT EXISTS idx_major_works_expenses_project ON major_works_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_building_type ON financial_reports(building_id, report_type);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_building ON recurring_transactions(building_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_due ON recurring_transactions(next_due_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bank_accounts_building ON bank_accounts(building_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charge_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_fund_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE major_works_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE major_works_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can access transactions for their buildings" ON transactions
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Service charge payments policies
CREATE POLICY "Users can access service charge payments for their buildings" ON service_charge_payments
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Reserve fund policies
CREATE POLICY "Users can access reserve fund for their buildings" ON reserve_fund_transactions
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Major works policies
CREATE POLICY "Users can access major works for their buildings" ON major_works_projects
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access major works expenses for their buildings" ON major_works_expenses
  FOR ALL USING (
    project_id IN (
      SELECT mw.id FROM major_works_projects mw
      JOIN building_users bu ON mw.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

-- Financial reports policies
CREATE POLICY "Users can access financial reports for their buildings" ON financial_reports
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Recurring transactions policies
CREATE POLICY "Users can access recurring transactions for their buildings" ON recurring_transactions
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Bank accounts policies
CREATE POLICY "Users can access bank accounts for their buildings" ON bank_accounts
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER service_charge_payments_updated_at BEFORE UPDATE ON service_charge_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER major_works_projects_updated_at BEFORE UPDATE ON major_works_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
