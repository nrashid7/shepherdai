

## Current Data Status

| Table | Records | Target | Gap |
|-------|---------|--------|-----|
| `bible_verses` | 31,108 | ~31,102 | **Done** (full KJV) |
| `cross_references` | 36,582 | ~340,000 | **~90% missing** — only high-vote refs imported |
| `study_notes` | 137 | ~31,000+ | **99.6% missing** — only hardcoded key verses |

### Critical Issues Found

1. **Book name mismatch**: Bible verses use "I Corinthians", "II Samuel", "Revelation of John" but cross-references use "1 Corinthians", "1 Samuel", "Revelation". This means **cross-reference lookups in the chat RAG pipeline silently fail** for these books — the `WHERE from_verse IN (...)` query won't match.

2. **Cross-references incomplete**: Only 36,582 of ~340,000 entries imported. The `seed-cross-refs` function filters by `min_votes >= 10`, which is too aggressive. Lowering to 1-2 would capture the full dataset.

3. **Study notes are hardcoded**: The `seed-study-notes` function contains only 137 manually written notes. The PRD calls for Tyndale Open Study Notes covering the whole Bible, but the function doesn't actually fetch from any external source.

4. **Duplicate verse entries**: 5 books exist in both naming formats (e.g., "1 Corinthians" with 2 verses AND "I Corinthians" with 437 verses), totaling 71 distinct book names instead of 66.

---

## Plan to Fix

### Step 1: Normalize book names in `bible_verses`
Run a migration to standardize all book names to the format used by cross-references ("1 Samuel" not "I Samuel", "Revelation" not "Revelation of John"):
- `UPDATE bible_verses SET book = '1 Samuel' WHERE book = 'I Samuel'`
- Same for all I/II/III prefixed books and "Revelation of John"
- Delete the 6 duplicate seed verses with the already-correct names

### Step 2: Re-import cross-references with lower threshold
Update `seed-cross-refs` to use `min_votes: 1` and invoke it in chunks to import the full ~340,000 entries.

### Step 3: Expand study notes using AI generation
Replace the hardcoded approach with an edge function that uses the Lovable AI gateway to generate study notes for every chapter of the Bible (1,189 chapters), batch-processing them to populate the `study_notes` table with thousands of entries.

### Step 4: Update chat RAG to also query study notes
The current `chat/index.ts` retrieves `bible_verses` and `cross_references` but never queries `study_notes`. Add study note retrieval to the RAG context so the AI can reference commentary.

---

## Summary of Changes

| Change | Type |
|--------|------|
| Normalize book names migration | DB migration |
| Update `seed-cross-refs` default min_votes | Edge function edit |
| Create AI-powered `seed-study-notes-ai` function | New edge function |
| Add study notes to chat RAG pipeline | Edge function edit |
| Remove duplicate verses | DB migration |

