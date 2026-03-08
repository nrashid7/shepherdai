

## Shepherd AI — Remaining Features Plan

### What's Already Built
- Home, Chat, Prayer, Devotional, Dashboard, Auth pages
- 3 edge functions (chat, prayer, devotional) using Lovable AI
- Database: conversations, prayer_journal, profiles, saved_verses, user_memories
- Streaming chat, emotional check-in, devotional generator, verse bookmarking

### What's Missing (from the PRD)

---

### 1. Save Verse from Chat (Feature 9)
The `handleSaveVerse` function exists in ChatPage but has no UI trigger. Parse AI responses for scripture references (e.g., `**Isaiah 41:10**`) and render a bookmark icon next to detected verses in assistant messages.

### 2. Spiritual Memory Population (Feature 4)
The `user_memories` table exists but is never written to. After each chat conversation is saved, extract themes and verse references, then upsert into `user_memories` (increment frequency if theme+verse already exists). On the Chat page, fetch recent memories and occasionally show a suggestion like "You saved Psalm 23 during a difficult week."

### 3. Verse Context Viewer (Feature 5)
Add a dedicated `/verse` page. When a user clicks a verse reference anywhere in the app, navigate to `/verse?ref=Isaiah+41:10`. This page calls a new `verse-context` edge function that asks the AI to return the surrounding passage (e.g., Isaiah 41:8-13), an explanation, and cross-references using tool calling.

### 4. Shareable Prayer Cards (Feature 10)
On the Dashboard and Prayer pages, add a "Create Card" button that generates a styled HTML card (verse + prayer + reflection) rendered in a modal. Use `html2canvas` or a canvas-based approach to allow downloading as an image. Also support the existing Web Share API fallback.

### 5. Home Page Prompt Navigation
Currently, suggested prompts on the Home page link to `/chat` but don't pass the prompt text. Update them to use query params or route state so the Chat page auto-sends the selected prompt on mount.

### 6. Populate User Memories from Conversations
Create a helper in the chat edge function (or client-side after response) that extracts Bible references and themes from the AI response, then upserts into `user_memories`. This powers the Life Verse Map on the Dashboard.

### 7. Crisis/Safety UI Handling
The system prompt already handles crisis detection. Add client-side detection for keywords (self-harm, suicide, etc.) to display a persistent banner with crisis helpline info (988 Lifeline, etc.) alongside the AI response.

---

### Implementation Order

1. **Home page prompt pass-through** — small routing fix
2. **Save verse UI in chat** — parse markdown for verse references, add bookmark buttons
3. **Spiritual memory upsert** — after saving conversations, extract and upsert themes/verses
4. **Verse context page + edge function** — new route, new edge function
5. **Shareable prayer cards** — canvas-based image generation in a modal
6. **Crisis safety banner** — client-side keyword detection + helpline UI

### Technical Details

- **Verse reference parsing**: Regex like `/\*\*([1-3]?\s?[A-Z][a-z]+ \d+:\d+(?:-\d+)?)\*\*/g` on assistant messages
- **New edge function**: `verse-context` — takes a verse reference, returns surrounding passage + explanation via tool calling
- **New route**: `/verse?ref=...` with a clean study-notes style layout
- **Prayer card generation**: Use a hidden `<div>` styled as a card, convert to canvas via `html-to-image` library (or similar)
- **Memory upsert**: Client-side after `saveConversation` — parse the AI response for `**Book Chapter:Verse**` patterns, extract themes from user message, call `supabase.from("user_memories").upsert()`

### Database Changes
- No new tables needed — all existing tables support these features
- May need a DB migration to add a `DELETE` policy on `user_memories` for cleanup

### New Dependencies
- `html-to-image` for prayer card screenshot generation

