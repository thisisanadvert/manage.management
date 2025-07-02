/*
  # Add Full-Text Search Indexes for Global Search

  1. Full-Text Search Indexes
    - Add GIN indexes for full-text search on key tables
    - Optimize search performance across content types
    - Support for English language search with stemming

  2. Performance Optimizations
    - Add composite indexes for common filter combinations
    - Optimize date range queries
    - Add indexes for building-scoped searches

  3. Search Functions
    - Create helper functions for search ranking
    - Add search result highlighting support
*/

-- Enable the pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Issues table full-text search
CREATE INDEX IF NOT EXISTS idx_issues_fts 
ON issues 
USING GIN (to_tsvector('english', title || ' ' || description));

-- Add trigram index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_issues_trigram 
ON issues 
USING GIN (title gin_trgm_ops, description gin_trgm_ops);

-- Composite index for filtered searches
CREATE INDEX IF NOT EXISTS idx_issues_building_status_priority 
ON issues (building_id, status, priority, created_at DESC);

-- Announcements table full-text search
CREATE INDEX IF NOT EXISTS idx_announcements_fts 
ON announcements 
USING GIN (to_tsvector('english', title || ' ' || content));

-- Add trigram index for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_trigram 
ON announcements 
USING GIN (title gin_trgm_ops, content gin_trgm_ops);

-- Composite index for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_building_category 
ON announcements (building_id, category, priority, created_at DESC);

-- Documents table search optimization
CREATE INDEX IF NOT EXISTS idx_documents_filename 
ON onboarding_documents 
USING GIN (to_tsvector('english', storage_path));

-- Add trigram index for document paths
CREATE INDEX IF NOT EXISTS idx_documents_trigram 
ON onboarding_documents 
USING GIN (storage_path gin_trgm_ops);

-- Composite index for documents
CREATE INDEX IF NOT EXISTS idx_documents_building_type 
ON onboarding_documents (building_id, document_type, created_at DESC);

-- Transactions table search
CREATE INDEX IF NOT EXISTS idx_transactions_fts 
ON transactions 
USING GIN (to_tsvector('english', description || ' ' || category));

-- Composite index for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_building_category_date 
ON transactions (building_id, category, transaction_date DESC);

-- Polls table search
CREATE INDEX IF NOT EXISTS idx_polls_fts 
ON polls 
USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Composite index for polls
CREATE INDEX IF NOT EXISTS idx_polls_building_status 
ON polls (building_id, status, created_at DESC);

-- Building users search optimization
CREATE INDEX IF NOT EXISTS idx_building_users_role_building 
ON building_users (building_id, role, created_at DESC);

-- Suppliers search (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'suppliers') THEN
    -- Full-text search for suppliers
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_suppliers_fts 
             ON suppliers 
             USING GIN (to_tsvector(''english'', name || '' '' || COALESCE(description, '''')))';
    
    -- Trigram index for suppliers
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_suppliers_trigram 
             ON suppliers 
             USING GIN (name gin_trgm_ops, description gin_trgm_ops)';
    
    -- Category index for suppliers
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_suppliers_category 
             ON suppliers (category, verified, created_at DESC)';
  END IF;
END $$;

-- Create search ranking function
CREATE OR REPLACE FUNCTION search_rank(
  search_vector tsvector,
  query tsquery,
  title_weight float DEFAULT 1.0,
  content_weight float DEFAULT 0.5
) RETURNS float AS $$
BEGIN
  RETURN ts_rank_cd(search_vector, query) * 
         CASE 
           WHEN search_vector @@ query THEN title_weight
           ELSE content_weight
         END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create search highlighting function
CREATE OR REPLACE FUNCTION search_highlight(
  content text,
  query tsquery,
  max_words integer DEFAULT 35,
  min_words integer DEFAULT 15
) RETURNS text AS $$
BEGIN
  RETURN ts_headline(
    'english',
    content,
    query,
    'MaxWords=' || max_words || ', MinWords=' || min_words || ', ShortWord=3, HighlightAll=false'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
  search_term text,
  building_id_param uuid DEFAULT NULL,
  suggestion_limit integer DEFAULT 5
) RETURNS TABLE(suggestion text, frequency bigint) AS $$
BEGIN
  RETURN QUERY
  WITH search_terms AS (
    -- Get terms from issues
    SELECT unnest(string_to_array(lower(title || ' ' || description), ' ')) as term
    FROM issues 
    WHERE (building_id_param IS NULL OR building_id = building_id_param)
    
    UNION ALL
    
    -- Get terms from announcements
    SELECT unnest(string_to_array(lower(title || ' ' || content), ' ')) as term
    FROM announcements 
    WHERE (building_id_param IS NULL OR building_id = building_id_param)
  ),
  filtered_terms AS (
    SELECT term
    FROM search_terms
    WHERE length(term) > 2 
      AND term SIMILAR TO '%[a-z]%'
      AND term ILIKE '%' || search_term || '%'
  )
  SELECT 
    filtered_terms.term as suggestion,
    count(*) as frequency
  FROM filtered_terms
  GROUP BY filtered_terms.term
  ORDER BY frequency DESC, suggestion
  LIMIT suggestion_limit;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for search analytics (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS search_analytics AS
SELECT 
  'issues' as content_type,
  building_id,
  count(*) as total_items,
  avg(length(title || ' ' || description)) as avg_content_length,
  max(created_at) as last_updated
FROM issues
GROUP BY building_id

UNION ALL

SELECT 
  'announcements' as content_type,
  building_id,
  count(*) as total_items,
  avg(length(title || ' ' || content)) as avg_content_length,
  max(created_at) as last_updated
FROM announcements
GROUP BY building_id

UNION ALL

SELECT 
  'documents' as content_type,
  building_id,
  count(*) as total_items,
  avg(length(storage_path)) as avg_content_length,
  max(created_at) as last_updated
FROM onboarding_documents
GROUP BY building_id;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_search_analytics_building_type 
ON search_analytics (building_id, content_type);

-- Add comments for documentation
COMMENT ON INDEX idx_issues_fts IS 'Full-text search index for issues title and description';
COMMENT ON INDEX idx_announcements_fts IS 'Full-text search index for announcements title and content';
COMMENT ON INDEX idx_documents_filename IS 'Full-text search index for document file paths';
COMMENT ON INDEX idx_transactions_fts IS 'Full-text search index for transaction descriptions';
COMMENT ON INDEX idx_polls_fts IS 'Full-text search index for polls title and description';

COMMENT ON FUNCTION search_rank IS 'Calculate search relevance ranking with weighted scoring';
COMMENT ON FUNCTION search_highlight IS 'Generate highlighted search result snippets';
COMMENT ON FUNCTION get_search_suggestions IS 'Get search term suggestions based on existing content';

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW search_analytics;
