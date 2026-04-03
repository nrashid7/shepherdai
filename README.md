# Shepherd AI

AI-powered Bible companion that provides scripture-grounded guidance, personalized prayers, and multi-day devotionals.

## Scripture Authority Policy

- Scripture text and references come from database tables (`bible_verses`, `cross_references`, `study_notes`) in core flows.
- AI is used for explanation, application, prayer wording, and devotional guidance.
- AI should not freehand or invent scripture quotes in product-critical paths.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Edge Functions)
- **AI**: OpenRouter (Google Gemini models)
- **Search**: Full-text search via `search_verses` RPC with websearch + plainto_tsquery fallback

## Local Development

Prerequisites: Node.js 18+ and npm.

```sh
# Install dependencies
npm install

# Create .env with your Supabase project values (see .env.example)
cp .env.example .env

# Start the dev server (runs on http://localhost:8080)
npm run dev
```

## Environment Variables

The frontend requires these Vite build-time variables in `.env`:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref |

Edge Functions require these secrets (set in Supabase Dashboard > Edge Functions > Secrets):

| Secret | Used by |
|---|---|
| `OPENROUTER_API_KEY` | chat, prayer, devotional, verse-context, seed-study-notes-ai |
| `ADMIN_SECRET` | embed-bible, seed-bible, seed-cross-refs, seed-study-notes, seed-study-notes-ai |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected by Supabase for hosted Edge Functions.

## Database

Schema is managed via migrations in `supabase/migrations/`. To apply against a linked project:

```sh
npx supabase db push
```

Key tables: `bible_verses`, `cross_references`, `study_notes`, `profiles`, `conversations`, `saved_verses`, `saved_devotionals`, `prayer_journal`, `daily_checkins`, `user_memories`.

Key functions: `search_verses` (FTS), `match_verses` (vector), `handle_new_user` (auth trigger), `update_updated_at_column`.

## Edge Functions

Deployed to Supabase. User-facing functions require a valid JWT (`verify_jwt = true`):

| Function | Model Policy (default) | JWT |
|---|---|---|
| `chat` | `MODEL_CHAT` -> `google/gemini-3-flash-preview` | required |
| `prayer` | `MODEL_PRAYER` -> `anthropic/claude-haiku-4.5` | required |
| `devotional` | `MODEL_DEVOTIONAL` -> `anthropic/claude-haiku-4.5` | required |
| `verse-context` | `MODEL_VERSE_CONTEXT` -> `google/gemini-3-flash-preview` | required |

Admin/seed functions use `X-Admin-Secret` header auth (`verify_jwt = false`):

| Function | Purpose |
|---|---|
| `seed-bible` | Import KJV Bible text from GitHub |
| `seed-cross-refs` | Import cross-references |
| `seed-study-notes` | Import study notes |
| `seed-study-notes-ai` | Generate study notes via AI |
| `embed-bible` | Seed/manage bible verse data |

## Project Structure

```
src/
  pages/          # Route pages (Chat, Prayer, Devotional, Explore, Dashboard, etc.)
  lib/            # AI client (ai.ts), memory tracking (memories.ts)
  components/     # Shared UI components
  contexts/       # Auth context
  integrations/   # Supabase client
supabase/
  functions/      # Edge Functions (Deno)
  functions/_shared/ # Shared AI/retrieval/validation utilities
  migrations/     # SQL schema migrations
  config.toml     # Project and function config
```
