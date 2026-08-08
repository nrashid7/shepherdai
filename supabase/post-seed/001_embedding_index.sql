-- Run after verse embeddings are loaded. Building HNSW before bulk vector
-- updates makes every seed update maintain an incomplete index.
create index if not exists bible_verses_embedding_hnsw_idx
  on public.bible_verses using hnsw (embedding vector_cosine_ops)
  with (m = 8, ef_construction = 32);
