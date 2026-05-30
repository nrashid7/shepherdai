import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface SavedVerse {
  id: string;
  verse_reference: string;
  verse_text: string;
  note: string | null;
  theme: string | null;
  created_at: string;
}

export interface PrayerEntry {
  id: string;
  emotion: string;
  verse_reference: string;
  prayer_text: string;
  created_at: string;
}

export interface MemoryEntry {
  id: string;
  theme: string;
  verse_reference: string;
  frequency: number;
}

export interface ConversationEntry {
  id: string;
  message: string;
  response: string;
  created_at: string;
  themes: string[] | null;
}

export function useDashboardData(userId?: string) {
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const [versesRes, prayersRes, memoriesRes, convosRes, checkinsRes] = await Promise.all([
      supabase.from("saved_verses").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("prayer_journal").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("user_memories").select("*").eq("user_id", userId).order("frequency", { ascending: false }).limit(12),
      supabase.from("conversations").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("daily_checkins").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
    ]);
    if (versesRes.data) setSavedVerses(versesRes.data as SavedVerse[]);
    if (prayersRes.data) setPrayers(prayersRes.data as PrayerEntry[]);
    if (memoriesRes.data) setMemories(memoriesRes.data as MemoryEntry[]);
    if (convosRes.data) setConversations(convosRes.data as ConversationEntry[]);

    if (checkinsRes.data && checkinsRes.data.length > 0) {
      const today = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(new Date(Date.now() - 86_400_000), "yyyy-MM-dd");
      const dates = checkinsRes.data.map((c) => format(new Date(c.created_at!), "yyyy-MM-dd"));
      const unique = [...new Set(dates)];

      if (unique[0] === today || unique[0] === yesterday) {
        let streak = 1;
        for (let i = 1; i < unique.length; i++) {
          const prev = new Date(unique[i - 1]);
          const curr = new Date(unique[i]);
          const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
          if (diff <= 1) streak++;
          else break;
        }
        setCheckinStreak(streak);
      } else {
        setCheckinStreak(0);
      }
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  return {
    savedVerses,
    setSavedVerses,
    prayers,
    memories,
    conversations,
    checkinStreak,
    isLoading,
    reload: loadData,
  };
}
