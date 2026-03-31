

## Export Bible Verse Embeddings

Export the `embedding` column from `bible_verses` as a CSV file using `psql`. The query will select `id`, `book`, `chapter`, `verse_number`, and `embedding` for all rows where embedding is not null.

### Output
`/mnt/documents/bible_verses_embeddings.csv` — CSV with columns: `id, book, chapter, verse_number, embedding`

### Command
```bash
psql -c "COPY (SELECT id, book, chapter, verse_number, embedding::text FROM public.bible_verses WHERE embedding IS NOT NULL) TO STDOUT WITH CSV HEADER" > /mnt/documents/bible_verses_embeddings.csv
```

