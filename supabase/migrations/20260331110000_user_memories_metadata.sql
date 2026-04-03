-- Backward-compatible memory metadata upgrade for reliability ranking and source tracking.
ALTER TABLE public.user_memories
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS concerns TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS spiritual_goals TEXT[] DEFAULT '{}';

UPDATE public.user_memories
SET
  first_seen_at = COALESCE(first_seen_at, created_at, now()),
  last_seen_at = COALESCE(last_seen_at, updated_at, created_at, now()),
  confidence = COALESCE(confidence, 0.5),
  source_type = COALESCE(source_type, 'legacy')
WHERE first_seen_at IS NULL
   OR last_seen_at IS NULL
   OR confidence IS NULL
   OR source_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_memories_user_confidence_recent
  ON public.user_memories (user_id, confidence DESC, last_seen_at DESC);
