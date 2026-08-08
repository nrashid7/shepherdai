import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AppError } from "./errors.ts";
import { parseReference, toReference } from "./reference.ts";

export type BibleVerse = {
  id: string;
  book: string;
  chapter: number;
  verse_number: number;
  text: string;
};

export type CrossReference = {
  from_verse: string;
  to_verse: string;
  weight: number | null;
};

export type StudyNote = {
  verse_reference: string;
  note_text: string;
};

export const THEME_HINTS: Record<string, string[]> = {
  anxiety: ["peace", "fear", "trust", "comfort"],
  grief: ["sorrow", "hope", "comfort", "presence"],
  guidance: ["wisdom", "path", "counsel", "discernment"],
  anger: ["gentleness", "patience", "self-control"],
  gratitude: ["thanksgiving", "praise", "joy"],
  forgiveness: ["mercy", "grace", "reconciliation"],
  hope: ["future", "promise", "endurance"],
  loneliness: ["presence", "companionship", "comfort"],
};

export async function findVerseByReference(sb: SupabaseClient, reference: string): Promise<BibleVerse | null> {
  const parsed = parseReference(reference);
  if (parsed.endChapter === undefined || parsed.endVerse === undefined) {
    const { data, error } = await sb
      .from("bible_verses")
      .select("id, book, chapter, verse_number, text")
      .ilike("book", parsed.book)
      .eq("chapter", parsed.chapter)
      .eq("verse_number", parsed.verse)
      .maybeSingle();
    if (error) throw new AppError(500, "verse_lookup_failed", "Failed to retrieve verse from scripture store", error);
    return data;
  }

  const passage: BibleVerse[] = [];
  for (let chapter = parsed.chapter; chapter <= parsed.endChapter; chapter += 1) {
    let query = sb.from("bible_verses").select("id, book, chapter, verse_number, text")
      .ilike("book", parsed.book).eq("chapter", chapter).order("verse_number", { ascending: true });
    if (chapter === parsed.chapter) query = query.gte("verse_number", parsed.verse);
    if (chapter === parsed.endChapter) query = query.lte("verse_number", parsed.endVerse);
    const { data, error } = await query;
    if (error) throw new AppError(500, "verse_lookup_failed", "Failed to retrieve scripture range", error);
    passage.push(...(data || []));
    if (passage.length > 200) throw new AppError(400, "reference_range_too_large", "Verse ranges are limited to 200 verses");
  }
  if (!passage.length) return null;
  return { ...passage[0], text: passage.map((item) => item.text).join(" ") };
}

export async function getSurroundingPassage(
  sb: SupabaseClient,
  book: string,
  chapter: number,
  verse: number,
  radius = 2,
): Promise<Array<{ verse: number; text: string }>> {
  const minVerse = Math.max(1, verse - radius);
  const maxVerse = verse + radius;
  const { data, error } = await sb
    .from("bible_verses")
    .select("verse_number, text")
    .ilike("book", book)
    .eq("chapter", chapter)
    .gte("verse_number", minVerse)
    .lte("verse_number", maxVerse)
    .order("verse_number", { ascending: true });

  if (error) {
    throw new AppError(500, "passage_lookup_failed", "Failed to retrieve surrounding passage", error);
  }

  return (data || []).map((row) => ({ verse: row.verse_number, text: row.text }));
}

export async function getCrossReferences(sb: SupabaseClient, reference: string): Promise<CrossReference[]> {
  const { data, error } = await sb
    .from("cross_references")
    .select("from_verse, to_verse, weight")
    .or(`from_verse.eq.${reference},to_verse.eq.${reference}`)
    .order("weight", { ascending: false })
    .limit(10);

  if (error) {
    throw new AppError(500, "cross_refs_lookup_failed", "Failed to retrieve cross references", error);
  }
  return data || [];
}

export async function getStudyNotes(sb: SupabaseClient, reference: string): Promise<StudyNote[]> {
  const { data, error } = await sb
    .from("study_notes")
    .select("verse_reference, note_text")
    .eq("verse_reference", reference)
    .limit(5);

  if (error) {
    throw new AppError(500, "study_notes_lookup_failed", "Failed to retrieve study notes", error);
  }
  return data || [];
}

export async function searchVersesByQuery(
  sb: SupabaseClient,
  query: string,
  options?: { limit?: number },
): Promise<BibleVerse[]> {
  const limit = options?.limit ?? 7;
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Exact reference match gets highest priority.
  try {
    const exact = await findVerseByReference(sb, trimmed);
    if (exact) return [exact];
  } catch {
    // Not a reference-shaped query.
  }

  const { data, error } = await sb.rpc("search_verses", {
    query: trimmed,
    match_count: limit,
  });

  if (error) {
    throw new AppError(500, "verse_search_failed", "Failed to search scripture corpus", error);
  }

  return (data || []).map((v) => ({
    id: v.id,
    book: v.book,
    chapter: v.chapter,
    verse_number: v.verse_number,
    text: v.text,
  }));
}

export async function getRelevantVersesForTheme(
  sb: SupabaseClient,
  theme: string,
  options?: { limit?: number },
): Promise<Array<{ reference: string; text: string; theme: string }>> {
  const seed = theme.toLowerCase().trim();
  const hints = THEME_HINTS[seed] || [];
  const query = [seed, ...hints].join(" ");
  const verses = await searchVersesByQuery(sb, query, { limit: options?.limit ?? 7 });
  return verses.map((v) => ({
    reference: toReference(v.book, v.chapter, v.verse_number),
    text: v.text,
    theme: seed || "general",
  }));
}
