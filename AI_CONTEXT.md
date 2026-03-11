# Shepherd AI — AI Context

## Project Name

Shepherd AI

## Purpose

An AI-powered Bible companion that helps users apply scripture to real-life situations. Users can engage in conversational scripture guidance, generate prayers, create multi-day devotionals, explore Bible passages, and track their spiritual journey over time.

## Core Philosophy

**Scripture-first AI.** The system retrieves scripture and supporting knowledge (cross-references, study notes) rather than generating theology from model memory. Every AI response is grounded in retrieved Bible text, ensuring traceability and theological accuracy.

## Key Capabilities

- **Conversational scripture guidance** — Chat with an AI assistant that retrieves and references relevant Bible verses in real time via SSE streaming.
- **Prayer generation** — Emotion-based prayers grounded in scripture, with verse references, reflection questions, and cross-references.
- **Devotional creation** — Multi-day devotional plans (1–14 days) on user-chosen topics, each day including a verse, explanation, reflection, and prayer.
- **Verse exploration** — Browse the Bible by book, chapter, and verse with a full-text explorer.
- **Verse deep-dive** — Contextual analysis of individual verses including surrounding passage, cross-references, study notes, and book-level context.
- **Prayer journaling** — Save and revisit prayers with associated emotions and verse references.
- **Spiritual memory tracking** — The system tracks which themes and verses a user repeatedly engages with, using this history to personalize future interactions.
- **Shareable prayer cards** — Generate downloadable/shareable images of prayers and verses.
- **Crisis detection** — Automatic detection of crisis-related language with appropriate resource banners.

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| shadcn/ui | Component library |
| framer-motion | Animations |
| react-router-dom 6 | Client-side routing |
| @tanstack/react-query 5 | Server state management |
| react-markdown | Markdown rendering in chat |
| html-to-image | Shareable prayer card generation |

### Backend

| Technology | Purpose |
|---|---|
| Supabase | Backend-as-a-service platform |
| PostgreSQL | Relational database |
| Supabase Auth | User authentication |
| Supabase Edge Functions | Serverless API endpoints (Deno runtime) |
| pgvector | Vector similarity search for Bible verses |

### AI

| Technology | Purpose |
|---|---|
| Lovable AI Gateway | Proxy to LLM providers (`https://ai.gateway.lovable.dev/v1/chat/completions`) |
| google/gemini-3-flash-preview | Primary model for chat, prayer, and devotional generation |
| google/gemini-2.5-flash | Model for verse-context deep-dive (structured JSON output) |

### Hosting

| Technology | Purpose |
|---|---|
| Lovable Cloud | Application hosting and deployment |
| Published URL | `https://shepherdai.lovable.app` |

## Development Workflow

```
Cursor (IDE) → GitHub (source control) → Lovable Cloud (deployment)
```

Development happens in **Cursor**. Code is pushed to **GitHub**, which triggers deployment on **Lovable Cloud**. Lovable manages runtime infrastructure including the Supabase project, edge function deployment, and the AI gateway. Developers do not manage servers, containers, or CI/CD pipelines directly.

## Key Files for AI Assistants

| File | Purpose |
|---|---|
| `src/App.tsx` | Application routes and layout |
| `src/lib/ai.ts` | Frontend AI client (`streamChat`, `generatePrayer`, `generateDevotional`) |
| `src/lib/memories.ts` | Spiritual memory extraction and persistence |
| `src/pages/ChatPage.tsx` | Main chat interface with SSE streaming |
| `supabase/functions/chat/index.ts` | RAG pipeline and chat edge function |
| `supabase/functions/prayer/index.ts` | Prayer generation edge function |
| `supabase/functions/devotional/index.ts` | Devotional generation edge function |
| `supabase/functions/verse-context/index.ts` | Verse deep-dive edge function |
| `supabase/functions/_shared/cors.ts` | Shared CORS configuration |
| `src/integrations/supabase/client.ts` | Supabase client initialization |
| `src/integrations/supabase/types.ts` | Auto-generated database types (do not edit) |
| `DOCUMENTATION.md` | Comprehensive project reference |
