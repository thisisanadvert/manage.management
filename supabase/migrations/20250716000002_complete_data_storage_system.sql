-- RTM Eligibility Assessments
CREATE TABLE IF NOT EXISTS rtm_eligibility_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  assessment_data jsonb NOT NULL,
  eligibility_result text NOT NULL CHECK (eligibility_result IN ('eligible', 'not_eligible', 'needs_review')),
  eligibility_score decimal(3,2),
  issues_identified text[],
  recommendations text[],
  assessment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);