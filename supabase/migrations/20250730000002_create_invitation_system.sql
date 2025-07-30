/*
  # Comprehensive User Invitation System

  1. New Tables
    - building_invitations: Core invitation codes and management
    - user_building_roles: Enhanced user-building associations with roles
    - invitation_responses: Track invitation acceptance/rejection

  2. Security
    - Enable RLS on all tables
    - Add policies for building-based access control
    - Ensure only directors can create invitations

  3. Features
    - Unique invitation codes with expiration
    - Role-based permissions (director, leaseholder, stakeholder)
    - Integration context tracking (survey, company formation, general)
    - Audit trail for invitation lifecycle
*/

-- Create enhanced user roles enum
CREATE TYPE user_building_role AS ENUM (
  'rtm_director',
  'rmc_director', 
  'leaseholder',
  'freeholder',
  'stakeholder',
  'management_company',
  'pending'
);

-- Create invitation context enum
CREATE TYPE invitation_context AS ENUM (
  'general',
  'leaseholder_survey',
  'company_formation',
  'director_invitation',
  'building_setup'
);

-- Create invitation status enum
CREATE TYPE invitation_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired',
  'revoked'
);

-- Building Invitations Table
CREATE TABLE IF NOT EXISTS building_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Invitation details
  invitation_code TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  invited_role user_building_role NOT NULL DEFAULT 'leaseholder',
  context invitation_context NOT NULL DEFAULT 'general',
  
  -- Personal details
  first_name TEXT,
  last_name TEXT,
  unit_number TEXT,
  phone TEXT,
  
  -- Context-specific data
  context_data JSONB DEFAULT '{}',
  
  -- Status and lifecycle
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  invitation_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT valid_acceptance CHECK (
    (status = 'accepted' AND accepted_at IS NOT NULL AND accepted_by IS NOT NULL) OR
    (status != 'accepted' AND accepted_at IS NULL AND accepted_by IS NULL)
  )
);

-- Enhanced User Building Roles Table
CREATE TABLE IF NOT EXISTS user_building_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  
  -- Role information
  role user_building_role NOT NULL,
  unit_number TEXT,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  
  -- Permissions
  can_invite_users BOOLEAN DEFAULT FALSE,
  can_manage_finances BOOLEAN DEFAULT FALSE,
  can_manage_maintenance BOOLEAN DEFAULT FALSE,
  can_view_documents BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  invited_by UUID REFERENCES auth.users(id),
  invitation_id UUID REFERENCES building_invitations(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, building_id),
  CONSTRAINT valid_director_permissions CHECK (
    (role IN ('rtm_director', 'rmc_director') AND can_invite_users = TRUE) OR
    (role NOT IN ('rtm_director', 'rmc_director'))
  )
);

-- Invitation Responses Table (for audit trail)
CREATE TABLE IF NOT EXISTS invitation_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES building_invitations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Response details
  response_type invitation_status NOT NULL,
  response_message TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_response_type CHECK (response_type IN ('accepted', 'rejected'))
);

-- Enable RLS
ALTER TABLE building_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_building_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_responses ENABLE ROW LEVEL SECURITY;

-- Building Invitations Policies
CREATE POLICY "Directors can view building invitations" ON building_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_building_roles ubr 
      WHERE ubr.user_id = auth.uid() 
      AND ubr.building_id = building_invitations.building_id 
      AND ubr.role IN ('rtm_director', 'rmc_director')
      AND ubr.can_invite_users = TRUE
    )
  );

CREATE POLICY "Directors can create building invitations" ON building_invitations
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM user_building_roles ubr 
      WHERE ubr.user_id = auth.uid() 
      AND ubr.building_id = building_invitations.building_id 
      AND ubr.role IN ('rtm_director', 'rmc_director')
      AND ubr.can_invite_users = TRUE
    )
  );

CREATE POLICY "Directors can update their building invitations" ON building_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_building_roles ubr 
      WHERE ubr.user_id = auth.uid() 
      AND ubr.building_id = building_invitations.building_id 
      AND ubr.role IN ('rtm_director', 'rmc_director')
      AND ubr.can_invite_users = TRUE
    )
  );

CREATE POLICY "Anyone can view invitations by code" ON building_invitations
  FOR SELECT USING (TRUE);

-- User Building Roles Policies
CREATE POLICY "Users can view their own building roles" ON user_building_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Building members can view other building roles" ON user_building_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_building_roles ubr 
      WHERE ubr.user_id = auth.uid() 
      AND ubr.building_id = user_building_roles.building_id
    )
  );

CREATE POLICY "Directors can manage building roles" ON user_building_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_building_roles ubr 
      WHERE ubr.user_id = auth.uid() 
      AND ubr.building_id = user_building_roles.building_id 
      AND ubr.role IN ('rtm_director', 'rmc_director')
      AND ubr.can_invite_users = TRUE
    )
  );

CREATE POLICY "Users can insert their own building role" ON user_building_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invitation Responses Policies
CREATE POLICY "Users can view invitation responses" ON invitation_responses
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM building_invitations bi
      JOIN user_building_roles ubr ON ubr.building_id = bi.building_id
      WHERE bi.id = invitation_responses.invitation_id
      AND ubr.user_id = auth.uid()
      AND ubr.role IN ('rtm_director', 'rmc_director')
    )
  );

CREATE POLICY "Users can create invitation responses" ON invitation_responses
  FOR INSERT WITH CHECK (TRUE);

-- Create indexes for performance
CREATE INDEX idx_building_invitations_building_id ON building_invitations(building_id);
CREATE INDEX idx_building_invitations_code ON building_invitations(invitation_code);
CREATE INDEX idx_building_invitations_email ON building_invitations(email);
CREATE INDEX idx_building_invitations_status ON building_invitations(status);
CREATE INDEX idx_building_invitations_expires_at ON building_invitations(expires_at);

CREATE INDEX idx_user_building_roles_user_id ON user_building_roles(user_id);
CREATE INDEX idx_user_building_roles_building_id ON user_building_roles(building_id);
CREATE INDEX idx_user_building_roles_role ON user_building_roles(role);

CREATE INDEX idx_invitation_responses_invitation_id ON invitation_responses(invitation_id);
CREATE INDEX idx_invitation_responses_user_id ON invitation_responses(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_building_invitations_updated_at
  BEFORE UPDATE ON building_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_building_roles_updated_at
  BEFORE UPDATE ON user_building_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM building_invitations WHERE invitation_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE building_invitations 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
  AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;
