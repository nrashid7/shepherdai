CREATE OR REPLACE FUNCTION public.search_verses(query text, match_count integer DEFAULT 5)
RETURNS TABLE(id uuid, book text, chapter integer, verse_number integer, text text, rank real)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Try websearch first, fall back to plainto if no results
  RETURN QUERY
  SELECT bv.id, bv.book, bv.chapter, bv.verse_number, bv.text,
    ts_rank(bv.fts, websearch_to_tsquery('english', query)) as rank
  FROM bible_verses bv
  WHERE bv.fts @@ websearch_to_tsquery('english', query)
  ORDER BY rank DESC
  LIMIT match_count;
  
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT bv.id, bv.book, bv.chapter, bv.verse_number, bv.text,
      ts_rank(bv.fts, plainto_tsquery('english', query)) as rank
    FROM bible_verses bv
    WHERE bv.fts @@ plainto_tsquery('english', query)
    ORDER BY rank DESC
    LIMIT match_count;
  END IF;
END;
$$;