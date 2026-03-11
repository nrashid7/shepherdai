# Shepherd AI — RAG Pipeline

## Overview

Shepherd AI uses retrieval-augmented generation (RAG) to ground every AI response in actual Bible text. Rather than relying on the language model's training data for theological content, the system retrieves relevant scripture, cross-references, and study notes from the database and injects them into the prompt context. This ensures that AI responses are traceable to specific verses and that no theology is fabricated from model memory.

## Pipeline Steps

```
┌──────────────┐    ┌────────────────┐    ┌───────────────────┐
│ User Message │───▶│ Full-Text      │───▶│ Retrieve Top 5    │
│              │    │ Search (RPC)   │    │ Matching Verses   │
└──────────────┘    └────────────────┘    └───────────────────┘
                                                   │
                         ┌─────────────────────────┤
                         ▼                         ▼
                ┌─────────────────┐    ┌───────────────────────┐
                │ Fetch Cross-    │    │ Fetch Study Notes     │
                │ References      │    │ for Matched Verses    │
                └─────────────────┘    └───────────────────────┘
                         │                         │
                         └─────────┬───────────────┘
                                   ▼
                         ┌───────────────────┐
                         │ Assemble RAG      │
                         │ Context String    │
                         └───────────────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Inject User       │
                         │ Memories          │
                         └───────────────────┘
                                   │
                                   ▼
                         ┌───────────────────┐    ┌──────────────────┐
                         │ Send to Gemini    │───▶│ SSE Stream Back  │
                         │ via AI Gateway    │    │ to Client        │
                         └───────────────────┘    └──────────────────┘
```

### Step 1: User Message Received

The user sends a message from the chat interface (`ChatPage`). The frontend calls `streamChat()` in `src/lib/ai.ts`, which POSTs the conversation history and any user memories to the `chat` edge function at `/functions/v1/chat`.

### Step 2: Full-Text Search

The `chat` edge function (`supabase/functions/chat/index.ts`) extracts the latest user message and calls the `search_verses` database RPC. This performs a PostgreSQL full-text search against the `bible_verses` table and returns the top 5 matching verses ranked by relevance.

### Step 3: Retrieve Relevant Verses

The top 5 verse matches are returned with their book, chapter, verse number, and text. These form the primary scripture context for the AI response.

### Step 4: Expand with Cross-References

For each matched verse, the function queries the `cross_references` table to find related verses. Cross-references connect verses across books and testaments, giving the model a broader scriptural foundation for its response.

### Step 5: Retrieve Study Notes

For each matched verse, the function queries the `study_notes` table to retrieve commentary and explanatory notes. These notes (sourced from Tyndale Open Study Notes and AI-generated supplements) provide scholarly context that helps the model give more informed explanations.

### Step 6: Assemble RAG Context

All retrieved data — verses, cross-references, and study notes — is assembled into a `ragContext` string. This string is prepended to the system prompt, giving the model explicit scripture to reference. The system prompt instructs the model to base its response on this retrieved context rather than its own training data.

### Step 7: Inject User Memories

If the user is authenticated, their spiritual memories (theme-verse pairs with frequency data) are injected as a `memoryContext` section in the system prompt. This allows the model to reference verses and themes the user has previously explored, creating a personalized experience. For example, if a user frequently engages with verses about anxiety, the model can acknowledge this pattern.

### Step 8: Generate and Stream Response

The complete prompt (system prompt + RAG context + memory context + conversation history) is sent to `google/gemini-3-flash-preview` via the Lovable AI Gateway. The response is streamed back as server-sent events (SSE). The edge function pipes the raw SSE stream directly to the client. The frontend parses each `data: {...}` line, extracts content tokens from `choices[0].delta.content`, and renders them incrementally.

The AI response typically includes:
- **Scripture references** — Bold verse citations drawn from the retrieved context
- **Explanation** — Contextual interpretation grounded in the retrieved verses and study notes
- **Reflection** — A thought-provoking question or application point
- **Prayer** — A short prayer related to the user's situation and the referenced scripture

## Design Principles

### Scripture Is the Primary Source

The RAG pipeline ensures that every response is anchored to real Bible text retrieved from the database. The system prompt explicitly instructs the model to reference the provided verses rather than generating theology from memory.

### Traceability

AI responses should always be traceable to retrieved verses. The model formats verse references in bold (e.g., **John 3:16**), making it clear which scriptures informed the response. The `memories.ts` module on the frontend extracts these references for persistence and future personalization.

### Context Window Management

The pipeline limits input to control costs and stay within model context limits:
- Maximum 50 messages in conversation history
- Top 5 verse matches from full-text search
- Up to 5 user memories for personalization

### Error Handling

The edge function handles rate limiting (HTTP 429) and usage quota exceeded (HTTP 402) errors from the AI gateway, returning appropriate error responses that the frontend translates into user-friendly messages.

## Implementation Files

| File | Role in Pipeline |
|---|---|
| `src/lib/ai.ts` | Frontend: sends request, parses SSE stream |
| `src/lib/memories.ts` | Frontend: extracts themes and verse refs, persists memories |
| `src/pages/ChatPage.tsx` | Frontend: UI, message state, memory loading |
| `supabase/functions/chat/index.ts` | Backend: full RAG pipeline orchestration |
| `supabase/functions/_shared/cors.ts` | Backend: CORS handling |
