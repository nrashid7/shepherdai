

# Shepherd AI — Complete Project Documentation

This is a documentation plan. The deliverable will be a comprehensive `DOCUMENTATION.md` file added to the project root.

---

## What Will Be Documented

### 1. Project Overview
- App name: **Shepherd AI** — an AI-powered Bible companion
- Published URL: `https://shepherdai.lovable.app`
- Purpose: Scripture-based guidance, prayer generation, devotional creation, Bible exploration

### 2. Technology Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + custom CSS variables (gold/cream/navy theme) |
| UI Components | shadcn/ui (Radix primitives) |
| Routing | react-router-dom v6 |
| State/Data | @tanstack/react-query, React useState/useEffect |
| Animation | framer-motion |
| Markdown | react-markdown |
| Image Export | html-to-image |
| Backend | Supabase (Lovable Cloud) — Postgres DB, Auth, Edge Functions |
| AI Gateway | Lovable AI Gateway (`ai.gateway.lovable.dev`) using `google/gemini-3-flash-preview` and `google/gemini-2.5-flash` |
| Fonts | Playfair Display (display), Inter (body) |
| Testing | Vitest + jsdom (minimal — only a placeholder test exists) |

### 3. Project Structure — All Pages & Routes
| Route | Page Component | Auth Required | Description |
|-------|---------------|---------------|-------------|
| `/` | `Index.tsx` | No | Landing page with hero, features, suggested prompts |
| `/chat` | `ChatPage.tsx` | No | AI chat with streaming responses, crisis detection, verse saving, memory context |
| `/explore` | `ExplorePage.tsx` | No | 3-level Bible browser (Book→Chapter→Verse) with cross-refs, study notes, bookmarking, quick-jump |
| `/prayer` | `PrayerPage.tsx` | No | Emotion-based prayer generator with journal history and shareable cards |
| `/devotional` | `DevotionalPage.tsx` | No | Multi-day devotional generator (3/5/7 days) with save/load |
| `/verse` | `VersePage.tsx` | No | Deep-dive verse context page (surrounding passage, cross-refs, study note) via edge function |
| `/dashboard` | `DashboardPage.tsx` | **Yes** | Personal dashboard: saved verses, prayer journal, conversation history, life verse map, streak |
| `/settings` | `SettingsPage.tsx` | **Yes** | Profile editing (display name), dark/light mode toggle |
| `/auth` | `AuthPage.tsx` | No | Sign in / Sign up form (email + password) |
| `*` | `NotFound.tsx` | No | 404 page |

### 4. Database Schema (8 tables)
- **bible_verses** — Full Bible text with FTS index and vector embeddings (public read)
- **cross_references** — Verse-to-verse links with weight (public read)
- **study_notes** — Commentary per verse reference (public read)
- **conversations** — User chat history (user-scoped RLS)
- **saved_verses** — Bookmarked verses with optional notes/themes (full CRUD, user-scoped)
- **saved_devotionals** — Saved devotional plans as JSONB (ALL policy, user-scoped)
- **prayer_journal** — Prayer entries with emotion, verse, reflection (insert/select/delete, user-scoped)
- **daily_checkins** — Emotion check-ins for streak tracking (insert/select, user-scoped)
- **user_memories** — Spiritual theme tracking with frequency (full CRUD, user-scoped)
- **profiles** — Display name + avatar (insert/update/select, user-scoped, auto-created via trigger)

Database functions: `search_verses` (FTS), `match_verses` (vector similarity), `handle_new_user` (trigger), `update_updated_at_column`

### 5. Edge Functions (8 deployed)
| Function | Purpose | AI Model | JWT |
|----------|---------|----------|-----|
| `chat` | Streaming Bible chat with RAG (FTS + cross-refs + study notes + user memories) | gemini-3-flash-preview | No |
| `prayer` | Emotion→prayer generation (structured JSON via tool calling) | gemini-3-flash-preview | No |
| `devotional` | Multi-day devotional generation (structured JSON via tool calling) | gemini-3-flash-preview | No |
| `verse-context` | Deep verse context with cross-refs, explanation, study note | gemini-2.5-flash | No |
| `embed-bible` | Generate vector embeddings for bible_verses | — | No |
| `seed-bible` | Seed bible_verses table with full Bible text | — | No |
| `seed-cross-refs` | Seed cross_references table | — | No |
| `seed-study-notes` | Seed study_notes from static data | — | No |
| `seed-study-notes-ai` | Generate study notes via AI | — | No |

**Note:** All edge functions have `verify_jwt = false` — they rely on the anon key passed via Authorization header.

### 6. Key Architectural Patterns
- **Streaming chat**: SSE-based streaming from edge function → client parser in `src/lib/ai.ts`
- **RAG pipeline**: Chat function searches `bible_verses` via FTS, fetches matching `cross_references` and `study_notes`, injects as system prompt context
- **Spiritual memory**: `src/lib/memories.ts` extracts themes (keyword matching) and verse references (regex) from conversations, upserts to `user_memories` table
- **Crisis detection**: `src/components/CrisisBanner.tsx` scans for crisis keywords, shows helpline banner
- **Auth flow**: Supabase email/password auth, `AuthContext` provider, `AuthGuard` wrapper for protected routes
- **Theme system**: CSS variables with light/dark mode, toggled via `document.documentElement.classList` + localStorage
- **Responsive nav**: Top navbar on desktop, bottom tab bar on mobile
- **Shareable cards**: `PrayerCard.tsx` uses `html-to-image` to render downloadable PNG cards

### 7. Environment Variables & Secrets
| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | .env (auto) | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | .env (auto) | Supabase anon key |
| `LOVABLE_API_KEY` | Edge function secret | AI gateway authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge function secret | Server-side DB access (used in chat RAG) |

### 8. What Works
- Full Bible browsing with 66 books, all chapters/verses from `bible_verses` table
- AI chat with streaming, RAG context, memory personalization
- Prayer generation with emotion selection, journal, shareable cards
- Devotional generation (3/5/7 days) with save/load
- Verse deep-dive page with AI-generated context
- Cross-reference and study note display in Explore page (desktop side panel + mobile inline accordion)
- Quick-jump navigation (e.g., "John 3:16")
- Verse bookmarking with toggle from Explore page
- Dashboard with saved verses, prayer journal, conversation history, life verse map, daily streak
- Dark/light mode
- Email/password authentication with email confirmation
- Crisis detection banner

### 9. Known Limitations & Issues
- **No real tests**: Only a placeholder test exists (`example.test.ts` with `expect(true).toBe(true)`)
- **JWT verification disabled**: All edge functions have `verify_jwt = false` — anyone with the anon key can call them
- **No rate limiting on client**: Chat/prayer/devotional requests have no client-side throttling
- **`daily_checkins` typed as `any`**: The table is accessed with `as any` casts, suggesting it may not be in the generated types
- **Verse text may be empty when saving from chat**: `handleSaveVerse` in ChatPage passes empty string for `verse_text`
- **Study notes coverage**: AI study notes were generated for books 0-24 (Genesis through Lamentations); books 25-65 (Ezekiel through Revelation) may have incomplete coverage
- **No password reset flow**: Auth page has sign in/sign up but no forgot password
- **No email confirmation redirect handling**: After signup, user is told to check email but there's no confirmation callback page
- **Theme persistence**: Dark mode is stored in localStorage and toggled via class, not integrated with `next-themes` (which is installed but unused)
- **No pagination**: Saved verses, conversations, and prayer journal queries use `.limit()` but no pagination UI
- **Cross-reference navigation in Explore**: Clicking a cross-ref navigates within Explore but doesn't scroll to the target verse

### 10. File-by-File Reference
Complete listing of all source files with their purpose, grouped by directory.

---

## Files Changed
| File | Change |
|------|--------|
| `DOCUMENTATION.md` | New file — comprehensive project documentation |

