-- User Impersonation Audit Logging Schema
-- This file contains the database schema for secure user impersonation with comprehensive audit logging

-- Create user_impersonation_logs table for immutable audit records
CREATE TABLE IF NOT EXISTS user_impersonation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Admin user performing the impersonation
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    admin_ip_address INET,
    admin_user_agent TEXT,
    
    -- Target user being impersonated
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_email TEXT NOT NULL,
    target_role TEXT NOT NULL,
    target_building_id UUID,
    
    -- Impersonation session details
    session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    reason TEXT NOT NULL CHECK (reason IN (
        'Customer Support',
        'Technical Issue', 
        'Data Investigation',
        'Account Recovery',
        'Compliance Review',
        'Bug Investigation',
        'Training/Demo'
    )),
    additional_notes TEXT,
    
    -- Session timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN ended_at IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
            ELSE NULL
        END
    ) STORED,
    
    -- Session status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',
        'ended_manually',
        'ended_timeout',
        'ended_inactivity',
        'ended_security',
        'ended_error'
    )),
    
    -- Security and compliance
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure no concurrent impersonation sessions for same admin
    CONSTRAINT unique_active_admin_session EXCLUDE (
        admin_user_id WITH =
    ) WHERE (status = 'active')
);

-- Create user_impersonation_actions table for detailed action logging
CREATE TABLE IF NOT EXISTS user_impersonation_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to impersonation session
    session_id UUID NOT NULL REFERENCES user_impersonation_logs(session_id) ON DELETE CASCADE,
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Action details
    action_type TEXT NOT NULL CHECK (action_type IN (
        'page_visit',
        'data_view',
        'data_modification',
        'document_upload',
        'document_download',
        'document_delete',
        'financial_transaction',
        'user_data_change',
        'voting_action',
        'meeting_action',
        'compliance_action',
        'settings_change',
        'password_reset',
        'email_change',
        'role_change'
    )),
    
    -- Action context
    page_url TEXT,
    component_name TEXT,
    action_description TEXT NOT NULL,
    
    -- Data involved
    affected_data_type TEXT, -- e.g., 'user_profile', 'financial_record', 'document'
    affected_record_id UUID,
    old_values JSONB,
    new_values JSONB,
    
    -- Security context
    ip_address INET,
    user_agent TEXT,
    
    -- Timing
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Risk assessment
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ
);

-- Create user_impersonation_permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_impersonation_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Admin user with impersonation permissions
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Permission scope
    can_impersonate_roles TEXT[] NOT NULL DEFAULT ARRAY['homeowner', 'rtm-director', 'rmc-director', 'management-company'],
    can_impersonate_buildings UUID[], -- NULL means all buildings
    
    -- Session limits
    max_session_duration_minutes INTEGER NOT NULL DEFAULT 120, -- 2 hours
    max_daily_sessions INTEGER NOT NULL DEFAULT 10,
    max_concurrent_sessions INTEGER NOT NULL DEFAULT 1,
    
    -- Allowed actions during impersonation
    allowed_actions TEXT[] NOT NULL DEFAULT ARRAY[
        'page_visit',
        'data_view',
        'document_download'
    ],
    restricted_actions TEXT[] NOT NULL DEFAULT ARRAY[
        'financial_transaction',
        'user_data_change',
        'password_reset',
        'email_change',
        'role_change'
    ],
    
    -- Permission metadata
    granted_by UUID NOT NULL REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Ensure one permission record per admin
    CONSTRAINT unique_admin_permissions UNIQUE (admin_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_admin_user ON user_impersonation_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_target_user ON user_impersonation_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_session ON user_impersonation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_status ON user_impersonation_logs(status);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_started_at ON user_impersonation_logs(started_at);

CREATE INDEX IF NOT EXISTS idx_impersonation_actions_session ON user_impersonation_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_actions_admin ON user_impersonation_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_actions_type ON user_impersonation_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_impersonation_actions_performed_at ON user_impersonation_actions(performed_at);
CREATE INDEX IF NOT EXISTS idx_impersonation_actions_risk_level ON user_impersonation_actions(risk_level);

CREATE INDEX IF NOT EXISTS idx_impersonation_permissions_admin ON user_impersonation_permissions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_permissions_active ON user_impersonation_permissions(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_impersonation_logs_updated_at 
    BEFORE UPDATE ON user_impersonation_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_impersonation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impersonation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impersonation_permissions ENABLE ROW LEVEL SECURITY;

-- Impersonation logs policies
CREATE POLICY "Super admins can view all impersonation logs" ON user_impersonation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super-admin'
        )
    );

CREATE POLICY "Super admins can insert impersonation logs" ON user_impersonation_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super-admin'
        )
        AND admin_user_id = auth.uid()
    );

CREATE POLICY "Super admins can update their own impersonation logs" ON user_impersonation_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super-admin'
        )
        AND admin_user_id = auth.uid()
    );

-- Impersonation actions policies
CREATE POLICY "Super admins can view all impersonation actions" ON user_impersonation_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super-admin'
        )
    );

CREATE POLICY "Super admins can insert impersonation actions" ON user_impersonation_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super-admin'
        )
        AND admin_user_id = auth.uid()
    );

-- Impersonation permissions policies
CREATE POLICY "Super admins can view all impersonation permissions" ON user_impersonation_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super-admin'
        )
    );

CREATE POLICY "Super admins can manage impersonation permissions" ON user_impersonation_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super-admin'
        )
    );

-- Grant permissions to authenticated users (RLS will handle access control)
GRANT SELECT, INSERT, UPDATE ON user_impersonation_logs TO authenticated;
GRANT SELECT, INSERT ON user_impersonation_actions TO authenticated;
GRANT SELECT ON user_impersonation_permissions TO authenticated;

-- Grant permissions to service role for admin operations
GRANT ALL ON user_impersonation_logs TO service_role;
GRANT ALL ON user_impersonation_actions TO service_role;
GRANT ALL ON user_impersonation_permissions TO service_role;

-- Insert default permissions for frankie@manage.management
INSERT INTO user_impersonation_permissions (
    admin_user_id,
    can_impersonate_roles,
    max_session_duration_minutes,
    max_daily_sessions,
    max_concurrent_sessions,
    allowed_actions,
    restricted_actions,
    granted_by
) 
SELECT 
    auth.users.id,
    ARRAY['homeowner', 'rtm-director', 'rmc-director', 'management-company'],
    180, -- 3 hours for main super admin
    20,  -- Higher daily limit
    2,   -- Can have 2 concurrent sessions
    ARRAY[
        'page_visit',
        'data_view',
        'data_modification',
        'document_upload',
        'document_download',
        'document_delete',
        'settings_change'
    ],
    ARRAY[
        'password_reset',
        'email_change',
        'role_change'
    ],
    auth.users.id
FROM auth.users 
WHERE auth.users.email = 'frankie@manage.management'
AND NOT EXISTS (
    SELECT 1 FROM user_impersonation_permissions 
    WHERE admin_user_id = auth.users.id
);

-- Create view for active impersonation sessions
CREATE OR REPLACE VIEW active_impersonation_sessions AS
SELECT 
    uil.session_id,
    uil.admin_user_id,
    uil.admin_email,
    uil.target_user_id,
    uil.target_email,
    uil.target_role,
    uil.reason,
    uil.started_at,
    EXTRACT(EPOCH FROM (NOW() - uil.started_at)) / 60 AS duration_minutes,
    uip.max_session_duration_minutes,
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - uil.started_at)) / 60 > uip.max_session_duration_minutes 
        THEN TRUE 
        ELSE FALSE 
    END AS is_expired
FROM user_impersonation_logs uil
JOIN user_impersonation_permissions uip ON uil.admin_user_id = uip.admin_user_id
WHERE uil.status = 'active'
AND uip.is_active = TRUE;
