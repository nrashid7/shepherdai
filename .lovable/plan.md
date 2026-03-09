

## Problem

The Explore page already loads cross-references and study notes, but they are only visible in a sticky side panel (right column on desktop). On mobile, this panel renders **below** the full verse list, so users have to scroll past all verses to see them. The data is there but the UX makes it effectively invisible on smaller screens.

## Plan

### 1. Make cross-references and study notes visible inline on mobile
- When a verse is tapped/clicked, expand an inline detail section directly below that verse (accordion-style) showing the study note and cross-references
- Keep the side panel on desktop (`md:` breakpoint and up) but hide the inline expansion there
- On mobile (`< md`), hide the side panel and show the inline expansion instead

### 2. Make cross-references clickable/navigable
- When a user clicks a cross-reference like "Romans 8:28", parse it and use the existing quick-jump logic to navigate directly to that verse in the explorer
- This creates a connected browsing experience

### 3. Show chapter-level study note at the top
- If a study note exists for the chapter's first verse (e.g., "Romans 8:1"), display it as a summary card above the verse list so users immediately see context

### Files Changed
| File | Change |
|------|--------|
| `src/pages/ExplorePage.tsx` | Add inline verse detail expansion for mobile, make cross-ref items clickable, add chapter summary note card |

