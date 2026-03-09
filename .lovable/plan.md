

## PRD Datasets Analysis

### Datasets Specified in PRD

The PRD defines **4 data layers** for the RAG pipeline:

| Layer | Dataset | Source | Current Status |
|-------|---------|--------|----------------|
| **Layer 1** | Bible Text Corpus | [thiagobodruk/bible](https://github.com/thiagobodruk/bible) or [seven1m/open-bibles](https://github.com/seven1m/open-bibles) | ❌ Only 32 verses seeded (need ~31,000) |
| **Layer 2** | Cross References | [openbibleinfo/Bible-Cross-References](https://github.com/openbibleinfo/Bible-Cross-References) | ⚠️ 265 entries (need ~340,000) |
| **Layer 3** | Study Notes | Tyndale Open Study Notes | ❌ `study_notes` table is empty |
| **Layer 4** | Teaching Packs | Catholic (Catechism), Reformed (Westminster) | ❌ Not implemented (optional) |

---

## Implementation Plan

### Phase 1: Full Bible Import (~31,000 verses)

**Source**: Use `thiagobodruk/bible` GitHub repo — provides JSON files per book (KJV, public domain)

**Strategy**:
1. Create a new edge function `seed-bible` that fetches raw JSON from GitHub
2. Process book-by-book to avoid timeout (66 books × ~500 verses avg)
3. Use upsert to avoid duplicates
4. FTS column auto-generates on insert

```text
┌─────────────────────────────────────────────────┐
│  seed-bible Edge Function                       │
│  - Fetch JSON per book from GitHub              │
│  - Insert into bible_verses in batches          │
│  - Track progress per book                      │
└─────────────────────────────────────────────────┘
```

---

### Phase 2: Cross References Import (~340,000 entries)

**Source**: `openbibleinfo/Bible-Cross-References` — TSV file with verse pairs

**Strategy**:
1. Create edge function `seed-cross-refs`
2. Fetch TSV from GitHub raw URL
3. Parse and batch insert into `cross_references` table
4. Add weight based on relationship strength

---

### Phase 3: Study Notes Import

**Source**: Tyndale Open Study Notes (public domain)

**Strategy**:
1. Create edge function `seed-study-notes`
2. Fetch from Tyndale's GitHub/repository
3. Map notes to verse references
4. Insert into `study_notes` table

---

### Phase 4 (Optional): Teaching Packs

This is marked as optional in PRD. Can add later if user requests:
- New `teaching_packs` table with `tradition` enum (catholic, reformed, etc.)
- User preference stored in `profiles` to activate specific tradition

---

## Technical Considerations

| Concern | Solution |
|---------|----------|
| Edge function 60s timeout | Process one book at a time; allow sequential invocations |
| Large dataset (340k cross-refs) | Chunk into batches of 1000; use multiple calls |
| FTS auto-generation | Already configured — new inserts auto-populate `fts` column |
| Avoiding duplicates | Use `ON CONFLICT DO NOTHING` or check existing count |

---

## Database Schema (Already Matches PRD)

The existing tables align with the PRD schema:
- ✅ `bible_verses` — matches PRD `BibleVerses`
- ✅ `cross_references` — matches PRD `CrossReferences`
- ✅ `study_notes` — matches PRD `StudyNotes`
- ✅ `saved_verses`, `prayer_journal`, `user_memories`, `conversations`, `profiles` — all match

---

## Execution Steps

1. **Create `seed-bible` edge function** — fetches full KJV from GitHub, inserts by book
2. **Create `seed-cross-refs` edge function** — fetches OpenBible cross-references TSV
3. **Create `seed-study-notes` edge function** — fetches Tyndale study notes
4. **Add admin endpoint or trigger mechanism** to run seeding (manual invoke)
5. **Verify FTS search** works across full dataset

---

## Expected Outcome

| Table | Before | After |
|-------|--------|-------|
| `bible_verses` | 32 | ~31,102 |
| `cross_references` | 265 | ~340,000 |
| `study_notes` | 0 | ~31,000 |

This will enable comprehensive RAG retrieval covering the entire Bible with cross-references and study context.

