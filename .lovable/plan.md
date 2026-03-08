

## Shepherd AI — Remaining Features Plan

### PRD Checklist vs Current State

| PRD Feature | Status |
|---|---|
| Chat with scripture guidance | Done |
| Prayer companion (emotional check-in) | Done |
| Prayer journal | Done |
| Spiritual memory + Life Verse Map | Done |
| Verse context viewer | Done |
| Guidance mode | Done (handled by chat) |
| Devotional generator | Done |
| Save verses / bookmarks | Done |
| Shareable prayer cards | Done |
| Crisis/safety banner | Done |
| Home page prompts → chat | Done |
| **RAG with Bible text corpus + embeddings** | **Missing** |
| **Cross-references dataset integration** | **Missing** |
| **Study notes layer** | **Missing** |
| **Daily check-in API endpoint** | **Missing** |
| **Notes on saved verses (edit UI)** | **Missing** |
| **Conversation history page/view** | **Missing** |
| **Mobile bottom nav for Dashboard** | **Missing** |
| **Profile settings page** | **Missing** |
| **Dark mode toggle** | **Missing** |

### What to Build

---

### 1. Bible Verse Database + Embedding Pipeline (RAG Foundation)

The PRD calls for a full RAG architecture with 31,000+ Bible verses stored with embeddings. Currently, the AI relies purely on its training knowledge with no retrieval step.

**Plan:**
- Create a `bible_verses` table: `id`, `book`, `chapter`, `verse_number`, `text`, `embedding` (vector)
- Create a `cross_references` table: `id`, `from_verse_id`, `to_verse_id`, `weight`
- Create a `study_notes` table: `id`, `verse_reference`, `note_text`
- Enable `pgvector` extension via migration
- Create a `match_verses` database function that performs cosine similarity search on embeddings
- Build an edge function `embed-bible` that can be called to batch-generate embeddings for all verses using the AI gateway
- Import a seed dataset of key verses (a practical subset of ~500 commonly referenced verses) since importing all 31,000+ verses from external GitHub repos requires an external ETL pipeline outside Lovable's scope

### 2. RAG-Enhanced Chat Edge Function

Update the `chat` edge function to:
- Convert the user message to an embedding via the AI gateway
- Call `match_verses` to retrieve top 5 relevant verses
- Look up cross-references for those verses
- Fetch any study notes
- Inject the retrieved context into the system prompt before calling the LLM
- This ensures responses are grounded in actual stored scripture, not just model knowledge

### 3. Daily Check-in Endpoint + Tracking

The PRD specifies a `/api/daily-checkin` endpoint for recording emotional states over time.

**Plan:**
- Create a `daily_checkins` table: `id`, `user_id`, `emotion`, `created_at`
- Add RLS policies (user can only read/write their own)
- Update PrayerPage to also insert into `daily_checkins` when an emotion is selected
- Add a check-in streak/history visualization to the Dashboard

### 4. Notes on Saved Verses (Edit UI)

Users can save verses but can't add/edit notes on them. Add an inline edit capability on the Dashboard's saved verses section — click to add a personal note.

### 5. Conversation History

The `conversations` table stores all chats but there's no UI to browse past conversations. Add a "Past Conversations" section to the Dashboard showing recent conversation summaries with the ability to view full exchanges.

### 6. Mobile Navigation Improvements

The mobile nav only shows Chat, Prayer, Devotional. Dashboard and Home are missing. Add a proper bottom tab bar on mobile with all 5 routes.

### 7. Profile Settings Page

Add a `/settings` page where users can:
- Update display name
- View their email
- Toggle dark/light mode (using `next-themes` already installed)

---

### Implementation Order

1. **Database migration** — `bible_verses`, `cross_references`, `study_notes`, `daily_checkins` tables + pgvector + `match_verses` function
2. **Seed Bible verses** — Edge function to generate embeddings for a starter set of ~500 key verses
3. **RAG-enhanced chat** — Update chat edge function with retrieval pipeline
4. **Daily check-in tracking** — Table + PrayerPage integration + Dashboard streak
5. **Saved verse notes UI** — Inline editing on Dashboard
6. **Conversation history UI** — New Dashboard section
7. **Mobile nav + Profile/Settings page** — Bottom tab bar + dark mode toggle

### Database Changes

```sql
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
  user_id uuid not null references auth.users(id) on delete cascade,
  emotion text not null,
  created_at timestamptz default now()
);

-- RLS on daily_checkins
alter table public.daily_checkins enable row level security;
create policy "Users manage own checkins" on public.daily_checkins
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public read on bible data (no auth needed)
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
```

### New/Modified Files

- `supabase/migrations/...` — Schema above
- `supabase/functions/embed-bible/index.ts` — Batch embedding generator for seeding verses
- `supabase/functions/chat/index.ts` — Add retrieval step before LLM call
- `src/pages/DashboardPage.tsx` — Add check-in streak, conversation history, verse note editing
- `src/pages/PrayerPage.tsx` — Record to `daily_checkins`
- `src/pages/SettingsPage.tsx` — New profile/settings page
- `src/components/Navbar.tsx` — Mobile bottom nav with all routes
- `src/App.tsx` — Add `/settings` route

