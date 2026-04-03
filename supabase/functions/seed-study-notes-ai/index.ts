import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/admin-auth.ts";

// All 66 books with chapter counts
const BOOKS: [string, number][] = [
  ["Genesis", 50], ["Exodus", 40], ["Leviticus", 27], ["Numbers", 36], ["Deuteronomy", 34],
  ["Joshua", 24], ["Judges", 21], ["Ruth", 4], ["1 Samuel", 31], ["2 Samuel", 24],
  ["1 Kings", 22], ["2 Kings", 25], ["1 Chronicles", 29], ["2 Chronicles", 36],
  ["Ezra", 10], ["Nehemiah", 13], ["Esther", 10], ["Job", 42], ["Psalm", 150],
  ["Proverbs", 31], ["Ecclesiastes", 12], ["Song of Solomon", 8],
  ["Isaiah", 66], ["Jeremiah", 52], ["Lamentations", 5], ["Ezekiel", 48], ["Daniel", 12],
  ["Hosea", 14], ["Joel", 3], ["Amos", 9], ["Obadiah", 1], ["Jonah", 4],
  ["Micah", 7], ["Nahum", 3], ["Habakkuk", 3], ["Zephaniah", 3], ["Haggai", 2],
  ["Zechariah", 14], ["Malachi", 4],
  ["Matthew", 28], ["Mark", 16], ["Luke", 24], ["John", 21], ["Acts", 28],
  ["Romans", 16], ["1 Corinthians", 16], ["2 Corinthians", 13], ["Galatians", 6],
  ["Ephesians", 6], ["Philippians", 4], ["Colossians", 4],
  ["1 Thessalonians", 5], ["2 Thessalonians", 3], ["1 Timothy", 6], ["2 Timothy", 4],
  ["Titus", 3], ["Philemon", 1], ["Hebrews", 13], ["James", 5],
  ["1 Peter", 5], ["2 Peter", 3], ["1 John", 5], ["2 John", 1], ["3 John", 1],
  ["Jude", 1], ["Revelation", 22],
];

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;
  const adminResp = requireAdmin(req);
  if (adminResp) return adminResp;

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Accept parameters for batch processing
    let bookIndex = 0;
    let chaptersPerCall = 10;
    let startChapter = 1;
    try {
      const body = await req.json();
      if (body.book_index !== undefined) bookIndex = body.book_index;
      if (body.chapters_per_call !== undefined) chaptersPerCall = body.chapters_per_call;
      if (body.start_chapter !== undefined) startChapter = body.start_chapter;
    } catch { /* no body */ }

    if (bookIndex >= BOOKS.length) {
      return new Response(JSON.stringify({ complete: true, message: "All books processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [bookName, totalChapters] = BOOKS[bookIndex];
    const endChapter = Math.min(startChapter + chaptersPerCall - 1, totalChapters);

    console.log(`Processing ${bookName} chapters ${startChapter}-${endChapter} of ${totalChapters}`);

    // Get key verses from each chapter to generate notes for
    const { data: verses } = await sb
      .from("bible_verses")
      .select("book, chapter, verse_number, text")
      .eq("book", bookName)
      .gte("chapter", startChapter)
      .lte("chapter", endChapter)
      .in("verse_number", [1, 2, 3]) // First few verses per chapter as anchors
      .order("chapter")
      .order("verse_number");

    if (!verses || verses.length === 0) {
      // Skip to next chunk
      const nextChapter = endChapter + 1;
      const hasMoreChapters = nextChapter <= totalChapters;
      const nextBookIndex = hasMoreChapters ? bookIndex : bookIndex + 1;
      const nextStart = hasMoreChapters ? nextChapter : 1;
      return new Response(JSON.stringify({
        complete: nextBookIndex >= BOOKS.length,
        message: `No verses found for ${bookName} ${startChapter}-${endChapter}, skipping`,
        next_book_index: nextBookIndex,
        next_start_chapter: nextStart,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Group by chapter, pick verse 1 as the reference
    const chapterVerses = new Map<number, { ref: string; text: string }>();
    for (const v of verses) {
      if (!chapterVerses.has(v.chapter)) {
        chapterVerses.set(v.chapter, {
          ref: `${v.book} ${v.chapter}:${v.verse_number}`,
          text: v.text,
        });
      }
    }

    // Generate study notes via AI for this batch
    const chaptersToProcess = Array.from(chapterVerses.entries());
    const prompt = `Generate concise Bible study notes for the following chapters of ${bookName}. For each chapter, provide a 2-3 sentence study note covering the key themes, historical context, and theological significance. Format as JSON array with objects having "verse_reference" (e.g. "${bookName} 1:1") and "note_text" fields.

Chapters and their opening verses:
${chaptersToProcess.map(([ch, v]) => `- ${bookName} ${ch}: "${v.text}"`).join("\n")}

Return ONLY the JSON array, no markdown or extra text.`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://shepherdai.app",
        "X-Title": "Shepherd AI",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a Bible scholar generating concise study notes. Return only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let notes: { verse_reference: string; note_text: string }[];
    try {
      notes = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      notes = [];
    }

    // Insert notes
    let inserted = 0;
    if (notes.length > 0) {
      const { error } = await sb.from("study_notes").upsert(
        notes.map(n => ({ verse_reference: n.verse_reference, note_text: n.note_text })),
        { onConflict: "verse_reference", ignoreDuplicates: false }
      );
      if (error) {
        console.error("Insert error:", error);
      } else {
        inserted = notes.length;
      }
    }

    const nextChapter = endChapter + 1;
    const hasMoreChapters = nextChapter <= totalChapters;
    const nextBookIndex = hasMoreChapters ? bookIndex : bookIndex + 1;
    const nextStart = hasMoreChapters ? nextChapter : 1;

    return new Response(JSON.stringify({
      complete: nextBookIndex >= BOOKS.length && !hasMoreChapters,
      message: `${bookName} ch${startChapter}-${endChapter}: inserted ${inserted} study notes`,
      next_book_index: nextBookIndex,
      next_start_chapter: nextStart,
      book: bookName,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("seed-study-notes-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
