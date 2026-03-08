-- Add a tsvector column for full-text search
ALTER TABLE public.bible_verses ADD COLUMN IF NOT EXISTS fts tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', book || ' ' || text)) STORED;

-- Create a GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS bible_verses_fts_idx ON public.bible_verses USING gin(fts);

-- Create a full-text search function
CREATE OR REPLACE FUNCTION public.search_verses(query text, match_count integer DEFAULT 5)
RETURNS TABLE(id uuid, book text, chapter integer, verse_number integer, text text, rank real)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT bv.id, bv.book, bv.chapter, bv.verse_number, bv.text,
    ts_rank(bv.fts, websearch_to_tsquery('english', query)) as rank
  FROM bible_verses bv
  WHERE bv.fts @@ websearch_to_tsquery('english', query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;