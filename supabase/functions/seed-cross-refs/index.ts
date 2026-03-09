import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OpenBible cross-references from scrollmapper/bible_databases
const CROSS_REFS_URL = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/sources/extras/cross_references.txt";

// OSIS book abbreviation to human-readable name mapping
const OSIS_TO_NAME: Record<string, string> = {
  Gen: "Genesis", Exod: "Exodus", Lev: "Leviticus", Num: "Numbers", Deut: "Deuteronomy",
  Josh: "Joshua", Judg: "Judges", Ruth: "Ruth", "1Sam": "1 Samuel", "2Sam": "2 Samuel",
  "1Kgs": "1 Kings", "2Kgs": "2 Kings", "1Chr": "1 Chronicles", "2Chr": "2 Chronicles",
  Ezra: "Ezra", Neh: "Nehemiah", Esth: "Esther", Job: "Job", Ps: "Psalm",
  Prov: "Proverbs", Eccl: "Ecclesiastes", Song: "Song of Solomon",
  Isa: "Isaiah", Jer: "Jeremiah", Lam: "Lamentations", Ezek: "Ezekiel", Dan: "Daniel",
  Hos: "Hosea", Joel: "Joel", Amos: "Amos", Obad: "Obadiah", Jonah: "Jonah",
  Mic: "Micah", Nah: "Nahum", Hab: "Habakkuk", Zeph: "Zephaniah", Hag: "Haggai",
  Zech: "Zechariah", Mal: "Malachi",
  Matt: "Matthew", Mark: "Mark", Luke: "Luke", John: "John", Acts: "Acts",
  Rom: "Romans", "1Cor": "1 Corinthians", "2Cor": "2 Corinthians", Gal: "Galatians",
  Eph: "Ephesians", Phil: "Philippians", Col: "Colossians",
  "1Thess": "1 Thessalonians", "2Thess": "2 Thessalonians",
  "1Tim": "1 Timothy", "2Tim": "2 Timothy", Titus: "Titus", Phlm: "Philemon",
  Heb: "Hebrews", Jas: "James", "1Pet": "1 Peter", "2Pet": "2 Peter",
  "1John": "1 John", "2John": "2 John", "3John": "3 John", Jude: "Jude", Rev: "Revelation",
};

// Convert OSIS reference like "Gen.1.1" or "Gen.1.1-Gen.1.3" to "Genesis 1:1" or "Genesis 1:1-3"
function osisToReadable(osis: string): string | null {
  // Handle range like "Ps.89.11-Ps.89.12"
  const parts = osis.split("-");
  const from = parseOsisSingle(parts[0]);
  if (!from) return null;

  if (parts.length === 1) return from;

  const to = parseOsisSingle(parts[1]);
  if (!to) return from;

  // If same book+chapter, just append verse
  if (to.startsWith(from.split(":")[0])) {
    const toVerse = to.split(":")[1];
    return `${from}-${toVerse}`;
  }
  return `${from}-${to}`;
}

function parseOsisSingle(ref: string): string | null {
  const match = ref.match(/^(\d?\w+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const bookName = OSIS_TO_NAME[match[1]];
  if (!bookName) return null;
  return `${bookName} ${match[2]}:${match[3]}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Accept optional parameters for chunked processing
    let startLine = 0;
    let linesPerCall = 10000;
    let minVotes = 1; // Import all refs with at least 1 positive vote
    try {
      const body = await req.json();
      if (body.start_line !== undefined) startLine = body.start_line;
      if (body.lines_per_call !== undefined) linesPerCall = body.lines_per_call;
      if (body.min_votes !== undefined) minVotes = body.min_votes;
    } catch { /* no body is fine */ }

    console.log("Fetching cross-references TSV...");
    const response = await fetch(CROSS_REFS_URL);
    if (!response.ok) throw new Error(`Failed to fetch cross-references: ${response.status}`);
    const tsvText = await response.text();

    const lines = tsvText.split("\n").filter(l => l.trim() && !l.startsWith("#"));
    // Skip header
    const dataLines = lines.slice(1);
    const totalLines = dataLines.length;
    const endLine = Math.min(startLine + linesPerCall, totalLines);
    const chunk = dataLines.slice(startLine, endLine);

    console.log(`Processing lines ${startLine}-${endLine - 1} of ${totalLines}`);

    const refs: { from_verse: string; to_verse: string; weight: number }[] = [];
    let skipped = 0;

    for (const line of chunk) {
      const fields = line.split("\t");
      if (fields.length < 3) continue;

      const votes = parseInt(fields[2]);
      if (isNaN(votes) || votes < minVotes) { skipped++; continue; }

      const fromRef = osisToReadable(fields[0].trim());
      const toRef = osisToReadable(fields[1].trim());
      if (!fromRef || !toRef) { skipped++; continue; }

      // Normalize votes to weight 1-3
      const weight = votes >= 100 ? 3 : votes >= 50 ? 2 : 1;
      refs.push({ from_verse: fromRef, to_verse: toRef, weight });
    }

    // Batch insert
    let totalInserted = 0;
    const BATCH_SIZE = 1000;

    for (let i = 0; i < refs.length; i += BATCH_SIZE) {
      const batch = refs.slice(i, i + BATCH_SIZE);
      const { error } = await sb.from("cross_references").upsert(batch, {
        onConflict: "from_verse,to_verse",
        ignoreDuplicates: true,
      });
      if (error) {
        console.error(`Error inserting batch ${i}:`, error);
      } else {
        totalInserted += batch.length;
      }
    }

    const hasMore = endLine < totalLines;

    return new Response(JSON.stringify({
      message: `Inserted ${totalInserted} cross-references (skipped ${skipped})`,
      next_start_line: hasMore ? endLine : null,
      total_lines: totalLines,
      complete: !hasMore,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-cross-refs error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
