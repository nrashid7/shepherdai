import { supabase } from "@/integrations/supabase/client";
import type { ExtractedMemory } from "@/types/memory";
import { BIBLE_BOOKS } from "@/lib/bible";

const VERSE_REGEX = /\*\*([1-3]?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s\d+:\d+(?:-\d+)?)\*\*/g;
const PLAIN_VERSE_REGEX = /(?:^|[^\w])([1-3]?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s\d+:\d+(?:-\d+)?)(?=$|[^\w])/g;

const THEME_KEYWORDS: Record<string, string[]> = {
  anxiety: ["anxious", "anxiety", "worried", "worry", "fear", "afraid", "panic"],
  forgiveness: ["forgiv", "forgiveness", "grudge", "resentment", "pardon"],
  guidance: ["guidance", "decision", "direction", "lost", "confused", "wisdom"],
  hope: ["hope", "hopeful", "future", "promise", "trust"],
  grief: ["grief", "loss", "death", "mourning", "sad", "sorrow"],
  anger: ["angry", "anger", "frustrated", "rage", "wrath"],
  gratitude: ["grateful", "thankful", "gratitude", "blessed", "praise"],
  peace: ["peace", "calm", "rest", "still", "quiet"],
  love: ["love", "loved", "compassion", "kindness", "mercy"],
  strength: ["strength", "strong", "courage", "brave", "endure"],
};

export function extractVerseRefs(text: string): string[] {
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = VERSE_REGEX.exec(text)) !== null) {
    matches.push(m[1]);
  }
  return [...new Set(matches)];
}

export function extractThemes(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.entries(THEME_KEYWORDS)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([theme]) => theme);
}

function extractPlainVerseRefs(text: string): string[] {
  const matches = Array.from(text.matchAll(PLAIN_VERSE_REGEX)).map((m) => m[1]);
  const books = [...BIBLE_BOOKS].map((b) => b.name).sort((a, b) => b.length - a.length);
  const cleaned = matches
    .map((raw) => {
      const candidate = raw.trim();
      for (const book of books) {
        const escaped = book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = candidate.match(new RegExp(`(${escaped}\\s\\d+:\\d+(?:-\\d+)?)$`));
        if (match) return match[1];
      }
      return candidate;
    });
  return [...new Set(cleaned)];
}

function extractConcerns(text: string): string[] {
  const lower = text.toLowerCase();
  const patterns = [
    "anxiety", "fear", "stress", "grief", "lonely", "uncertain", "confused", "discouraged",
    "anger", "forgiveness", "guidance", "hope",
  ];
  return patterns.filter((p) => lower.includes(p));
}

function extractGoals(text: string): string[] {
  const goals: string[] = [];
  if (/trust/i.test(text)) goals.push("trust God more");
  if (/pray/i.test(text)) goals.push("grow in prayer");
  if (/forgiv/i.test(text)) goals.push("forgive others");
  if (/peace/i.test(text)) goals.push("walk in peace");
  return [...new Set(goals)];
}

export function extractStructuredMemory(
  userMessage: string,
  aiResponse: string,
  citedVerses?: string[],
): ExtractedMemory {
  const themes = [...new Set([...extractThemes(userMessage), ...extractThemes(aiResponse)])];
  const verses = [...new Set([...(citedVerses || []), ...extractVerseRefs(aiResponse), ...extractPlainVerseRefs(aiResponse)])];
  const concerns = extractConcerns(userMessage);
  const spiritualGoals = extractGoals(userMessage);

  const signalCount = themes.length + concerns.length + spiritualGoals.length + verses.length;
  const confidence = Math.max(0.2, Math.min(0.98, 0.25 + signalCount * 0.1));

  return {
    themes,
    concerns,
    spiritualGoals,
    verses: verses.slice(0, 6),
    confidence,
  };
}

export async function upsertMemories(
  userId: string,
  userMessage: string,
  aiResponse: string,
  options?: { citedVerses?: string[]; sourceType?: string },
) {
  const extracted = extractStructuredMemory(userMessage, aiResponse, options?.citedVerses);
  const themes = extracted.themes;
  const verses = extracted.verses;
  if (themes.length === 0 || verses.length === 0) return;

  // Upsert each theme+verse combo
  for (const theme of themes) {
    for (const verse of verses.slice(0, 3)) {
      // Check existing
      const { data: existing } = await supabase
        .from("user_memories")
        .select("id, frequency, confidence, concerns, spiritual_goals")
        .eq("user_id", userId)
        .eq("theme", theme)
        .eq("verse_reference", verse)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_memories")
          .update({
            frequency: existing.frequency + 1,
            confidence: Math.max(existing.confidence || 0, extracted.confidence),
            concerns: [...new Set([...(existing.concerns || []), ...extracted.concerns])],
            spiritual_goals: [...new Set([...(existing.spiritual_goals || []), ...extracted.spiritualGoals])],
            source_type: options?.sourceType || "chat_structured",
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) console.error("Failed to update memory:", error);
      } else {
        const { error } = await supabase.from("user_memories").insert({
          user_id: userId,
          theme,
          verse_reference: verse,
          confidence: extracted.confidence,
          concerns: extracted.concerns,
          spiritual_goals: extracted.spiritualGoals,
          source_type: options?.sourceType || "chat_structured",
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        });
        if (error) console.error("Failed to insert memory:", error);
      }
    }
  }
}
