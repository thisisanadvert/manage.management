/*
  # AGM Meetings Schema
  
  This migration adds support for AGM video conferencing with Jitsi Meet integration.
  
  ## New Tables:
  - agm_meetings: Core meeting management with Jitsi room integration
  - agm_meeting_participants: Track meeting attendance and participation
  
  ## Security:
  - Enable RLS on all tables
  - Building-based access control policies
  - Host permissions for meeting management
*/

-- Create AGM meetings table
CREATE TABLE IF NOT EXISTS agm_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agm_id INTEGER NOT NULL, -- References the AGM ID from the frontend data
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  room_name VARCHAR(255) NOT NULL UNIQUE, -- Jitsi room name
  host_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  participants_count INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 50,
  recording_enabled BOOLEAN DEFAULT false,
  recording_url TEXT,
  meeting_password VARCHAR(50), -- Optional password for meeting
  jitsi_config JSONB, -- Store Jitsi-specific configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AGM meeting participants table
CREATE TABLE IF NOT EXISTS agm_meeting_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES agm_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL for anonymous participants
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'participant' CHECK (role IN ('host', 'moderator', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  user_agent TEXT, -- Browser/device info
  ip_address INET, -- For audit purposes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agm_meetings_building_id ON agm_meetings(building_id);
CREATE INDEX IF NOT EXISTS idx_agm_meetings_agm_id ON agm_meetings(agm_id);
CREATE INDEX IF NOT EXISTS idx_agm_meetings_host_id ON agm_meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_agm_meetings_status ON agm_meetings(status);
CREATE INDEX IF NOT EXISTS idx_agm_meetings_start_time ON agm_meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_agm_meeting_participants_meeting_id ON agm_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_agm_meeting_participants_user_id ON agm_meeting_participants(user_id);

-- Enable Row Level Security
ALTER TABLE agm_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agm_meeting_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agm_meetings

-- Super admin access
CREATE POLICY "Super admin can manage all AGM meetings" ON agm_meetings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
  );

-- Building members can view meetings for their buildings
CREATE POLICY "Building members can view AGM meetings" ON agm_meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = agm_meetings.building_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Directors can create and manage meetings for their buildings
CREATE POLICY "Directors can manage AGM meetings" ON agm_meetings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM building_users
      WHERE building_users.building_id = agm_meetings.building_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'rmc-director')
    )
  );

-- Meeting hosts can always manage their meetings
CREATE POLICY "Hosts can manage their AGM meetings" ON agm_meetings
  FOR ALL USING (host_id = auth.uid());

-- RLS Policies for agm_meeting_participants

-- Super admin access
CREATE POLICY "Super admin can manage all AGM meeting participants" ON agm_meeting_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
  );

-- Building members can view participants for meetings in their buildings
CREATE POLICY "Building members can view AGM meeting participants" ON agm_meeting_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agm_meetings
      JOIN building_users ON building_users.building_id = agm_meetings.building_id
      WHERE agm_meetings.id = agm_meeting_participants.meeting_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Directors can manage participants for meetings in their buildings
CREATE POLICY "Directors can manage AGM meeting participants" ON agm_meeting_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agm_meetings
      JOIN building_users ON building_users.building_id = agm_meetings.building_id
      WHERE agm_meetings.id = agm_meeting_participants.meeting_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'rmc-director')
    )
  );

-- Meeting hosts can manage participants for their meetings
CREATE POLICY "Hosts can manage participants for their AGM meetings" ON agm_meeting_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agm_meetings
      WHERE agm_meetings.id = agm_meeting_participants.meeting_id
      AND agm_meetings.host_id = auth.uid()
    )
  );

-- Users can manage their own participation records
CREATE POLICY "Users can manage their own AGM meeting participation" ON agm_meeting_participants
  FOR ALL USING (user_id = auth.uid());

-- Create function to generate unique room names
CREATE OR REPLACE FUNCTION generate_agm_room_name(p_building_id UUID, p_agm_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  building_name TEXT;
  room_name TEXT;
  counter INTEGER := 1;
  final_room_name TEXT;
BEGIN
  -- Get building name and clean it for room name
  SELECT REGEXP_REPLACE(LOWER(name), '[^a-z0-9]', '', 'g') 
  INTO building_name 
  FROM buildings 
  WHERE id = p_building_id;
  
  -- Generate base room name
  room_name := 'agm-' || building_name || '-' || p_agm_id::TEXT;
  final_room_name := room_name;
  
  -- Ensure uniqueness by adding counter if needed
  WHILE EXISTS (SELECT 1 FROM agm_meetings WHERE room_name = final_room_name) LOOP
    final_room_name := room_name || '-' || counter::TEXT;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_room_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to update meeting status based on time
CREATE OR REPLACE FUNCTION update_agm_meeting_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update status based on current time
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF NOW() < NEW.start_time THEN
      NEW.status := 'scheduled';
    ELSIF NOW() >= NEW.start_time AND NOW() <= NEW.end_time THEN
      IF NEW.status = 'scheduled' THEN
        NEW.status := 'active';
      END IF;
    ELSIF NOW() > NEW.end_time THEN
      IF NEW.status IN ('scheduled', 'active') THEN
        NEW.status := 'ended';
      END IF;
    END IF;
  END IF;
  
  -- Update timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
CREATE TRIGGER trigger_update_agm_meeting_status
  BEFORE UPDATE ON agm_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_agm_meeting_status();

-- Create function to calculate participant duration
CREATE OR REPLACE FUNCTION calculate_participant_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration when participant leaves
  IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at)) / 60;
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participant duration calculation
CREATE TRIGGER trigger_calculate_participant_duration
  BEFORE UPDATE ON agm_meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION calculate_participant_duration();
