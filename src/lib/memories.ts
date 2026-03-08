import { supabase } from "@/integrations/supabase/client";

const VERSE_REGEX = /\*\*([1-3]?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s\d+:\d+(?:-\d+)?)\*\*/g;

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

export async function upsertMemories(userId: string, userMessage: string, aiResponse: string) {
  const themes = extractThemes(userMessage);
  const verses = extractVerseRefs(aiResponse);
  if (themes.length === 0 || verses.length === 0) return;

  // Upsert each theme+verse combo
  for (const theme of themes) {
    for (const verse of verses.slice(0, 3)) {
      // Check existing
      const { data: existing } = await supabase
        .from("user_memories")
        .select("id, frequency")
        .eq("user_id", userId)
        .eq("theme", theme)
        .eq("verse_reference", verse)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_memories")
          .update({ frequency: existing.frequency + 1 })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_memories").insert({
          user_id: userId,
          theme,
          verse_reference: verse,
        });
      }
    }
  }
}
