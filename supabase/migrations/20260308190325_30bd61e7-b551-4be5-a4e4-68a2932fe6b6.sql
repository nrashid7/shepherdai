
-- Fix search path on match_verses function
create or replace function match_verses(query_embedding vector(768), match_count int default 5)
returns table(id uuid, book text, chapter int, verse_number int, text text, similarity float)
language plpgsql
security invoker
set search_path = public
as $$
begin
  return query
  select bv.id, bv.book, bv.chapter, bv.verse_number, bv.text,
    1 - (bv.embedding <=> query_embedding) as similarity
  from bible_verses bv
  where bv.embedding is not null
  order by bv.embedding <=> query_embedding
  limit match_count;
end;
$$;
