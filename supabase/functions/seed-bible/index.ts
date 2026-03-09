import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// KJV Bible CSV from scrollmapper/bible_databases (MIT License)
const KJV_CSV_URL = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/csv/KJV.csv";

// Book name mapping to handle variations (CSV uses "Psalms" but we want "Psalm" etc.)
const BOOK_NAME_MAP: Record<string, string> = {
  "Psalms": "Psalm",
  "Song of Solomon": "Song of Solomon",
  "1 Samuel": "1 Samuel",
  "2 Samuel": "2 Samuel",
  "1 Kings": "1 Kings",
  "2 Kings": "2 Kings",
  "1 Chronicles": "1 Chronicles",
  "2 Chronicles": "2 Chronicles",
  "1 Corinthians": "1 Corinthians",
  "2 Corinthians": "2 Corinthians",
  "1 Thessalonians": "1 Thessalonians",
  "2 Thessalonians": "2 Thessalonians",
  "1 Timothy": "1 Timothy",
  "2 Timothy": "2 Timothy",
  "1 Peter": "1 Peter",
  "2 Peter": "2 Peter",
  "1 John": "1 John",
  "2 John": "2 John",
  "3 John": "3 John",
};

function normalizeBookName(book: string): string {
  return BOOK_NAME_MAP[book] || book;
}

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Accept optional parameters: start_book (0-based index), batch_size (books per call)
    let startBook = 0;
    let booksPerCall = 5; // Process 5 books at a time to stay within timeout
    try {
      const body = await req.json();
      if (body.start_book !== undefined) startBook = body.start_book;
      if (body.books_per_call !== undefined) booksPerCall = body.books_per_call;
    } catch { /* no body is fine */ }

    // Fetch full CSV
    console.log("Fetching KJV CSV...");
    const response = await fetch(KJV_CSV_URL);
    if (!response.ok) throw new Error(`Failed to fetch KJV CSV: ${response.status}`);
    const csvText = await response.text();

    // Parse CSV into verses grouped by book
    const lines = csvText.split("\n").filter(l => l.trim());
    // Skip header
    const dataLines = lines.slice(1);

    // Group by book to track book boundaries
    const bookMap = new Map<string, { book: string; chapter: number; verse_number: number; text: string }[]>();
    for (const line of dataLines) {
      const fields = parseCSVLine(line);
      if (fields.length < 4) continue;
      const book = normalizeBookName(fields[0].trim());
      const chapter = parseInt(fields[1]);
      const verse_number = parseInt(fields[2]);
      const text = fields.slice(3).join(",").trim(); // rejoin in case text had commas
      if (!book || isNaN(chapter) || isNaN(verse_number) || !text) continue;
      if (!bookMap.has(book)) bookMap.set(book, []);
      bookMap.get(book)!.push({ book, chapter, verse_number, text });
    }

    const bookNames = Array.from(bookMap.keys());
    const totalBooks = bookNames.length;
    const endBook = Math.min(startBook + booksPerCall, totalBooks);
    const booksToProcess = bookNames.slice(startBook, endBook);

    console.log(`Processing books ${startBook}-${endBook - 1} of ${totalBooks}: ${booksToProcess.join(", ")}`);

    let totalInserted = 0;
    const BATCH_SIZE = 500;

    for (const bookName of booksToProcess) {
      const verses = bookMap.get(bookName)!;
      for (let i = 0; i < verses.length; i += BATCH_SIZE) {
        const batch = verses.slice(i, i + BATCH_SIZE);
        const { error, count } = await sb.from("bible_verses").upsert(batch, {
          onConflict: "book,chapter,verse_number",
          ignoreDuplicates: true,
        });
        if (error) {
          console.error(`Error inserting ${bookName} batch ${i}:`, error);
        } else {
          totalInserted += batch.length;
        }
      }
    }

    const hasMore = endBook < totalBooks;

    return new Response(JSON.stringify({
      message: `Inserted ${totalInserted} verses from books ${startBook}-${endBook - 1}`,
      books_processed: booksToProcess,
      next_start_book: hasMore ? endBook : null,
      total_books: totalBooks,
      complete: !hasMore,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-bible error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
