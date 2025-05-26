-- Temporarily disable the trigger
DROP TRIGGER IF EXISTS update_document_upload ON onboarding_documents;

-- Create document categories enum
DO $$ BEGIN
  CREATE TYPE document_category AS ENUM (
    'legal',
    'financial',
    'maintenance',
    'insurance',
    'minutes',
    'certificates'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add document metadata
CREATE TABLE IF NOT EXISTS document_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES onboarding_documents(id),
  category document_category,
  tags text[],
  description text,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for document metadata
CREATE POLICY "Users can view document metadata for their buildings"
ON document_metadata FOR SELECT
USING (EXISTS (
  SELECT 1 FROM onboarding_documents od
  JOIN building_users bu ON bu.building_id = od.building_id
  WHERE od.id = document_metadata.document_id
  AND bu.user_id = auth.uid()
));

-- Drop existing storage policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read documents from their buildings" ON storage.objects;
  DROP POLICY IF EXISTS "Directors can upload documents" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add storage policies for documents bucket
CREATE POLICY "Users can read documents from their buildings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM building_users bu
      JOIN onboarding_documents od ON od.building_id = bu.building_id
      WHERE od.storage_path = storage.objects.name
      AND bu.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Directors can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND (
    EXISTS (
      SELECT 1 FROM building_users bu
      JOIN onboarding_documents od ON od.building_id = bu.building_id
      WHERE od.storage_path = storage.objects.name
      AND bu.user_id = auth.uid()
      AND bu.role IN ('sof-director', 'rtm-director')
    )
  )
);

-- Add demo documents for SOF director
INSERT INTO onboarding_documents (building_id, document_type, storage_path, uploaded_by)
SELECT
  'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  document_type,
  storage_path,
  (SELECT id FROM auth.users WHERE email = 'sof@demo.com')
FROM (VALUES
  ('legal', 'legal/articles-of-association.pdf'),
  ('legal', 'legal/share-of-freehold-agreement.pdf'),
  ('financial', 'financial/service-charge-budget-2025.pdf'),
  ('financial', 'financial/annual-accounts-2024.pdf'),
  ('insurance', 'insurance/building-insurance-2025.pdf'),
  ('insurance', 'insurance/liability-insurance-2025.pdf'),
  ('maintenance', 'maintenance/maintenance-schedule-2025.pdf'),
  ('maintenance', 'maintenance/contractor-agreements.pdf'),
  ('minutes', 'minutes/agm-minutes-2024.pdf'),
  ('minutes', 'minutes/directors-meeting-march-2025.pdf'),
  ('certificates', 'certificates/fire-safety-certificate.pdf'),
  ('certificates', 'certificates/asbestos-survey.pdf')
) AS t(document_type, storage_path)
WHERE NOT EXISTS (
  SELECT 1 FROM onboarding_documents 
  WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
);

-- Add metadata for demo documents
INSERT INTO document_metadata (document_id, category, tags, description)
SELECT 
  od.id,
  CASE 
    WHEN od.document_type = 'legal' THEN 'legal'::document_category
    WHEN od.document_type = 'financial' THEN 'financial'::document_category
    WHEN od.document_type = 'insurance' THEN 'insurance'::document_category
    WHEN od.document_type = 'maintenance' THEN 'maintenance'::document_category
    WHEN od.document_type = 'minutes' THEN 'minutes'::document_category
    WHEN od.document_type = 'certificates' THEN 'certificates'::document_category
  END,
  ARRAY['important', 'verified'],
  'Demo document for ' || od.document_type || ' category'
FROM onboarding_documents od
WHERE building_id = 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f'
AND NOT EXISTS (
  SELECT 1 FROM document_metadata dm WHERE dm.document_id = od.id
);

-- Re-create the trigger
CREATE TRIGGER update_document_upload
  AFTER INSERT ON onboarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step();