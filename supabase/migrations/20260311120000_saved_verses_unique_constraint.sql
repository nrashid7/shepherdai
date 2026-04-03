DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saved_verses_user_verse_unique') THEN
    ALTER TABLE public.saved_verses
      ADD CONSTRAINT saved_verses_user_verse_unique UNIQUE (user_id, verse_reference);
  END IF;
END $$;
