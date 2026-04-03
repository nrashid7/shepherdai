import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { generatePrayer } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PrayerResponse } from "@/types/ai";

export type PrayerJournalEntry = {
  id: string;
  emotion: string;
  verse_reference: string;
  prayer_text: string;
  reflection: string | null;
  created_at: string;
};

export function usePrayerGenerator() {
  const { user } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [prayer, setPrayer] = useState<PrayerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [journal, setJournal] = useState<PrayerJournalEntry[]>([]);

  const loadJournal = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("prayer_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setJournal(data as PrayerJournalEntry[]);
  }, [user]);

  useEffect(() => {
    if (user) void loadJournal();
  }, [user, loadJournal]);

  const handleSelectEmotion = useCallback(async (emotion: string) => {
    setSelectedEmotion(emotion);
    setPrayer(null);
    setLoading(true);
    try {
      const result = await generatePrayer({ emotion });
      setPrayer(result);

      if (user) {
        const leadVerse = result.supportingScriptures[0];
        const { error: journalError } = await supabase.from("prayer_journal").insert({
          user_id: user.id,
          emotion,
          verse_reference: leadVerse?.reference || "N/A",
          prayer_text: result.prayer,
          reflection: result.encouragement,
        });
        if (journalError) {
          console.error("Failed to save prayer:", journalError);
          toast.error("Prayer generated but failed to save to journal");
        }

        const { error: checkinError } = await supabase.from("daily_checkins").insert({
          user_id: user.id,
          emotion,
        });
        if (checkinError) {
          console.error("Failed to record check-in:", checkinError);
        }

        await loadJournal();
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error("Failed to generate prayer");
      toast.error(err.message || "Failed to generate prayer");
    } finally {
      setLoading(false);
    }
  }, [user, loadJournal]);

  return {
    selectedEmotion,
    prayer,
    loading,
    journal,
    loadJournal,
    handleSelectEmotion,
  };
}

