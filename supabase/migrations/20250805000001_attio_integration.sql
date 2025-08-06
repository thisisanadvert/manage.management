/*
  # Attio CRM Integration

  1. New Tables
    - `attio_sync_log` - Tracks all syncs to Attio CRM
    - `attio_settings` - Stores Attio configuration per building

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control

  3. Functions
    - Trigger function to auto-sync new interest registrations
*/

-- Create Attio sync log table
CREATE TABLE IF NOT EXISTS attio_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attio_person_id text,
  attio_company_id text,
  source text NOT NULL DEFAULT 'manual', -- 'rtm-qualify', 'signup', 'manual', etc.
  sync_status text NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed', 'retry')),
  error_message text,
  qualification_data jsonb,
  building_info jsonb,
  user_id uuid REFERENCES auth.users(id),
  building_id uuid REFERENCES buildings(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz
);

-- Create Attio settings table
CREATE TABLE IF NOT EXISTS attio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) UNIQUE,
  api_key_encrypted text, -- Store encrypted API key
  auto_sync_enabled boolean DEFAULT true,
  sync_on_signup boolean DEFAULT true,
  sync_on_qualification boolean DEFAULT true,
  default_person_tags text[] DEFAULT ARRAY['RTM Lead'],
  default_company_category text DEFAULT 'Residential Building',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE attio_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE attio_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attio_sync_log
CREATE POLICY "Users can view their building's Attio sync logs"
  ON attio_sync_log
  FOR SELECT
  USING (
    building_id IN (
      SELECT building_id 
      FROM user_building_access 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all Attio sync logs"
  ON attio_sync_log
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "System can insert Attio sync logs"
  ON attio_sync_log
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for attio_settings
CREATE POLICY "Building members can view Attio settings"
  ON attio_settings
  FOR SELECT
  USING (
    building_id IN (
      SELECT building_id 
      FROM user_building_access 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "RTM/RMC directors can manage Attio settings"
  ON attio_settings
  FOR ALL
  USING (
    building_id IN (
      SELECT uba.building_id 
      FROM user_building_access uba
      JOIN auth.users u ON u.id = uba.user_id
      WHERE uba.user_id = auth.uid()
      AND (u.raw_user_meta_data->>'role' LIKE '%director%' OR u.raw_user_meta_data->>'role' = 'management-company')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS attio_sync_log_email_idx ON attio_sync_log (email);
CREATE INDEX IF NOT EXISTS attio_sync_log_building_id_idx ON attio_sync_log (building_id);
CREATE INDEX IF NOT EXISTS attio_sync_log_status_idx ON attio_sync_log (sync_status);
CREATE INDEX IF NOT EXISTS attio_sync_log_created_at_idx ON attio_sync_log (created_at);
CREATE INDEX IF NOT EXISTS attio_settings_building_id_idx ON attio_settings (building_id);

-- Function to automatically sync new interest registrations to Attio
CREATE OR REPLACE FUNCTION sync_interest_registration_to_attio()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if this is a new registration
  IF TG_OP = 'INSERT' THEN
    -- Call the Attio sync function asynchronously
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/sync-to-attio',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'firstName', NEW.first_name,
        'lastName', NEW.last_name,
        'phone', NEW.phone,
        'role', NEW.role,
        'buildingName', NEW.building_name,
        'buildingAddress', NEW.building_address,
        'unitNumber', NEW.unit_number,
        'companyName', NEW.company_name,
        'source', 'interest-registration'
      )
    );
    
    -- Log the sync attempt
    INSERT INTO attio_sync_log (
      email,
      source,
      sync_status,
      building_info
    ) VALUES (
      NEW.email,
      'interest-registration',
      'pending',
      jsonb_build_object(
        'name', NEW.building_name,
        'address', NEW.building_address,
        'unit_number', NEW.unit_number,
        'company_name', NEW.company_name
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for interest registrations
DROP TRIGGER IF EXISTS trigger_sync_interest_registration_to_attio ON interest_registrations;
CREATE TRIGGER trigger_sync_interest_registration_to_attio
  AFTER INSERT ON interest_registrations
  FOR EACH ROW
  EXECUTE FUNCTION sync_interest_registration_to_attio();

-- Function to sync user signups to Attio
CREATE OR REPLACE FUNCTION sync_user_signup_to_attio()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata jsonb;
  rtm_data jsonb;
BEGIN
  -- Only sync if this is a new user with RTM qualification data
  IF TG_OP = 'INSERT' AND NEW.raw_user_meta_data IS NOT NULL THEN
    user_metadata := NEW.raw_user_meta_data;
    rtm_data := user_metadata->'rtmQualificationData';
    
    -- Check if user came from RTM qualification
    IF user_metadata->>'signupSource' = 'rtm-qualify' AND rtm_data IS NOT NULL THEN
      -- Call the Attio sync function asynchronously
      PERFORM net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/sync-to-attio',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'firstName', user_metadata->>'firstName',
          'lastName', user_metadata->>'lastName',
          'phone', user_metadata->>'phone',
          'role', user_metadata->>'role',
          'buildingName', user_metadata->>'buildingName',
          'buildingAddress', user_metadata->>'buildingAddress',
          'unitNumber', user_metadata->>'unitNumber',
          'qualificationData', rtm_data,
          'source', 'rtm-signup'
        )
      );
      
      -- Log the sync attempt
      INSERT INTO attio_sync_log (
        email,
        source,
        sync_status,
        qualification_data,
        user_id,
        building_info
      ) VALUES (
        NEW.email,
        'rtm-signup',
        'pending',
        rtm_data,
        NEW.id,
        jsonb_build_object(
          'name', user_metadata->>'buildingName',
          'address', user_metadata->>'buildingAddress',
          'unit_number', user_metadata->>'unitNumber'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user signups
DROP TRIGGER IF EXISTS trigger_sync_user_signup_to_attio ON auth.users;
CREATE TRIGGER trigger_sync_user_signup_to_attio
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_signup_to_attio();

-- Function to sync building setup to Attio
CREATE OR REPLACE FUNCTION sync_building_setup_to_attio()
RETURNS TRIGGER AS $$
DECLARE
  building_owner_email text;
  building_owner_name text;
  building_owner_role text;
BEGIN
  -- Get the building owner/creator details
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Try to get the user who created/owns this building
    SELECT
      u.email,
      COALESCE(
        u.raw_user_meta_data->>'firstName' || ' ' || u.raw_user_meta_data->>'lastName',
        u.email
      ) as full_name,
      COALESCE(u.raw_user_meta_data->>'role', 'building-owner') as user_role
    INTO building_owner_email, building_owner_name, building_owner_role
    FROM auth.users u
    WHERE u.id = NEW.created_by
    LIMIT 1;

    -- If no creator found, try to find any user associated with this building
    IF building_owner_email IS NULL THEN
      SELECT
        u.email,
        COALESCE(
          u.raw_user_meta_data->>'firstName' || ' ' || u.raw_user_meta_data->>'lastName',
          u.email
        ) as full_name,
        COALESCE(u.raw_user_meta_data->>'role', 'building-owner') as user_role
      INTO building_owner_email, building_owner_name, building_owner_role
      FROM auth.users u
      JOIN building_users bu ON bu.user_id = u.id
      WHERE bu.building_id = NEW.id
      LIMIT 1;
    END IF;

    -- If we found a user, sync to Attio
    IF building_owner_email IS NOT NULL THEN
      -- Call the Attio sync function asynchronously
      PERFORM net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/sync-to-attio',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'email', building_owner_email,
          'firstName', split_part(building_owner_name, ' ', 1),
          'lastName', CASE
            WHEN position(' ' in building_owner_name) > 0
            THEN substring(building_owner_name from position(' ' in building_owner_name) + 1)
            ELSE ''
          END,
          'role', building_owner_role,
          'buildingName', NEW.name,
          'buildingAddress', NEW.address,
          'buildingData', jsonb_build_object(
            'total_units', NEW.total_units,
            'building_age', NEW.building_age,
            'building_type', NEW.building_type,
            'service_charge_frequency', NEW.service_charge_frequency,
            'management_structure', NEW.management_structure
          ),
          'source', CASE WHEN TG_OP = 'INSERT' THEN 'building-setup' ELSE 'building-update' END
        )
      );

      -- Log the sync attempt
      INSERT INTO attio_sync_log (
        email,
        source,
        sync_status,
        building_id,
        building_info
      ) VALUES (
        building_owner_email,
        CASE WHEN TG_OP = 'INSERT' THEN 'building-setup' ELSE 'building-update' END,
        'pending',
        NEW.id,
        jsonb_build_object(
          'name', NEW.name,
          'address', NEW.address,
          'total_units', NEW.total_units,
          'building_age', NEW.building_age,
          'building_type', NEW.building_type,
          'service_charge_frequency', NEW.service_charge_frequency,
          'management_structure', NEW.management_structure
        )
      );
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for building setup/updates
DROP TRIGGER IF EXISTS trigger_sync_building_setup_to_attio ON buildings;
CREATE TRIGGER trigger_sync_building_setup_to_attio
  AFTER INSERT OR UPDATE ON buildings
  FOR EACH ROW
  EXECUTE FUNCTION sync_building_setup_to_attio();
