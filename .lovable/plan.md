

## Database Export Plan

Export all 10 tables from the database to individual CSV files, then package them into a single downloadable ZIP.

### Tables to Export
1. `bible_verses` — Full Bible text (~31,000 rows)
2. `cross_references` — Verse-to-verse links
3. `study_notes` — Commentary per verse
4. `conversations` — User chat history
5. `saved_verses` — Bookmarked verses
6. `saved_devotionals` — Saved devotional plans
7. `prayer_journal` — Prayer entries
8. `daily_checkins` — Emotion check-ins
9. `user_memories` — Spiritual theme tracking
10. `profiles` — User profiles

### Approach
- Use `psql` with `COPY ... TO STDOUT WITH CSV HEADER` for each table
- Write individual CSVs to `/mnt/documents/`
- Create a ZIP archive containing all CSVs
- Deliver as a single downloadable file

### Output
`/mnt/documents/shepherd_ai_database_export.zip` containing all 10 CSV files.

