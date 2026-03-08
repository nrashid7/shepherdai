
-- Enable pgvector
create extension if not exists vector with schema extensions;

-- Bible verses with embeddings
create table public.bible_verses (
  id uuid primary key default gen_random_uuid(),
  book text not null,
  chapter int not null,
  verse_number int not null,
  text text not null,
  embedding vector(768)
);

-- Cross references
create table public.cross_references (
  id uuid primary key default gen_random_uuid(),
  from_verse text not null,
  to_verse text not null,
  weight int default 1
);

-- Study notes
create table public.study_notes (
  id uuid primary key default gen_random_uuid(),
  verse_reference text not null,
  note_text text not null
);

-- Daily check-ins
create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  emotion text not null,
  created_at timestamptz default now()
);

-- RLS on daily_checkins
alter table public.daily_checkins enable row level security;
create policy "Users can select own checkins" on public.daily_checkins
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.daily_checkins
  for insert to authenticated with check (auth.uid() = user_id);

-- Public read on bible data
alter table public.bible_verses enable row level security;
create policy "Public read bible" on public.bible_verses for select to anon, authenticated using (true);

alter table public.cross_references enable row level security;
create policy "Public read xrefs" on public.cross_references for select to anon, authenticated using (true);

alter table public.study_notes enable row level security;
create policy "Public read notes" on public.study_notes for select to anon, authenticated using (true);

-- Vector similarity search function
create or replace function match_verses(query_embedding vector(768), match_count int default 5)
returns table(id uuid, book text, chapter int, verse_number int, text text, similarity float)
language plpgsql as $$
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
