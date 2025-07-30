
/*
  # Complete Data Storage System
  
  This migration ensures ALL parts of the app that require data storage have proper database tables.
  Focuses on missing areas: RTM Formation, Enhanced Documents, and any gaps in existing systems.
*/

-- =====================================================
-- RTM FORMATION SYSTEM TABLES
-- =====================================================


-- RTM Eligibility Assessments
CREATE TABLE IF NOT EXISTS rtm_eligibility_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  assessment_data jsonb NOT NULL, -- Stores all eligibility criteria responses
  eligibility_result text NOT NULL CHECK (eligibility_result IN ('eligible', 'not_eligible', 'needs_review')),
  eligibility_score decimal(3,2), -- 0.00 to 1.00
  issues_identified text[],
  recommendations text[],
  assessment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leaseholder Survey Data
CREATE TABLE IF NOT EXISTS leaseholder_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  survey_title text NOT NULL,
  survey_description text,
  survey_template text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual Leaseholder Records
CREATE TABLE IF NOT EXISTS leaseholder_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES leaseholder_surveys(id) ON DELETE CASCADE,
  building_id uuid REFERENCES buildings(id),
  flat_number text NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  contact_method text DEFAULT 'email' CHECK (contact_method IN ('email', 'phone', 'post', 'door')),
  interested text DEFAULT 'pending' CHECK (interested IN ('yes', 'no', 'maybe', 'pending')),
  concerns text,
  response_date timestamptz,
  is_qualifying_tenant boolean DEFAULT true,
  lease_length_years integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RTM Company Formation Data
CREATE TABLE IF NOT EXISTS rtm_company_formations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  proposed_name text NOT NULL,
  alternative_names text[],
  registered_address text,
  company_secretary text,
  formation_status text NOT NULL DEFAULT 'planning' CHECK (formation_status IN ('planning', 'in_progress', 'submitted', 'approved', 'rejected')),
  companies_house_number text,
  incorporation_date date,
  articles_generated boolean DEFAULT false,
  articles_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RTM Company Directors
CREATE TABLE IF NOT EXISTS rtm_company_directors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_formation_id uuid REFERENCES rtm_company_formations(id) ON DELETE CASCADE,
  name text NOT NULL,
  flat_number text NOT NULL,
  email text NOT NULL,
  is_qualifying_tenant boolean DEFAULT true,
  has_consented boolean DEFAULT false,
  is_existing_user boolean DEFAULT false,
  invitation_sent boolean DEFAULT false,
  invitation_sent_at timestamptz,
  consent_received_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RTM Notice Generation
CREATE TABLE IF NOT EXISTS rtm_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  company_formation_id uuid REFERENCES rtm_company_formations(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  notice_type text NOT NULL CHECK (notice_type IN ('claim_notice', 'counter_notice', 'invitation_notice')),
  notice_title text NOT NULL,
  notice_content text NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('landlord', 'leaseholders', 'management_company', 'all')),
  recipients jsonb, -- Array of recipient details
  served_date date,
  response_deadline date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'served', 'responded', 'expired')),
  file_path text, -- Generated PDF path
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RTM Timeline Milestones - Enhanced tracking system
CREATE TABLE IF NOT EXISTS rtm_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'eligibility_assessment',
    'company_formation',
    'claim_notice_served',
    'counter_notice_period',
    'acquisition_complete'
  )),
  milestone_title text NOT NULL,
  milestone_description text,

  -- Status and timing
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  started_date timestamptz,
  completed_date timestamptz,
  target_completion_date timestamptz,

  -- Statutory deadlines and calculations
  statutory_deadline_days integer, -- e.g., 90 days for acquisition after claim notice
  calculated_deadline timestamptz, -- Auto-calculated based on previous milestones

  -- Evidence and documentation
  evidence_required boolean DEFAULT false,
  evidence_description text,

  -- Dependencies
  depends_on_milestone_id uuid REFERENCES rtm_milestones(id),

  -- Metadata
  milestone_order integer NOT NULL DEFAULT 0,
  is_critical boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RTM Evidence Documents
CREATE TABLE IF NOT EXISTS rtm_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid REFERENCES rtm_milestones(id) NOT NULL,
  building_id uuid REFERENCES buildings(id) NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,

  -- Document details
  document_type text NOT NULL CHECK (document_type IN (
    'proof_of_postage',
    'service_certificate',
    'claim_notice_copy',
    'counter_notice',
    'companies_house_certificate',
    'bank_account_confirmation',
    'handover_documents',
    'other'
  )),
  document_title text NOT NULL,
  document_description text,
  file_path text NOT NULL,
  file_size integer,
  file_type text,

  -- Service details (for notices)
  service_date date,
  service_method text, -- 'recorded_delivery', 'hand_delivery', 'email', 'other'
  recipient_name text,
  recipient_address text,

  -- Verification
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  verification_notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RTM Timeline Progress Tracking
CREATE TABLE IF NOT EXISTS rtm_timeline_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,

  -- Current state
  current_milestone_id uuid REFERENCES rtm_milestones(id),
  overall_status text NOT NULL DEFAULT 'not_started' CHECK (overall_status IN (
    'not_started',
    'eligibility_phase',
    'formation_phase',
    'notice_phase',
    'waiting_period',
    'acquisition_phase',
    'completed',
    'disputed',
    'abandoned'
  )),

  -- Key dates
  process_started_date timestamptz DEFAULT now(),
  claim_notice_served_date timestamptz,
  counter_notice_deadline timestamptz,
  acquisition_date timestamptz,
  process_completed_date timestamptz,

  -- Progress metrics
  total_milestones integer DEFAULT 0,
  completed_milestones integer DEFAULT 0,
  progress_percentage decimal(5,2) DEFAULT 0.00,

  -- Alerts and notifications
  next_action_required text,
  next_deadline timestamptz,
  days_until_next_deadline integer,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- ENHANCED DOCUMENTS SYSTEM
-- =====================================================

-- Comprehensive Document Repository
CREATE TABLE IF NOT EXISTS document_repository (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  category text NOT NULL CHECK (category IN ('legal', 'financial', 'insurance', 'maintenance', 'admin', 'rtm', 'compliance')),
  tags text[],
  version integer DEFAULT 1,
  is_current_version boolean DEFAULT true,
  parent_document_id uuid REFERENCES document_repository(id), -- For versioning
  access_level text NOT NULL DEFAULT 'building' CHECK (access_level IN ('public', 'building', 'directors_only', 'private')),
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  expiry_date date,
  is_archived boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Access Log
CREATE TABLE IF NOT EXISTS document_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES document_repository(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  access_type text NOT NULL CHECK (access_type IN ('view', 'download', 'edit', 'delete')),
  ip_address inet,
  user_agent text,
  accessed_at timestamptz DEFAULT now()
);

-- Document Comments/Annotations
CREATE TABLE IF NOT EXISTS document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES document_repository(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  comment text NOT NULL,
  page_number integer,
  annotation_data jsonb, -- For PDF annotations
  is_resolved boolean DEFAULT false,
  parent_comment_id uuid REFERENCES document_comments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- MISSING FINANCIAL TABLES
-- =====================================================

-- Service Charge Demands (RICS Compliance)
CREATE TABLE IF NOT EXISTS service_charge_demands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  demand_period text NOT NULL, -- e.g., "2025-Q1", "2025"
  demand_type text NOT NULL CHECK (demand_type IN ('quarterly', 'annual', 'interim', 'final')),
  total_amount decimal(12,2) NOT NULL,
  due_date date NOT NULL,
  payment_deadline date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'overdue', 'cancelled')),
  issued_date date,
  rics_compliant boolean DEFAULT true,
  demand_breakdown jsonb NOT NULL, -- Detailed breakdown of charges
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Section 20 Consultations
CREATE TABLE IF NOT EXISTS section20_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id) NOT NULL,
  consultation_type text NOT NULL CHECK (consultation_type IN ('qualifying_works', 'qualifying_long_term_agreement')),
  project_title text NOT NULL,
  project_description text NOT NULL,
  estimated_cost decimal(12,2) NOT NULL,
  consultation_stage text NOT NULL DEFAULT 'notice_of_intention' CHECK (consultation_stage IN ('notice_of_intention', 'estimates_stage', 'final_stage', 'completed')),
  notice_date date,
  response_deadline date,
  contractor_estimates jsonb,
  leaseholder_responses jsonb,
  final_contractor text,
  final_cost decimal(12,2),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- RTM System Indexes
CREATE INDEX IF NOT EXISTS idx_rtm_eligibility_building_user ON rtm_eligibility_assessments(building_id, user_id);
CREATE INDEX IF NOT EXISTS idx_leaseholder_surveys_building ON leaseholder_surveys(building_id);
CREATE INDEX IF NOT EXISTS idx_leaseholder_records_survey ON leaseholder_records(survey_id);
CREATE INDEX IF NOT EXISTS idx_leaseholder_records_building ON leaseholder_records(building_id);
CREATE INDEX IF NOT EXISTS idx_rtm_formations_building ON rtm_company_formations(building_id);
CREATE INDEX IF NOT EXISTS idx_rtm_directors_formation ON rtm_company_directors(company_formation_id);
CREATE INDEX IF NOT EXISTS idx_rtm_notices_building ON rtm_notices(building_id);

-- Document System Indexes
CREATE INDEX IF NOT EXISTS idx_document_repository_building ON document_repository(building_id);
CREATE INDEX IF NOT EXISTS idx_document_repository_category ON document_repository(category);
CREATE INDEX IF NOT EXISTS idx_document_repository_tags ON document_repository USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_document_access_log_document ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_document ON document_comments(document_id);

-- Financial System Indexes
CREATE INDEX IF NOT EXISTS idx_service_charge_demands_building ON service_charge_demands(building_id);
CREATE INDEX IF NOT EXISTS idx_section20_consultations_building ON section20_consultations(building_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE rtm_eligibility_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaseholder_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaseholder_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtm_company_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtm_company_directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtm_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtm_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtm_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtm_timeline_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_repository ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charge_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE section20_consultations ENABLE ROW LEVEL SECURITY;

-- Indexes for enhanced RTM timeline system
CREATE INDEX IF NOT EXISTS idx_rtm_milestones_building_id ON rtm_milestones(building_id);
CREATE INDEX IF NOT EXISTS idx_rtm_milestones_status ON rtm_milestones(status);
CREATE INDEX IF NOT EXISTS idx_rtm_milestones_type ON rtm_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_rtm_milestones_deadline ON rtm_milestones(calculated_deadline);
CREATE INDEX IF NOT EXISTS idx_rtm_milestones_order ON rtm_milestones(building_id, milestone_order);

CREATE INDEX IF NOT EXISTS idx_rtm_evidence_milestone_id ON rtm_evidence(milestone_id);
CREATE INDEX IF NOT EXISTS idx_rtm_evidence_building_id ON rtm_evidence(building_id);
CREATE INDEX IF NOT EXISTS idx_rtm_evidence_type ON rtm_evidence(document_type);
CREATE INDEX IF NOT EXISTS idx_rtm_evidence_service_date ON rtm_evidence(service_date);

CREATE INDEX IF NOT EXISTS idx_rtm_timeline_progress_building_id ON rtm_timeline_progress(building_id);
CREATE INDEX IF NOT EXISTS idx_rtm_timeline_progress_status ON rtm_timeline_progress(overall_status);
CREATE INDEX IF NOT EXISTS idx_rtm_timeline_progress_next_deadline ON rtm_timeline_progress(next_deadline);

-- Function to calculate RTM deadlines based on milestone completion
CREATE OR REPLACE FUNCTION calculate_rtm_deadline(
  milestone_type text,
  reference_date timestamptz,
  statutory_days integer DEFAULT NULL
) RETURNS timestamptz AS $$
BEGIN
  CASE milestone_type
    WHEN 'claim_notice_served' THEN
      -- Acquisition date: 3 months (90 days) after claim notice
      RETURN reference_date + INTERVAL '90 days';
    WHEN 'counter_notice_period' THEN
      -- Counter notice deadline: 1 month (30 days) after claim notice
      RETURN reference_date + INTERVAL '30 days';
    WHEN 'company_formation' THEN
      -- Company formation should be completed before claim notice
      RETURN reference_date + INTERVAL '14 days';
    ELSE
      -- Use statutory days if provided, otherwise default to 30 days
      RETURN reference_date + INTERVAL COALESCE(statutory_days, 30) || ' days';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update RTM timeline progress
CREATE OR REPLACE FUNCTION update_rtm_timeline_progress(building_uuid uuid)
RETURNS void AS $$
DECLARE
  total_count integer;
  completed_count integer;
  progress_pct decimal(5,2);
  current_milestone_rec record;
  next_deadline_date timestamptz;
  next_action text;
BEGIN
  -- Count total and completed milestones
  SELECT COUNT(*) INTO total_count
  FROM rtm_milestones
  WHERE building_id = building_uuid;

  SELECT COUNT(*) INTO completed_count
  FROM rtm_milestones
  WHERE building_id = building_uuid AND status = 'completed';

  -- Calculate progress percentage
  progress_pct := CASE
    WHEN total_count > 0 THEN (completed_count::decimal / total_count::decimal) * 100
    ELSE 0
  END;

  -- Find current milestone (first non-completed milestone in order)
  SELECT * INTO current_milestone_rec
  FROM rtm_milestones
  WHERE building_id = building_uuid
    AND status != 'completed'
  ORDER BY milestone_order ASC
  LIMIT 1;

  -- Determine next deadline and action
  IF current_milestone_rec.id IS NOT NULL THEN
    next_deadline_date := current_milestone_rec.calculated_deadline;
    next_action := 'Complete: ' || current_milestone_rec.milestone_title;
  ELSE
    next_deadline_date := NULL;
    next_action := 'RTM process completed';
  END IF;

  -- Update or insert progress record
  INSERT INTO rtm_timeline_progress (
    building_id,
    created_by,
    current_milestone_id,
    total_milestones,
    completed_milestones,
    progress_percentage,
    next_action_required,
    next_deadline,
    days_until_next_deadline
  )
  VALUES (
    building_uuid,
    auth.uid(),
    current_milestone_rec.id,
    total_count,
    completed_count,
    progress_pct,
    next_action,
    next_deadline_date,
    CASE
      WHEN next_deadline_date IS NOT NULL THEN
        EXTRACT(days FROM (next_deadline_date - now()))::integer
      ELSE NULL
    END
  )
  ON CONFLICT (building_id) DO UPDATE SET
    current_milestone_id = EXCLUDED.current_milestone_id,
    total_milestones = EXCLUDED.total_milestones,
    completed_milestones = EXCLUDED.completed_milestones,
    progress_percentage = EXCLUDED.progress_percentage,
    next_action_required = EXCLUDED.next_action_required,
    next_deadline = EXCLUDED.next_deadline,
    days_until_next_deadline = EXCLUDED.days_until_next_deadline,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RTM System Policies
CREATE POLICY "Users can access RTM data for their buildings" ON rtm_eligibility_assessments
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access leaseholder surveys for their buildings" ON leaseholder_surveys
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access leaseholder records for their buildings" ON leaseholder_records
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access RTM formations for their buildings" ON rtm_company_formations
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access RTM directors for their buildings" ON rtm_company_directors
  FOR ALL USING (
    company_formation_id IN (
      SELECT rcf.id FROM rtm_company_formations rcf
      JOIN building_users bu ON rcf.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access RTM notices for their buildings" ON rtm_notices
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- RTM Timeline System Policies
CREATE POLICY "Users can access RTM milestones for their buildings" ON rtm_milestones
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access RTM evidence for their buildings" ON rtm_evidence
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access RTM timeline progress for their buildings" ON rtm_timeline_progress
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- Document System Policies
CREATE POLICY "Users can access documents for their buildings" ON document_repository
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access document logs for their buildings" ON document_access_log
  FOR ALL USING (
    document_id IN (
      SELECT dr.id FROM document_repository dr
      JOIN building_users bu ON dr.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access document comments for their buildings" ON document_comments
  FOR ALL USING (
    document_id IN (
      SELECT dr.id FROM document_repository dr
      JOIN building_users bu ON dr.building_id = bu.building_id
      WHERE bu.user_id = auth.uid()
    )
  );

-- Financial System Policies
CREATE POLICY "Users can access service charge demands for their buildings" ON service_charge_demands
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access section20 consultations for their buildings" ON section20_consultations
  FOR ALL USING (
    building_id IN (
      SELECT building_id FROM building_users WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update triggers for RTM tables
CREATE TRIGGER rtm_eligibility_assessments_updated_at BEFORE UPDATE ON rtm_eligibility_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER leaseholder_surveys_updated_at BEFORE UPDATE ON leaseholder_surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER leaseholder_records_updated_at BEFORE UPDATE ON leaseholder_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER rtm_company_formations_updated_at BEFORE UPDATE ON rtm_company_formations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER rtm_notices_updated_at BEFORE UPDATE ON rtm_notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for document tables
CREATE TRIGGER document_repository_updated_at BEFORE UPDATE ON document_repository
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER document_comments_updated_at BEFORE UPDATE ON document_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for financial tables
CREATE TRIGGER service_charge_demands_updated_at BEFORE UPDATE ON service_charge_demands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER section20_consultations_updated_at BEFORE UPDATE ON section20_consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to log document access
CREATE OR REPLACE FUNCTION log_document_access(
  p_document_id uuid,
  p_access_type text,
  p_user_id uuid DEFAULT auth.uid(),
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO document_access_log (
    document_id,
    user_id,
    access_type,
    ip_address,
    user_agent
  ) VALUES (
    p_document_id,
    p_user_id,
    p_access_type,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get RTM formation progress
CREATE OR REPLACE FUNCTION get_rtm_formation_progress(p_building_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}';
  eligibility_done boolean := false;
  survey_done boolean := false;
  formation_done boolean := false;
  notices_done boolean := false;
BEGIN
  -- Check eligibility assessment
  SELECT EXISTS(
    SELECT 1 FROM rtm_eligibility_assessments
    WHERE building_id = p_building_id AND eligibility_result = 'eligible'
  ) INTO eligibility_done;

  -- Check leaseholder survey
  SELECT EXISTS(
    SELECT 1 FROM leaseholder_surveys
    WHERE building_id = p_building_id AND status = 'completed'
  ) INTO survey_done;

  -- Check company formation
  SELECT EXISTS(
    SELECT 1 FROM rtm_company_formations
    WHERE building_id = p_building_id AND formation_status IN ('submitted', 'approved')
  ) INTO formation_done;

  -- Check notices
  SELECT EXISTS(
    SELECT 1 FROM rtm_notices
    WHERE building_id = p_building_id AND notice_type = 'claim_notice' AND status = 'served'
  ) INTO notices_done;

  result := jsonb_build_object(
    'eligibility_assessment', eligibility_done,
    'leaseholder_survey', survey_done,
    'company_formation', formation_done,
    'notices_served', notices_done,
    'overall_progress', (
      CASE
        WHEN eligibility_done AND survey_done AND formation_done AND notices_done THEN 100
        WHEN eligibility_done AND survey_done AND formation_done THEN 75
        WHEN eligibility_done AND survey_done THEN 50
        WHEN eligibility_done THEN 25
        ELSE 0
      END
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate document storage usage
CREATE OR REPLACE FUNCTION get_document_storage_stats(p_building_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}';
  total_files integer := 0;
  total_size bigint := 0;
  category_breakdown jsonb := '{}';
BEGIN
  -- Get total counts and size
  SELECT COUNT(*), COALESCE(SUM(file_size), 0)
  INTO total_files, total_size
  FROM document_repository
  WHERE building_id = p_building_id AND is_archived = false;

  -- Get breakdown by category
  SELECT jsonb_object_agg(category, category_stats)
  INTO category_breakdown
  FROM (
    SELECT
      category,
      jsonb_build_object(
        'count', COUNT(*),
        'size', COALESCE(SUM(file_size), 0)
      ) as category_stats
    FROM document_repository
    WHERE building_id = p_building_id AND is_archived = false
    GROUP BY category
  ) cat_stats;

  result := jsonb_build_object(
    'total_files', total_files,
    'total_size_bytes', total_size,
    'total_size_mb', ROUND(total_size / 1024.0 / 1024.0, 2),
    'categories', COALESCE(category_breakdown, '{}')
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Complete data storage system migration completed!' as status;
