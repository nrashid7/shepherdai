# Shepherd AI — Complete Project Documentation

> **Last updated:** March 2026  
> **Published URL:** https://shepherdai.lovable.app  
> **Built on:** Lovable (React + Vite + Supabase via Lovable Cloud)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Pages & Routes](#4-pages--routes)
5. [Database Schema](#5-database-schema)
6. [Row-Level Security (RLS) Policies](#6-row-level-security-rls-policies)
7. [Edge Functions](#7-edge-functions)
8. [AI Integration](#8-ai-integration)
9. [Key Architectural Patterns](#9-key-architectural-patterns)
10. [Design System](#10-design-system)
11. [Authentication Flow](#11-authentication-flow)
12. [Environment Variables & Secrets](#12-environment-variables--secrets)
13. [File-by-File Reference](#13-file-by-file-reference)
14. [What Works (Feature Status)](#14-what-works-feature-status)
15. [Known Limitations & Issues](#15-known-limitations--issues)
16. [Testing](#16-testing)
17. [Deployment](#17-deployment)
18. [Local Development](#18-local-development)

---

## 1. Project Overview

**Shepherd AI** is an AI-powered Bible companion web application. Users can:

- **Chat** with an AI assistant that provides scripture-based guidance with streaming responses
- **Explore** all 66 books of the Bible with cross-references and study notes
- **Generate prayers** based on emotional state, with shareable image cards
- **Create multi-day devotionals** (3, 5, or 7 days) on any topic
- **Deep-dive** into individual verses with AI-generated context, surrounding passages, and cross-references
- **Track their spiritual journey** via a personal dashboard with saved verses, prayer journal, conversation history, life verse map, and daily streaks

The app detects crisis signals (e.g., self-harm keywords) and displays helpline resources.

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React + TypeScript | 18.3.x |
| **Build Tool** | Vite | 5.4.x |
| **Styling** | Tailwind CSS + custom CSS variables | 3.4.x |
| **UI Components** | shadcn/ui (Radix primitives) | Various |
| **Routing** | react-router-dom | 6.30.x |
| **Server State** | @tanstack/react-query | 5.83.x |
| **Animation** | framer-motion | 12.35.x |
| **Markdown Rendering** | react-markdown | 10.1.x |
| **Image Export** | html-to-image | 1.11.x |
| **Backend** | Supabase (via Lovable Cloud) | — |
| **AI Gateway** | Lovable AI Gateway | — |
| **Fonts** | Playfair Display (display), Inter (body) | Google Fonts |
| **Testing** | Vitest + jsdom | 3.2.x |
| **Date Formatting** | date-fns | 3.6.x |

### Key Dependencies Not in Active Use

- `next-themes` — installed but unused; dark mode is manually toggled via `document.documentElement.classList`
- `recharts` — installed but not currently used in any component
- `react-resizable-panels` — installed but not used

---

## 3. Project Structure

```
shepherd-ai/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── hero-bg.jpg              # Landing page hero background
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (60+ files)
│   │   ├── AuthGuard.tsx             # Route protection wrapper
│   │   ├── CrisisBanner.tsx          # Crisis detection + helpline banner
│   │   ├── ErrorBoundary.tsx         # React error boundary (class component)
│   │   ├── Navbar.tsx                # Top navbar (desktop) + bottom tab bar (mobile)
│   │   ├── NavLink.tsx               # Navigation link component
│   │   └── PrayerCard.tsx            # Shareable prayer image card modal
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication provider (Supabase Auth)
│   ├── hooks/
│   │   ├── use-mobile.tsx            # Mobile viewport detection
│   │   └── use-toast.ts              # Toast notification hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts             # Auto-generated Supabase client (DO NOT EDIT)
│   │       └── types.ts              # Auto-generated DB types (DO NOT EDIT)
│   ├── lib/
│   │   ├── ai.ts                     # Client-side AI functions (streamChat, generatePrayer, generateDevotional)
│   │   ├── memories.ts              # Spiritual memory extraction (themes + verse refs)
│   │   └── utils.ts                  # Utility functions (cn)
│   ├── pages/
│   │   ├── AuthPage.tsx              # Sign in / Sign up
│   │   ├── ChatPage.tsx              # AI chat with streaming
│   │   ├── DashboardPage.tsx         # Personal spiritual dashboard
│   │   ├── DevotionalPage.tsx        # Multi-day devotional generator
│   │   ├── ExplorePage.tsx           # Bible browser (Book → Chapter → Verse)
│   │   ├── Index.tsx                 # Landing page
│   │   ├── NotFound.tsx              # 404 page
│   │   ├── PrayerPage.tsx            # Emotion-based prayer generator
│   │   ├── SettingsPage.tsx          # Profile & theme settings
│   │   └── VersePage.tsx             # Deep-dive verse context page
│   ├── test/
│   │   ├── example.test.ts           # Placeholder test
│   │   └── setup.ts                  # Vitest setup
│   ├── App.css                       # Minimal global styles
│   ├── App.tsx                       # Root component with routes
│   ├── index.css                     # Design system tokens (CSS variables)
│   ├── main.tsx                      # Entry point
│   └── vite-env.d.ts                 # Vite type declarations
├── supabase/
│   ├── config.toml                   # Edge function configuration (DO NOT EDIT)
│   ├── functions/
│   │   ├── chat/index.ts             # Streaming Bible chat with RAG
│   │   ├── prayer/index.ts           # Prayer generation (tool calling)
│   │   ├── devotional/index.ts       # Devotional generation (tool calling)
│   │   ├── verse-context/index.ts    # Verse deep-dive context
│   │   ├── embed-bible/index.ts      # Vector embedding generation
│   │   ├── seed-bible/index.ts       # Bible text seeder
│   │   ├── seed-cross-refs/index.ts  # Cross-reference seeder
│   │   ├── seed-study-notes/index.ts         # Static study notes seeder
│   │   └── seed-study-notes-ai/index.ts      # AI-generated study notes
│   └── migrations/                   # Database migrations (DO NOT EDIT)
├── .env                              # Auto-generated env vars (DO NOT EDIT)
├── components.json                   # shadcn/ui configuration
├── index.html                        # HTML entry point
├── tailwind.config.ts                # Tailwind configuration with custom tokens
├── tsconfig.json                     # TypeScript config
├── vite.config.ts                    # Vite config
└── vitest.config.ts                  # Vitest config
```

---

## 4. Pages & Routes

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/` | `Index.tsx` | No | Landing page: hero section with background image, features grid, suggested prompts, Psalm 119:105 quote, footer |
| `/chat` | `ChatPage.tsx` | No | AI chat with SSE streaming, crisis detection banner, verse saving (bookmark icon), spiritual memory hint, quick prompts. Supports `?prompt=` query param for auto-send |
| `/explore` | `ExplorePage.tsx` | No | 3-level Bible browser: 66 books → chapters → verses. Quick-jump input (e.g., "John 3:16"). Desktop: side panel for study notes + cross-refs. Mobile: inline accordion below selected verse. Verse bookmarking with toggle |
| `/prayer` | `PrayerPage.tsx` | No | 6 emotion buttons (Anxious, Grateful, Sad, Hopeful, Angry, Seeking Guidance). Generates verse + prayer + reflection + cross-reference. Prayer journal (expandable). Shareable card modal |
| `/devotional` | `DevotionalPage.tsx` | No | Topic input + day selector (3/5/7). Generates multi-day devotional with accordion UI. Suggested topics. Save/load devotionals (authenticated) |
| `/verse` | `VersePage.tsx` | No | Deep-dive context for a single verse. Accepts `?ref=` query param. Shows: verse text, book context, surrounding passage, explanation, cross-references (linked to other verse pages), study note |
| `/dashboard` | `DashboardPage.tsx` | **Yes** | Personal dashboard: daily streak, life verse map (theme→verse frequency), recent prayers, conversation history (expandable), saved verses (with inline note editing, share, delete, image card generation) |
| `/settings` | `SettingsPage.tsx` | **Yes** | Profile section (email display, display name edit). Appearance section (dark/light mode toggle) |
| `/auth` | `AuthPage.tsx` | No | Dual-mode form: sign in (email + password) or sign up (email + password + display name). Animated with framer-motion |
| `*` | `NotFound.tsx` | No | 404 page with branded styling and "Return Home" button |

### Route Protection

Protected routes use the `AuthGuard` component wrapper:
```tsx
<Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
```

`AuthGuard` shows a loading spinner while checking auth state, then redirects to `/auth` if no user is found.

---

## 5. Database Schema

### Tables

#### `bible_verses`
Full Bible text with full-text search and vector embeddings.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `book` | text | e.g., "Genesis", "1 Corinthians" |
| `chapter` | integer | Chapter number |
| `verse_number` | integer | Verse number within chapter |
| `text` | text | Full verse text |
| `fts` | tsvector | Auto-generated full-text search index |
| `embedding` | vector (nullable) | Vector embedding for semantic search |

#### `cross_references`
Verse-to-verse cross-reference links.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `from_verse` | text | e.g., "Romans 8:28" |
| `to_verse` | text | e.g., "Jeremiah 29:11" |
| `weight` | integer (nullable) | 1=weak, 2=medium, 3=strong |

#### `study_notes`
Commentary per verse reference.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `verse_reference` | text | e.g., "Genesis 1:1" |
| `note_text` | text | Study note content |

#### `conversations`
User chat history.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | References auth.users |
| `message` | text | User's message |
| `response` | text | AI's response |
| `themes` | text[] (nullable) | Extracted themes (e.g., ["anxiety", "hope"]) |
| `created_at` | timestamptz | Auto-generated |

#### `saved_verses`
User's bookmarked verses.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | References auth.users |
| `verse_reference` | text | e.g., "John 3:16" |
| `verse_text` | text | Full text of the verse |
| `note` | text (nullable) | User's personal note |
| `theme` | text (nullable) | User-assigned theme |
| `created_at` | timestamptz | Auto-generated |

#### `saved_devotionals`
Saved devotional plans.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | References auth.users |
| `topic` | text | Devotional topic |
| `days_count` | integer | Number of days |
| `devotional_json` | jsonb | Full devotional content as JSON array |
| `created_at` | timestamptz (nullable) | Auto-generated |

#### `prayer_journal`
Prayer entries with emotion and reflection.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | References auth.users |
| `emotion` | text | Selected emotion (e.g., "Anxious") |
| `verse_reference` | text | Associated verse |
| `prayer_text` | text | Generated prayer |
| `reflection` | text (nullable) | Reflection question |
| `created_at` | timestamptz | Auto-generated |

#### `daily_checkins`
Emotion check-ins for streak tracking.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | References auth.users |
| `emotion` | text | Selected emotion |
| `created_at` | timestamptz (nullable) | Auto-generated |

**Note:** This table is accessed with `as any` casts in the codebase because it may not be properly represented in the auto-generated types.

#### `user_memories`
Spiritual theme tracking across conversations.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | References auth.users |
| `theme` | text | e.g., "anxiety", "hope" |
| `verse_reference` | text | Associated verse |
| `frequency` | integer | How many times referenced (default: 1) |
| `note` | text (nullable) | Optional note |
| `created_at` | timestamptz | Auto-generated |
| `updated_at` | timestamptz | Auto-updated via trigger |

#### `profiles`
User profile information.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | References auth.users |
| `display_name` | text (nullable) | User's display name |
| `avatar_url` | text (nullable) | Avatar URL (unused in UI) |
| `created_at` | timestamptz | Auto-generated |
| `updated_at` | timestamptz | Auto-updated |

### Database Functions

| Function | Purpose | Type |
|----------|---------|------|
| `search_verses(query text, match_count int)` | Full-text search on `bible_verses.fts` column | Returns table (book, chapter, verse_number, text, id, rank) |
| `match_verses(query_embedding vector, match_count int)` | Vector similarity search on `bible_verses.embedding` | Returns table (book, chapter, verse_number, text, id, similarity) |
| `handle_new_user()` | Trigger function — auto-creates a `profiles` row when a new user signs up | Trigger on `auth.users` INSERT |
| `update_updated_at_column()` | Trigger function — sets `updated_at` to `now()` on row update | Trigger on `user_memories` |

---

## 6. Row-Level Security (RLS) Policies

All user-scoped tables have RLS enabled. Here's the policy summary:

| Table | Policy | Operations | Rule |
|-------|--------|------------|------|
| `bible_verses` | Public read | SELECT | Open to all (anon + authenticated) |
| `cross_references` | Public read | SELECT | Open to all |
| `study_notes` | Public read | SELECT | Open to all |
| `conversations` | User-scoped | SELECT, INSERT | `user_id = auth.uid()` |
| `saved_verses` | User-scoped | ALL (CRUD) | `user_id = auth.uid()` |
| `saved_devotionals` | User-scoped | ALL | `user_id = auth.uid()` |
| `prayer_journal` | User-scoped | SELECT, INSERT, DELETE | `user_id = auth.uid()` |
| `daily_checkins` | User-scoped | SELECT, INSERT | `user_id = auth.uid()` |
| `user_memories` | User-scoped | ALL (CRUD) | `user_id = auth.uid()` |
| `profiles` | User-scoped | SELECT, INSERT, UPDATE | `user_id = auth.uid()` |

---

## 7. Edge Functions

All edge functions are deployed to Supabase and run as Deno serverless functions. **All have `verify_jwt = false`** in `supabase/config.toml`.

### `chat` (Main AI Chat)

**File:** `supabase/functions/chat/index.ts`  
**Method:** POST  
**Input:** `{ messages: {role, content}[], user_memories?: Memory[] }`  
**Output:** SSE stream (Server-Sent Events)  
**Model:** `google/gemini-3-flash-preview`

**Architecture (RAG Pipeline):**
1. Extracts the last user message
2. Searches `bible_verses` via `search_verses` RPC (full-text search, top 5 results)
3. Fetches `cross_references` for matched verses
4. Fetches `study_notes` for matched verses
5. Builds a context block and appends it to the system prompt
6. Also appends user spiritual memories (if provided) for personalization
7. Streams the response back via SSE

**System Prompt Structure:**
- Must only use real Bible verses
- Every response follows: Acknowledgement → Scripture Passages → Explanation → Cross-References → Reflection Question → Prayer
- Crisis detection instructions included

### `prayer` (Prayer Generation)

**File:** `supabase/functions/prayer/index.ts`  
**Method:** POST  
**Input:** `{ emotion: string }`  
**Output:** JSON `{ verse_reference, verse_text, prayer, reflection, cross_reference? }`  
**Model:** `google/gemini-3-flash-preview`  
**Technique:** Function/tool calling (`generate_prayer` tool) for structured output

### `devotional` (Devotional Generation)

**File:** `supabase/functions/devotional/index.ts`  
**Method:** POST  
**Input:** `{ topic: string, days?: number }`  
**Output:** JSON `{ devotional: DevotionalDay[] }`  
**Model:** `google/gemini-3-flash-preview`  
**Technique:** Function/tool calling (`create_devotional` tool) for structured output

Each `DevotionalDay`:
```typescript
{
  day: number;
  title: string;
  verse_reference: string;
  verse_text: string;
  explanation: string;
  reflection: string;
  prayer: string;
}
```

### `verse-context` (Verse Deep-Dive)

**File:** `supabase/functions/verse-context/index.ts`  
**Method:** POST  
**Input:** `{ reference: string }`  
**Output:** JSON `{ reference, verse_text, surrounding_passage[], explanation, cross_references[], study_note, book_context }`  
**Model:** `google/gemini-2.5-flash`  
**Technique:** Direct JSON response (with markdown code block extraction fallback)

### Seeder Functions (One-Time Use)

| Function | Purpose |
|----------|---------|
| `seed-bible` | Populates `bible_verses` with the full Bible text |
| `seed-cross-refs` | Populates `cross_references` table |
| `seed-study-notes` | Populates `study_notes` from static data |
| `seed-study-notes-ai` | Generates study notes via AI for books that don't have static data |
| `embed-bible` | Generates vector embeddings for `bible_verses` rows |

These are utility functions that should only need to be run once (or to update data). They are not called by the frontend.

---

## 8. AI Integration

### Gateway

All AI calls go through the **Lovable AI Gateway** at `https://ai.gateway.lovable.dev/v1/chat/completions`. This is an OpenAI-compatible API that proxies to supported models.

**Authentication:** `LOVABLE_API_KEY` secret set on edge functions.

### Models Used

| Model | Used By | Why |
|-------|---------|-----|
| `google/gemini-3-flash-preview` | chat, prayer, devotional | Fast, good reasoning, supports streaming and tool calling |
| `google/gemini-2.5-flash` | verse-context | Balanced cost/quality for structured JSON generation |

### Client-Side AI Module (`src/lib/ai.ts`)

Three exported functions:

1. **`streamChat()`** — SSE streaming chat
   - Calls `/functions/v1/chat`
   - Parses SSE `data:` lines, extracts `choices[0].delta.content`
   - Handles `[DONE]` sentinel
   - Buffers partial JSON lines
   - Callbacks: `onDelta(text)` for each chunk, `onDone()` when complete

2. **`generatePrayer(emotion)`** — Single request/response
   - Calls `/functions/v1/prayer`
   - Returns parsed JSON

3. **`generateDevotional(topic, days)`** — Single request/response
   - Calls `/functions/v1/devotional`
   - Returns parsed JSON

All functions pass the Supabase anon key via `Authorization: Bearer` header.

---

## 9. Key Architectural Patterns

### Streaming Chat (SSE)

```
Client (ChatPage.tsx)
  → POST /functions/v1/chat { messages, user_memories }
  ← SSE stream: data: {"choices":[{"delta":{"content":"..."}}]}
  ← data: [DONE]
```

The `streamChat()` function in `src/lib/ai.ts` handles:
- Reading the `ReadableStream` via `getReader()`
- Decoding `Uint8Array` chunks via `TextDecoder`
- Splitting on newlines and parsing `data:` prefixed JSON
- Buffering incomplete lines across chunks
- Final flush of remaining buffer content

### RAG (Retrieval-Augmented Generation)

The `chat` edge function implements RAG:
1. **Retrieve:** Full-text search on `bible_verses` → top 5 matches
2. **Augment:** Fetch related `cross_references` and `study_notes`
3. **Generate:** Inject retrieved context into system prompt, then call LLM

This ensures the AI has accurate scripture text rather than relying solely on training data.

### Spiritual Memory System (`src/lib/memories.ts`)

After each chat conversation:
1. **Theme extraction:** Scans user message for keywords mapped to 10 themes (anxiety, forgiveness, guidance, hope, grief, anger, gratitude, peace, love, strength)
2. **Verse extraction:** Regex extracts bold verse references from AI response (e.g., `**Isaiah 41:10**`)
3. **Upsert:** For each theme×verse pair, either increments `frequency` or inserts new row in `user_memories`

Memories are loaded on chat page mount and passed to the AI for personalization context.

### Crisis Detection (`src/components/CrisisBanner.tsx`)

Keywords scanned: "suicide", "suicidal", "kill myself", "end my life", "self-harm", "self harm", "don't want to live", "want to die", "hurting myself", "no reason to live", "better off dead"

When detected:
- A dismissible banner appears with:
  - 988 Suicide & Crisis Lifeline (call or text 988)
  - Crisis Text Line (text HOME to 741741)
  - Encouragement to talk to a trusted person

### Shareable Prayer Cards (`src/components/PrayerCard.tsx`)

Uses `html-to-image` library (`toPng`) to capture a styled div as a PNG:
- Gold gradient background
- Verse text in Playfair Display italic
- Prayer text (truncated to 200 chars)
- Download as PNG or share via Web Share API / clipboard

### Theme System (Dark/Light Mode)

**NOT using `next-themes`** despite it being installed. Instead:
- Toggle via `document.documentElement.classList.toggle("dark", isDark)`
- Persisted in `localStorage.setItem("theme", "dark" | "light")`
- Initialized on mount in `SettingsPage.tsx`
- CSS variables defined in `src/index.css` under `:root` and `.dark`

---

## 10. Design System

### Fonts

```css
--font-display: 'Playfair Display', Georgia, serif;  /* Headings, verse references */
--font-body: 'Inter', system-ui, sans-serif;          /* Body text, UI elements */
```

Loaded via Google Fonts in `src/index.css`.

### Color Palette (Light Mode)

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | `40 33% 96%` | Page background (warm cream) |
| `--foreground` | `220 30% 18%` | Primary text (dark navy) |
| `--primary` | `36 60% 50%` | Gold accent — buttons, links, active states |
| `--primary-foreground` | `40 33% 98%` | Text on primary (near white) |
| `--secondary` | `40 20% 90%` | Secondary surfaces |
| `--muted` | `40 15% 92%` | Muted backgrounds |
| `--muted-foreground` | `220 15% 50%` | Subdued text |
| `--destructive` | `0 65% 55%` | Error/crisis red |
| `--border` | `36 20% 88%` | Border color |
| `--gold` | `36 60% 50%` | Gold token |
| `--gold-light` | `40 50% 75%` | Light gold |
| `--gold-glow` | `36 70% 60%` | Gold glow effect |
| `--cream` | `40 33% 96%` | Cream background |
| `--navy` | `220 30% 18%` | Navy text |

### Custom CSS Utilities

```css
.gradient-gold      /* Gold gradient background (buttons, icons) */
.text-gradient-gold  /* Gold gradient text */
.shadow-soft         /* Soft gold-tinted shadow */
.shadow-card         /* Subtle card shadow */
```

### Tailwind Config Extensions

- `font-display` and `font-body` font families
- Custom `gold`, `cream`, `navy`, `warm-gray` color tokens
- Custom animations: `fade-up`, `glow-pulse`, accordion up/down
- Border radius from CSS variable `--radius: 0.75rem`

---

## 11. Authentication Flow

### Provider
Email/password authentication via Supabase Auth.

### AuthContext (`src/contexts/AuthContext.tsx`)

Provides:
```typescript
{
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email, password, displayName?) => Promise<void>;
  signIn: (email, password) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### Flow

1. **Sign Up:** Calls `supabase.auth.signUp()` with `emailRedirectTo: window.location.origin`. User gets "Check your email to confirm" toast.
2. **Sign In:** Calls `supabase.auth.signInWithPassword()`. On success, navigates to `/chat`.
3. **Sign Out:** Calls `supabase.auth.signOut()`. Navigates to `/`.
4. **Session Persistence:** `onAuthStateChange` listener + `getSession()` on mount.
5. **Profile Auto-Creation:** A Postgres trigger (`handle_new_user`) creates a `profiles` row when a new user signs up.

### What's Missing
- No password reset/forgot password flow
- No email confirmation callback handler page
- No social auth (Google, GitHub, etc.)

---

## 12. Environment Variables & Secrets

### Client-Side (`.env` — auto-managed, DO NOT EDIT)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (safe for client) |
| `VITE_SUPABASE_PROJECT_ID` | Project ID |

### Edge Function Secrets

| Secret | Purpose | Used By |
|--------|---------|---------|
| `LOVABLE_API_KEY` | Lovable AI Gateway authentication | chat, prayer, devotional, verse-context, seed-study-notes-ai |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access (bypasses RLS) | chat (for RAG queries) |
| `SUPABASE_URL` | Supabase URL (auto-available in edge functions) | chat |

---

## 13. File-by-File Reference

### `/src/App.tsx`
Root component. Sets up providers (QueryClient, Tooltip, Auth), router with all routes, Navbar, ErrorBoundary, Toaster.

### `/src/main.tsx`
Entry point. Renders `<App />` into `#root`.

### `/src/index.css`
Design system definition. All CSS custom properties (light + dark mode), font imports, utility classes.

### `/src/lib/ai.ts`
Client-side AI interface. Three functions:
- `streamChat()` — SSE streaming with delta callbacks
- `generatePrayer()` — Emotion → prayer JSON
- `generateDevotional()` — Topic → devotional JSON

### `/src/lib/memories.ts`
Spiritual memory system:
- `extractVerseRefs(text)` — Regex extracts bold verse references
- `extractThemes(text)` — Keyword matching against 10 theme categories
- `upsertMemories(userId, userMessage, aiResponse)` — Persists theme×verse pairs

### `/src/contexts/AuthContext.tsx`
React context for authentication. Wraps Supabase Auth with `signUp`, `signIn`, `signOut` methods.

### `/src/components/AuthGuard.tsx`
Route protection. Shows spinner during auth loading, redirects to `/auth` if unauthenticated.

### `/src/components/Navbar.tsx`
Responsive navigation:
- **Desktop:** Fixed top bar with horizontal nav links + auth buttons
- **Mobile:** Fixed bottom tab bar with icons + labels, auth in top bar

6 nav items: Home, Chat, Explore, Prayer, Devotional, Dashboard. Settings shown only when authenticated.

### `/src/components/CrisisBanner.tsx`
Crisis detection module:
- `detectCrisis(text)` — Scans for 11 crisis keywords
- `<CrisisBanner />` — Dismissible alert with helpline numbers

### `/src/components/PrayerCard.tsx`
Modal for creating shareable prayer cards:
- Renders a gold-gradient div with verse + prayer text
- `html-to-image` captures it as PNG
- Download or share via Web Share API

### `/src/components/ErrorBoundary.tsx`
Class-based React error boundary. Shows branded error page with refresh button.

### `/src/pages/Index.tsx`
Landing page:
- Hero section with parallax background image
- "Your AI Bible Companion" tagline
- 4 feature cards
- 4 suggested prompt chips (link to `/chat?prompt=...`)
- Scripture quote (Psalm 119:105)
- Footer

### `/src/pages/ChatPage.tsx`
AI chat interface:
- Persistent message array in state
- SSE streaming with progressive rendering
- Crisis detection on each user message
- Verse reference detection in AI responses (clickable links to `/verse?ref=...`)
- Inline bookmark buttons next to detected verses
- Quick prompt buttons for empty state
- Memory hint for returning users
- Auto-send from `?prompt=` query param
- Duplicate detection when saving verses

### `/src/pages/ExplorePage.tsx`
Bible explorer (671 lines, largest component):
- **Level 1:** Book grid (OT/NT sections) with search filter
- **Level 2:** Chapter number grid
- **Level 3:** Verse list + detail panel
  - Desktop: Sticky side panel with verse text, study note, cross-references
  - Mobile: Inline accordion below selected verse
- Quick-jump input (parses "John 3:16" style references)
- Cross-reference navigation (click → navigates within explorer)
- Verse bookmarking toggle (save/unsave)
- Chapter overview note (study note for verse 1)
- "Study note available" indicator on verses

### `/src/pages/PrayerPage.tsx`
Prayer generator:
- 6 emotion buttons with emojis
- Calls `generatePrayer()` on selection
- Displays: verse, prayer, reflection, cross-reference
- Saves to `prayer_journal` and `daily_checkins` (authenticated)
- Expandable prayer journal history
- Shareable card integration

### `/src/pages/DevotionalPage.tsx`
Devotional generator:
- Topic input + day selector (3/5/7)
- 8 suggested topics
- Generates multi-day devotional via `generateDevotional()`
- Accordion UI for each day (title, verse, explanation, reflection, prayer)
- Save/load devotionals (authenticated)
- Saved devotionals list

### `/src/pages/VersePage.tsx`
Verse deep-dive:
- Fetches context from `verse-context` edge function
- Displays: main verse, book context, surrounding passage (±5 verses), explanation, cross-references (linked to other verse pages), study note
- Save button (authenticated)

### `/src/pages/DashboardPage.tsx`
Personal dashboard:
- **Streak:** Daily check-in streak calculation
- **Life Verse Map:** Theme×verse frequency grid
- **Recent Prayers:** Prayer journal entries with shareable card option
- **Conversation History:** Expandable conversation list with theme badges
- **Saved Verses:** Card grid with inline note editing, share, delete, image card
- Loading skeleton while data fetches

### `/src/pages/SettingsPage.tsx`
Settings:
- Profile: Email (read-only), display name (editable)
- Appearance: Dark/light mode toggle

### `/src/pages/AuthPage.tsx`
Authentication:
- Toggle between sign in and sign up modes
- Fields: email, password, display name (sign up only)
- Dynamic page title

### `/src/pages/NotFound.tsx`
404 page with branded styling.

---

## 14. What Works (Feature Status)

### ✅ Fully Functional

- Full Bible browsing (66 books, all chapters/verses from `bible_verses` table)
- AI chat with SSE streaming and progressive rendering
- RAG context injection (FTS search → cross-refs → study notes → system prompt)
- Spiritual memory system (theme extraction, verse tracking, frequency counting)
- Memory-based personalization hints in chat
- Prayer generation with structured JSON (verse + prayer + reflection + cross-ref)
- Prayer journal saving and viewing
- Daily emotion check-ins and streak tracking
- Devotional generation (3/5/7 days) with structured JSON
- Save/load devotionals
- Verse deep-dive page with AI-generated context
- Bible explorer with 3-level navigation
- Quick-jump input (e.g., "John 3:16")
- Cross-reference display and clickable navigation
- Study notes display (chapter overview + per-verse)
- Mobile-responsive inline study notes and cross-refs (accordion)
- Verse bookmarking (toggle save/unsave from Explore page)
- Duplicate detection when saving verses from Chat
- Dashboard with saved verses, prayer journal, conversation history, life verse map
- Inline verse note editing on dashboard
- Shareable prayer/verse cards (PNG download + Web Share API)
- Dark/light mode with localStorage persistence
- Email/password authentication with email confirmation
- Profile creation (auto via trigger) and editing
- Crisis detection and helpline banner
- Responsive navigation (top bar desktop, bottom tab mobile)
- Error boundary with branded error page
- Dynamic page titles per route
- 404 page

### ⚠️ Partially Working

- **Verse text when saving from chat:** `handleSaveVerse` in ChatPage passes empty string `""` for `verse_text` — the verse is saved but without the actual text
- **Study notes coverage:** Generated for books 0-24 (Genesis through Lamentations); books 25-65 may have incomplete coverage
- **Cross-reference scroll-to:** Clicking a cross-ref in Explore navigates to the correct chapter but doesn't scroll to the specific verse

---

## 15. Known Limitations & Issues

### Security

1. **JWT verification disabled on all edge functions** — `verify_jwt = false` in `config.toml`. Anyone with the anon key can call all edge functions. For a production app, sensitive functions should verify JWT.
2. **No rate limiting on client** — Chat, prayer, and devotional requests have no client-side throttling. Server-side 429 errors are handled but there's no proactive rate limiting.

### Authentication

3. **No password reset flow** — Auth page has sign in/sign up but no "forgot password" option
4. **No email confirmation redirect handler** — After signup, user sees "check your email" but there's no dedicated confirmation callback page
5. **No social auth** — Only email/password; no Google, GitHub, etc.

### Data & Types

6. **`daily_checkins` typed as `any`** — Accessed with `as any` casts, suggesting the table may not be in auto-generated types (or was added later)
7. **`saved_devotionals` typed with `as unknown as`** — JSONB `devotional_json` field requires manual casting

### UI/UX

8. **No pagination** — Saved verses, conversations, and prayer journal use `.limit()` but have no "load more" or pagination UI
9. **`next-themes` installed but unused** — Dark mode uses manual class toggle instead
10. **`recharts` and `react-resizable-panels` installed but unused** — Dead dependencies
11. **Verse deep-dive has no "Back to Explore" link** — Only links back to Chat

### Testing

12. **No real tests** — Only a placeholder test (`example.test.ts` with `expect(true).toBe(true)`)
13. **No integration tests** — No tests for API calls, database operations, or user flows
14. **No component tests** — No tests for React components

### Performance

15. **No caching** — Bible verses are re-fetched from the database on every chapter navigation
16. **No lazy loading** — All pages are eagerly imported in `App.tsx`

---

## 16. Testing

### Current State

**Framework:** Vitest with jsdom  
**Setup file:** `src/test/setup.ts`  
**Config:** `vitest.config.ts`

**Existing tests:** 1 placeholder:
```typescript
// src/test/example.test.ts
import { describe, it, expect } from 'vitest';

describe('Example', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

### Running Tests

```bash
npm test        # Run once
npm run test:watch  # Watch mode
```

### Recommended Test Coverage (Not Yet Implemented)

| Area | What to Test |
|------|-------------|
| `lib/memories.ts` | `extractVerseRefs()` with various verse formats, `extractThemes()` keyword matching |
| `lib/ai.ts` | SSE parsing logic, error handling for 429/402 |
| `CrisisBanner.tsx` | `detectCrisis()` with various inputs |
| `ExplorePage.tsx` | `parseReference()` with valid/invalid inputs |
| Auth flow | Sign up, sign in, sign out, AuthGuard redirect |
| Chat flow | Message sending, streaming rendering, verse detection |
| Prayer flow | Emotion selection, prayer display, journal saving |
| Dashboard | Data loading, verse note editing, delete |

---

## 17. Deployment

### Frontend
- Deployed via Lovable's publish flow
- Accessible at `https://shepherdai.lovable.app`
- Frontend changes require clicking "Update" in the publish dialog

### Backend (Edge Functions)
- Deploy automatically when code is pushed
- No manual deployment needed
- All 8 functions are currently deployed

### Database
- Managed via Lovable Cloud (Supabase)
- Migrations are in `supabase/migrations/` (auto-managed, DO NOT EDIT)

---

## 18. Local Development

### Prerequisites
- Node.js (v18+)
- npm

### Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd shepherd-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `vite build` | Production build |
| `build:dev` | `vite build --mode development` | Development build |
| `preview` | `vite preview` | Preview production build locally |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Run tests in watch mode |
| `lint` | `eslint .` | Lint the codebase |

### Environment Variables

The `.env` file is auto-managed by Lovable Cloud. For local development, you'll need:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

### Important Notes

- **DO NOT EDIT** the following auto-generated files:
  - `src/integrations/supabase/client.ts`
  - `src/integrations/supabase/types.ts`
  - `supabase/config.toml`
  - `.env`
  - `supabase/migrations/`

---

*This documentation was generated from the codebase as of March 2026. For the most up-to-date information, refer to the source code.*
