import { supabase } from "@/integrations/supabase/client";
import type { VerseReference } from "@/types/bible";

type SaveVerseInput = {
  userId: string;
  reference: VerseReference;
  text: string;
};

export async function isVerseSaved(userId: string, reference: VerseReference): Promise<boolean> {
  const { data } = await supabase
    .from("saved_verses")
    .select("id")
    .eq("user_id", userId)
    .eq("verse_reference", reference)
    .limit(1);
  return Boolean(data && data.length > 0);
}

export async function saveVerseIfNew(input: SaveVerseInput): Promise<"saved" | "exists"> {
  const exists = await isVerseSaved(input.userId, input.reference);
  if (exists) return "exists";

  const { error } = await supabase.from("saved_verses").insert({
    user_id: input.userId,
    verse_reference: input.reference,
    verse_text: input.text || input.reference,
  });
  if (error) {
    throw error;
  }
  return "saved";
}
