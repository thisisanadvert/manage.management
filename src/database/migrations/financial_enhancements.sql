-- Financial Management System Enhancements
-- Migration for Budgets & Planning, Service Charges, and Reports & Analysis

-- Budget Items Table
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    quarterly_estimate DECIMAL(10,2) DEFAULT 0,
    annual_estimate DECIMAL(10,2) DEFAULT 0,
    actual_spent DECIMAL(10,2) DEFAULT 0,
    variance DECIMAL(10,2) DEFAULT 0,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    notes TEXT,
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget Periods Table
CREATE TABLE IF NOT EXISTS budget_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
    total_income DECIMAL(10,2) DEFAULT 0,
    total_expenses DECIMAL(10,2) DEFAULT 0,
    net_position DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(building_id, year, quarter)
);

-- Service Charge Collections Table
CREATE TABLE IF NOT EXISTS service_charge_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    collection_date DATE NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'bi-annual', 'annual')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'overdue')),
    management_fee DECIMAL(10,2) NOT NULL,
    fee_percentage DECIMAL(4,2) NOT NULL,
    residents INTEGER DEFAULT 0,
    amount_per_resident DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Summary Table (for reports)
CREATE TABLE IF NOT EXISTS financial_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    period VARCHAR(50) NOT NULL,
    total_income DECIMAL(10,2) DEFAULT 0,
    total_expenses DECIMAL(10,2) DEFAULT 0,
    service_charges DECIMAL(10,2) DEFAULT 0,
    management_fees DECIMAL(10,2) DEFAULT 0,
    budget_variance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(building_id, period)
);

-- Generated Reports Table
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    format VARCHAR(10) NOT NULL,
    period VARCHAR(50) NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    generated_by UUID REFERENCES auth.users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_items_building_year ON budget_items(building_id, year);
CREATE INDEX IF NOT EXISTS idx_budget_items_building_quarter ON budget_items(building_id, year, quarter);
CREATE INDEX IF NOT EXISTS idx_budget_periods_building_year ON budget_periods(building_id, year);
CREATE INDEX IF NOT EXISTS idx_service_charges_building_date ON service_charge_collections(building_id, collection_date);
CREATE INDEX IF NOT EXISTS idx_service_charges_frequency ON service_charge_collections(frequency);
CREATE INDEX IF NOT EXISTS idx_financial_summary_building_period ON financial_summary(building_id, period);
CREATE INDEX IF NOT EXISTS idx_generated_reports_building_type ON generated_reports(building_id, report_type);

-- RLS Policies
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charge_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- Budget Items Policies
CREATE POLICY "Users can view budget items for their building" ON budget_items
    FOR SELECT USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert budget items for their building" ON budget_items
    FOR INSERT WITH CHECK (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update budget items for their building" ON budget_items
    FOR UPDATE USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete budget items for their building" ON budget_items
    FOR DELETE USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

-- Budget Periods Policies
CREATE POLICY "Users can view budget periods for their building" ON budget_periods
    FOR SELECT USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage budget periods for their building" ON budget_periods
    FOR ALL USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

-- Service Charge Collections Policies
CREATE POLICY "Users can view service charges for their building" ON service_charge_collections
    FOR SELECT USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage service charges for their building" ON service_charge_collections
    FOR ALL USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

-- Financial Summary Policies
CREATE POLICY "Users can view financial summary for their building" ON financial_summary
    FOR SELECT USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage financial summary for their building" ON financial_summary
    FOR ALL USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

-- Generated Reports Policies
CREATE POLICY "Users can view reports for their building" ON generated_reports
    FOR SELECT USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage reports for their building" ON generated_reports
    FOR ALL USING (
        building_id IN (
            SELECT building_id FROM user_buildings WHERE user_id = auth.uid()
        )
    );

-- Functions for automatic calculations
CREATE OR REPLACE FUNCTION calculate_budget_variance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.variance = NEW.actual_spent - COALESCE(NEW.quarterly_estimate, NEW.annual_estimate);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_items_calculate_variance
    BEFORE INSERT OR UPDATE ON budget_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_budget_variance();

-- Function to calculate management fees
CREATE OR REPLACE FUNCTION calculate_management_fee()
RETURNS TRIGGER AS $$
BEGIN
    -- Set fee percentage based on frequency
    CASE NEW.frequency
        WHEN 'monthly' THEN NEW.fee_percentage = 3.0;
        WHEN 'quarterly' THEN NEW.fee_percentage = 2.5;
        WHEN 'bi-annual' THEN NEW.fee_percentage = 2.0;
        WHEN 'annual' THEN NEW.fee_percentage = 1.5;
    END CASE;
    
    -- Calculate management fee
    NEW.management_fee = (NEW.amount * NEW.fee_percentage) / 100;
    
    -- Calculate per resident amount if residents count is provided
    IF NEW.residents > 0 THEN
        NEW.amount_per_resident = NEW.amount / NEW.residents;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_charges_calculate_fee
    BEFORE INSERT OR UPDATE ON service_charge_collections
    FOR EACH ROW
    EXECUTE FUNCTION calculate_management_fee();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER budget_periods_updated_at BEFORE UPDATE ON budget_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER service_charges_updated_at BEFORE UPDATE ON service_charge_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER financial_summary_updated_at BEFORE UPDATE ON financial_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
