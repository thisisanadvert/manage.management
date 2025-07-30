/*
  # RTM Timeline Evidence Table

  1. New Table
    - rtm_timeline_evidence: Store evidence documents linked to RTM timeline steps

  2. Security
    - Enable RLS on the table
    - Add policies for user-based access control
*/

-- Create RTM Timeline Evidence table
CREATE TABLE IF NOT EXISTS rtm_timeline_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  document_id UUID REFERENCES onboarding_documents(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  service_date DATE,
  service_method TEXT,
  recipient_name TEXT,
  recipient_address TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rtm_timeline_evidence ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own RTM evidence" ON rtm_timeline_evidence
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own RTM evidence" ON rtm_timeline_evidence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RTM evidence" ON rtm_timeline_evidence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RTM evidence" ON rtm_timeline_evidence
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_rtm_timeline_evidence_user_id ON rtm_timeline_evidence(user_id);
CREATE INDEX idx_rtm_timeline_evidence_step_id ON rtm_timeline_evidence(step_id);
CREATE INDEX idx_rtm_timeline_evidence_document_id ON rtm_timeline_evidence(document_id);
CREATE INDEX idx_rtm_timeline_evidence_created_at ON rtm_timeline_evidence(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_rtm_timeline_evidence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rtm_timeline_evidence_updated_at
  BEFORE UPDATE ON rtm_timeline_evidence
  FOR EACH ROW
  EXECUTE FUNCTION update_rtm_timeline_evidence_updated_at();
