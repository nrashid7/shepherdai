

## PRD Gap Analysis & Optimization Opportunities

### What's Fully Built
- Chat with streaming + RAG pipeline
- Prayer companion with emotional check-in + journal
- Devotional generator (3/5/7 day)
- Verse context viewer with cross-references
- Save verses with notes
- Spiritual memory + Life Verse Map
- Shareable prayer cards (download + share)
- Crisis/safety banner
- Home page prompt pass-through
- Conversation history on Dashboard
- Daily check-in streak tracking
- Settings page with dark mode + profile
- Mobile bottom nav
- Bible verses table with embeddings + match_verses function
- embed-bible seed function (~140 verses)

### Remaining PRD Gaps

**1. Cross-references data is empty**
The `cross_references` table exists but has no seed data. The chat RAG function queries it, but it returns nothing. Need to seed ~200-300 key cross-reference pairs from the PRD-referenced dataset patterns.

**2. Study notes data is empty**
Same issue — `study_notes` table exists but is never populated. Should seed contextual notes for the most important verses in the seed set.

**3. Chat doesn't pass user auth context for memory-enhanced prompts**
The chat edge function has no access to user memories. The PRD calls for the AI to reference past themes. Should optionally pass recent user memories to the system prompt.

**4. Devotional saving/persistence**
Generated devotionals are not saved anywhere. Users lose them on page reload. Should persist to a `devotionals` table or at minimum allow bookmarking individual devotional days.

**5. Protected routes**
Dashboard and Settings are accessible without auth but show empty states. Should redirect unauthenticated users to /auth for those routes.

**6. Loading/skeleton states**
Dashboard loads all data in parallel but shows nothing while loading — no skeleton or spinner.

### Optimizations

**7. Chat conversation sessions**
Currently each message is saved individually to `conversations`. There's no session concept — users can't continue a past conversation. Add a `session_id` to group messages.

**8. Embed-bible hasn't been triggered**
The seed function exists but the `bible_verses` table is likely empty. Need to actually call the function to populate data so RAG works.

**9. Error boundaries**
No React error boundary — a crash in any component takes down the whole app.

**10. SEO / meta tags**
No page-level meta tags or Open Graph tags for social sharing of the published app.

---

### Implementation Plan

#### Phase 1 — Data Seeding & RAG Completion
- Seed cross-references (~300 pairs) and study notes (~100 entries) via a DB migration with INSERT statements
- Trigger the embed-bible function to populate bible_verses with embeddings
- Pass user's top 3 memories into chat system prompt for personalized responses

#### Phase 2 — Devotional Persistence + Auth Guards
- Create `saved_devotionals` table (user_id, topic, days_json, created_at)
- Add "Save Devotional" button on DevotionalPage
- Add route guards: redirect to /auth for /dashboard, /settings when not logged in

#### Phase 3 — UX Polish
- Add loading skeletons to DashboardPage
- Add React ErrorBoundary component wrapping routes
- Add page-level document titles via useEffect

#### Database Changes
```sql
-- saved_devotionals table
create table public.saved_devotionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  days_count int not null,
  devotional_json jsonb not null,
  created_at timestamptz default now()
);
alter table public.saved_devotionals enable row level security;
create policy "Users manage own devotionals" on public.saved_devotionals
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed cross-references (sample)
INSERT INTO cross_references (from_verse, to_verse, weight) VALUES
('Isaiah 41:10', 'Deuteronomy 31:6', 5),
('Isaiah 41:10', 'Joshua 1:9', 5),
('Philippians 4:6', 'Philippians 4:7', 10),
('Philippians 4:6', '1 Peter 5:7', 7),
-- ... ~300 total pairs

-- Seed study notes (sample)
INSERT INTO study_notes (verse_reference, note_text) VALUES
('Isaiah 41:10', 'Written during Babylonian exile...'),
-- ... ~100 entries
```

#### Modified Files
- `supabase/functions/chat/index.ts` — accept optional `user_memories` in request body, append to system prompt
- `src/pages/ChatPage.tsx` — pass user memories when calling chat
- `src/pages/DevotionalPage.tsx` — add save button + load saved devotionals
- `src/pages/DashboardPage.tsx` — loading skeletons, saved devotionals section
- `src/App.tsx` — add ErrorBoundary, auth-guarded routes
- New: `src/components/ErrorBoundary.tsx`
- New: `src/components/AuthGuard.tsx`
- New migration for cross-references seed, study notes seed, saved_devotionals table

