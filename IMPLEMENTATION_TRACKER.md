# Shepherd Beta Upgrade Implementation Tracker

## Completed Items
- [x] Audited current frontend, edge functions, schema, and docs to produce the staged implementation plan.
- [x] Created this tracker file with required running sections.
- [x] Added shared edge utilities: `_shared/ai.ts`, `_shared/env.ts`, `_shared/errors.ts`, `_shared/schema.ts`, `_shared/retrieval.ts`, `_shared/reference.ts`.
- [x] Refactored edge functions (`chat`, `prayer`, `devotional`, `verse-context`) to use shared modules and DB-authoritative scripture retrieval for core flows.
- [x] Added frontend typed contracts and guards (`src/types/*`, `src/lib/ai-guards.ts`) and updated AI consumers (`ChatPage`, `PrayerPage`, `DevotionalPage`, `VersePage`).
- [x] Extracted maintainability refactors for large pages (chat components + `useChatSession`, dashboard hook + panels, Bible metadata utility).
- [x] Updated project docs for scripture authority/model policy/schema alignment and added utility test coverage.

## In-Progress Items
- [x] Run typecheck/test/build verification and address discovered regressions.
- [x] Close remaining lint errors that were blocking `npm run lint` (empty interfaces, `any`, and ESM-safe Tailwind plugin import). Warnings remain.

## Follow-Up Items
- Add CI workflow only if it stays minimal and aligns with current repo conventions.
- Verify all new response contracts are backward-compatible with existing saved rows and UI routes.
- Expand automated testing around edge function integration behavior (Deno-level tests/mocks) in a follow-up pass.

## Schema Migrations Added
- `supabase/migrations/20260331110000_user_memories_metadata.sql`
  - Added metadata columns for robust memory ranking (`first_seen_at`, `last_seen_at`, `confidence`, `source_type`, `concerns`, `spiritual_goals`)
  - Added backfill defaults for legacy rows
  - Added confidence/recency index for selection

## Breaking Changes Avoided
- Preserved existing routes and page entry points.
- Preserved table names and existing user data structures while planning additive schema changes only.
- Kept prayer journal and saved devotional storage tables unchanged while upgrading payload shapes.
- Kept anonymous/public scripture browsing behavior unchanged.

## Known Limitations Remaining
- Edge-function-specific integration tests are still limited; current tests focus on parsing/guard/memory utility behavior.
- Supabase CLI regeneration is not available in this environment; `user_memories` generated types were manually extended to match the migration-added metadata columns.

## Upgrade Gap Closure (Mar 2026)
- Added missing frontend hooks and verse components, and refactored `VersePage`, `PrayerPage`, and `DevotionalPage` to use them without changing routes or UX.
- Tightened shared AI payload validation and added DB-authoritative fallbacks so `verse-context`, `prayer`, and `devotional` still return usable responses when AI output is invalid/unavailable.
- Extended focused guard tests; `npm run quality` is green (with existing lint warnings).
- Added minimal CI workflow at `.github/workflows/ci.yml`.
