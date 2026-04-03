import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateDevotional } from "@/lib/ai";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";
import type { DevotionalDay } from "@/types/ai";

export type SavedDevotional = {
  id: string;
  topic: string;
  days_count: number;
  devotional_json: DevotionalDay[];
  created_at: string;
};

export function useDevotionalGenerator() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [days, setDays] = useState(5);
  const [devotional, setDevotional] = useState<DevotionalDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [savedDevotionals, setSavedDevotionals] = useState<SavedDevotional[]>([]);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_devotionals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setSavedDevotionals(data as unknown as SavedDevotional[]);
  }, [user]);

  useEffect(() => {
    if (user) void loadSaved();
  }, [user, loadSaved]);

  const handleGenerate = useCallback(async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;
    setLoading(true);
    setDevotional([]);
    try {
      const result = await generateDevotional(t, days);
      setDevotional(result.days || []);
      setExpandedDay(1);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error("Failed to generate devotional");
      toast.error(err.message || "Failed to generate devotional");
    } finally {
      setLoading(false);
    }
  }, [topic, days]);

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.error("Sign in to save devotionals");
      return;
    }
    const { error } = await supabase.from("saved_devotionals").insert({
      user_id: user.id,
      topic: topic || "Untitled",
      days_count: devotional.length,
      devotional_json: devotional as unknown as Json,
    });
    if (error) {
      toast.error("Failed to save devotional");
    } else {
      toast.success("Devotional saved!");
      await loadSaved();
    }
  }, [user, topic, devotional, loadSaved]);

  const loadDevotional = useCallback((saved: SavedDevotional) => {
    setDevotional(saved.devotional_json);
    setTopic(saved.topic);
    setExpandedDay(1);
  }, []);

  return {
    topic,
    setTopic,
    days,
    setDays,
    devotional,
    loading,
    expandedDay,
    setExpandedDay,
    savedDevotionals,
    loadSaved,
    handleGenerate,
    handleSave,
    loadDevotional,
  };
}

