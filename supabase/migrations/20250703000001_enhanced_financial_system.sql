/*
  # Enhanced Financial Management System

  1. New Tables
    - transactions: Core transaction management with approval workflow
    - transaction_approvals: Dual approval tracking
    - transaction_categories: AI learning capabilities
    - digital_receipts: OCR metadata storage
    - service_charge_demands: RICS compliant demand management
    - payment_tracking: Automated reminder scheduling
    - arrears_management: Escalation procedure tracking
    - section20_consultations: Statutory consultation management
    - budget_plans: Multi-year budget planning
    - reserve_fund_calculations: Professional recommendations

  2. Security
    - Enable RLS on all tables
    - Add policies for building-based access control
*/

-- Create transactions table with approval workflow
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  transaction_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  ai_category text,
  ai_confidence decimal(3,2),
  reference_number text,
  payment_method text,
  bank_account text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transaction approvals table
CREATE TABLE IF NOT EXISTS transaction_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES auth.users(id) NOT NULL,
  approved boolean NOT NULL,
  approval_date timestamptz DEFAULT now(),
  notes text,
  approval_order integer NOT NULL, -- 1 for first approval, 2 for second
  created_at timestamptz DEFAULT now()
);

-- Create transaction categories table for AI learning
CREATE TABLE IF NOT EXISTS transaction_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  category_name text NOT NULL,
  category_type text NOT NULL CHECK (category_type IN ('income', 'expense')),
  keywords text[], -- For AI matching
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create digital receipts table
CREATE TABLE IF NOT EXISTS digital_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  ocr_text text, -- Extracted text from OCR
  ocr_confidence decimal(3,2),
  ocr_metadata jsonb, -- Structured data from OCR
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create service charge demands table
CREATE TABLE IF NOT EXISTS service_charge_demands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  demand_period text NOT NULL, -- e.g., "Q2 2025"
  demand_date date NOT NULL,
  due_date date NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'overdue')),
  rics_compliant boolean DEFAULT true,
  consultation_required boolean DEFAULT false,
  section20_reference text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  issued_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service charge demand items table
CREATE TABLE IF NOT EXISTS service_charge_demand_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id uuid REFERENCES service_charge_demands(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES units(id) NOT NULL,
  amount decimal(10,2) NOT NULL,
  percentage decimal(5,4), -- Lease percentage
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue')),
  paid_amount decimal(10,2) DEFAULT 0,
  payment_date date,
  created_at timestamptz DEFAULT now()
);

-- Create payment tracking table
CREATE TABLE IF NOT EXISTS payment_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_item_id uuid REFERENCES service_charge_demand_items(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_date date NOT NULL,
  payment_method text,
  reference text,
  bank_account text,
  reconciled boolean DEFAULT false,
  reconciled_at timestamptz,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create arrears management table
CREATE TABLE IF NOT EXISTS arrears_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) NOT NULL,
  total_arrears decimal(10,2) NOT NULL,
  oldest_debt_date date,
  escalation_level integer DEFAULT 1, -- 1=reminder, 2=formal notice, 3=legal action
  last_contact_date date,
  next_action_date date,
  notes text,
  legal_action_started boolean DEFAULT false,
  payment_plan_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Section 20 consultations table
CREATE TABLE IF NOT EXISTS section20_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  consultation_type text NOT NULL CHECK (consultation_type IN ('works', 'agreement')),
  works_description text NOT NULL,
  estimated_cost decimal(10,2) NOT NULL,
  cost_per_leaseholder decimal(10,2),
  stage text NOT NULL DEFAULT 'planning' CHECK (stage IN ('planning', 'notice_intention', 'estimates', 'notice_proposal', 'completion')),
  notice_intention_date date,
  notice_proposal_date date,
  completion_date date,
  leaseholder_count integer,
  responses_received integer DEFAULT 0,
  objections_received integer DEFAULT 0,
  consultation_outcome text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget plans table
CREATE TABLE IF NOT EXISTS budget_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  budget_year integer NOT NULL,
  total_budget decimal(10,2) NOT NULL,
  service_charge_budget decimal(10,2),
  reserve_fund_budget decimal(10,2),
  major_works_budget decimal(10,2),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_plan_id uuid REFERENCES budget_plans(id) ON DELETE CASCADE,
  category_name text NOT NULL,
  allocated_amount decimal(10,2) NOT NULL,
  spent_amount decimal(10,2) DEFAULT 0,
  variance_percentage decimal(5,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create reserve fund calculations table
CREATE TABLE IF NOT EXISTS reserve_fund_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  calculation_date date NOT NULL,
  building_age integer,
  total_units integer,
  building_type text,
  recommended_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2),
  shortfall_amount decimal(10,2),
  months_coverage decimal(4,2),
  calculation_method text,
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create compliance monitoring table
CREATE TABLE IF NOT EXISTS compliance_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  compliance_type text NOT NULL, -- 'annual_accounts', 'vat_return', 'insurance', etc.
  due_date date NOT NULL,
  completion_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  reminder_sent boolean DEFAULT false,
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charge_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charge_demand_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrears_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE section20_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserve_fund_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitoring ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for building-based access
CREATE POLICY "Users can access transactions for their buildings" ON transactions
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access transaction approvals for their buildings" ON transaction_approvals
  FOR ALL USING (
    transaction_id IN (
      SELECT t.id FROM transactions t
      JOIN building_users bu ON t.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access categories for their buildings" ON transaction_categories
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access receipts for their buildings" ON digital_receipts
  FOR ALL USING (
    transaction_id IN (
      SELECT t.id FROM transactions t
      JOIN building_users bu ON t.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access service charge demands for their buildings" ON service_charge_demands
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access demand items for their buildings" ON service_charge_demand_items
  FOR ALL USING (
    demand_id IN (
      SELECT d.id FROM service_charge_demands d
      JOIN building_users bu ON d.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access payment tracking for their buildings" ON payment_tracking
  FOR ALL USING (
    demand_item_id IN (
      SELECT di.id FROM service_charge_demand_items di
      JOIN service_charge_demands d ON di.demand_id = d.id
      JOIN building_users bu ON d.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access arrears for their buildings" ON arrears_management
  FOR ALL USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN building_users bu ON u.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access Section 20 consultations for their buildings" ON section20_consultations
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access budget plans for their buildings" ON budget_plans
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access budget categories for their buildings" ON budget_categories
  FOR ALL USING (
    budget_plan_id IN (
      SELECT bp.id FROM budget_plans bp
      JOIN building_users bu ON bp.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access reserve fund calculations for their buildings" ON reserve_fund_calculations
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access compliance monitoring for their buildings" ON compliance_monitoring
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_transactions_building_id ON transactions(building_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transaction_approvals_transaction_id ON transaction_approvals(transaction_id);
CREATE INDEX idx_service_charge_demands_building_id ON service_charge_demands(building_id);
CREATE INDEX idx_service_charge_demands_status ON service_charge_demands(status);
CREATE INDEX idx_payment_tracking_demand_item_id ON payment_tracking(demand_item_id);
CREATE INDEX idx_arrears_management_unit_id ON arrears_management(unit_id);
CREATE INDEX idx_section20_consultations_building_id ON section20_consultations(building_id);
CREATE INDEX idx_budget_plans_building_id ON budget_plans(building_id);
CREATE INDEX idx_compliance_monitoring_building_id ON compliance_monitoring(building_id);
CREATE INDEX idx_compliance_monitoring_due_date ON compliance_monitoring(due_date);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_charge_demands_updated_at BEFORE UPDATE ON service_charge_demands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arrears_management_updated_at BEFORE UPDATE ON arrears_management
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section20_consultations_updated_at BEFORE UPDATE ON section20_consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_plans_updated_at BEFORE UPDATE ON budget_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_monitoring_updated_at BEFORE UPDATE ON compliance_monitoring
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
