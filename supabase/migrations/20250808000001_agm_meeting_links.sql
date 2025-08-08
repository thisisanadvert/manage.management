/*
  # AGM Meeting Links Schema
  
  This migration adds support for secure, unique AGM meeting links.
  
  ## New Tables:
  - agm_meeting_links: Secure links for accessing AGM meetings
  
  ## Security:
  - Enable RLS on all tables
  - Building-based access control policies
*/

-- Create AGM meeting links table
CREATE TABLE IF NOT EXISTS agm_meeting_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES agm_meetings(id) ON DELETE CASCADE,
  link_token UUID NOT NULL UNIQUE,
  access_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agm_meeting_links_meeting_id ON agm_meeting_links(meeting_id);
CREATE INDEX IF NOT EXISTS idx_agm_meeting_links_token ON agm_meeting_links(link_token);
CREATE INDEX IF NOT EXISTS idx_agm_meeting_links_active ON agm_meeting_links(is_active);

-- Enable Row Level Security
ALTER TABLE agm_meeting_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agm_meeting_links

-- Super admin access
CREATE POLICY "Super admin can manage all AGM meeting links" ON agm_meeting_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'frankie@manage.management'
    )
  );

-- Building members can view links for meetings in their buildings
CREATE POLICY "Building members can view AGM meeting links" ON agm_meeting_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agm_meetings
      JOIN building_users ON building_users.building_id = agm_meetings.building_id
      WHERE agm_meetings.id = agm_meeting_links.meeting_id
      AND building_users.user_id = auth.uid()
    )
  );

-- Directors can create and manage links for meetings in their buildings
CREATE POLICY "Directors can manage AGM meeting links" ON agm_meeting_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agm_meetings
      JOIN building_users ON building_users.building_id = agm_meetings.building_id
      WHERE agm_meetings.id = agm_meeting_links.meeting_id
      AND building_users.user_id = auth.uid()
      AND building_users.role IN ('rtm-director', 'rmc-director')
    )
  );

-- Meeting hosts can manage links for their meetings
CREATE POLICY "Hosts can manage links for their AGM meetings" ON agm_meeting_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agm_meetings
      WHERE agm_meetings.id = agm_meeting_links.meeting_id
      AND agm_meetings.host_id = auth.uid()
    )
  );

-- Public access for link validation (needed for anonymous access)
CREATE POLICY "Public can validate AGM meeting links" ON agm_meeting_links
  FOR SELECT USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses)
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agm_meeting_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agm_meeting_links_updated_at
  BEFORE UPDATE ON agm_meeting_links
  FOR EACH ROW
  EXECUTE FUNCTION update_agm_meeting_links_updated_at();
