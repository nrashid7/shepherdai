
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bible_verses_book_chapter_verse_unique') THEN
    ALTER TABLE public.bible_verses ADD CONSTRAINT bible_verses_book_chapter_verse_unique UNIQUE (book, chapter, verse_number);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cross_references_from_to_unique') THEN
    ALTER TABLE public.cross_references ADD CONSTRAINT cross_references_from_to_unique UNIQUE (from_verse, to_verse);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'study_notes_verse_reference_unique') THEN
    ALTER TABLE public.study_notes ADD CONSTRAINT study_notes_verse_reference_unique UNIQUE (verse_reference);
  END IF;
END $$;
