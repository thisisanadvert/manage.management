-- MRI Credentials Storage Table
-- Secure storage for MRI API credentials with encryption and access control

-- Create credentials table
CREATE TABLE IF NOT EXISTS mri_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL, -- Will be encrypted at application level
  api_base_url TEXT NOT NULL DEFAULT 'https://api.vaultre.com.au',
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id)
);

-- Enable RLS
ALTER TABLE mri_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admin can manage all MRI credentials" ON mri_credentials
  FOR ALL USING (auth.jwt() ->> 'email' = 'frankie@manage.management');

CREATE POLICY "Directors can manage MRI credentials for their buildings" ON mri_credentials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_credentials.building_id
      AND role IN ('rtm-director', 'rmc-director')
    )
  );

CREATE POLICY "Management companies can view MRI credentials for managed buildings" ON mri_credentials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data ->> 'role' = 'management-company'
    ) AND
    EXISTS (
      SELECT 1 FROM building_users 
      WHERE user_id = auth.uid() 
      AND building_id = mri_credentials.building_id
      AND role = 'management-company'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_mri_credentials_updated_at 
  BEFORE UPDATE ON mri_credentials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger
CREATE TRIGGER mri_credentials_audit 
  AFTER INSERT OR UPDATE OR DELETE ON mri_credentials
  FOR EACH ROW EXECUTE FUNCTION mri_audit_trigger();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_mri_credentials_building_id ON mri_credentials(building_id);
CREATE INDEX IF NOT EXISTS idx_mri_credentials_active ON mri_credentials(is_active);

-- Create function to encrypt/decrypt credentials (placeholder for application-level encryption)
CREATE OR REPLACE FUNCTION encrypt_mri_credentials()
RETURNS TRIGGER AS $$
BEGIN
  -- In a real implementation, you would encrypt the client_secret here
  -- For now, we'll just log the operation
  INSERT INTO mri_audit_log (
    table_name, 
    record_id, 
    action, 
    new_values, 
    changed_by, 
    building_id
  ) VALUES (
    'mri_credentials',
    NEW.id::text,
    'CREDENTIAL_UPDATE',
    jsonb_build_object(
      'building_id', NEW.building_id,
      'environment', NEW.environment,
      'api_base_url', NEW.api_base_url,
      'has_client_id', (NEW.client_id IS NOT NULL AND NEW.client_id != ''),
      'has_client_secret', (NEW.client_secret IS NOT NULL AND NEW.client_secret != '')
    ),
    auth.uid(),
    NEW.building_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply encryption trigger
CREATE TRIGGER encrypt_mri_credentials_trigger
  AFTER INSERT OR UPDATE ON mri_credentials
  FOR EACH ROW EXECUTE FUNCTION encrypt_mri_credentials();

-- Create function to get credentials for a building (with access control)
CREATE OR REPLACE FUNCTION get_mri_credentials(building_uuid UUID)
RETURNS TABLE (
  client_id TEXT,
  api_base_url TEXT,
  environment TEXT,
  is_active BOOLEAN,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if user has access to this building
  IF NOT EXISTS (
    SELECT 1 FROM building_users 
    WHERE user_id = auth.uid() 
    AND building_id = building_uuid
    AND role IN ('rtm-director', 'rmc-director', 'management-company')
  ) AND auth.jwt() ->> 'email' != 'frankie@manage.management' THEN
    RAISE EXCEPTION 'Access denied: insufficient permissions for building %', building_uuid;
  END IF;

  -- Return credentials (excluding sensitive client_secret)
  RETURN QUERY
  SELECT 
    mc.client_id,
    mc.api_base_url,
    mc.environment,
    mc.is_active,
    mc.updated_at
  FROM mri_credentials mc
  WHERE mc.building_id = building_uuid
  AND mc.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to test if credentials exist for a building
CREATE OR REPLACE FUNCTION has_mri_credentials(building_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM mri_credentials 
    WHERE building_id = building_uuid 
    AND is_active = true
    AND client_id IS NOT NULL 
    AND client_id != ''
    AND client_secret IS NOT NULL 
    AND client_secret != ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_mri_credentials(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_mri_credentials(UUID) TO authenticated;
