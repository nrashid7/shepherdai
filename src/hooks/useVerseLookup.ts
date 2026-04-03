import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { generateVerseContext } from "@/lib/ai";
import { saveVerseIfNew } from "@/lib/saved-verses";
import type { VerseContextResponse } from "@/types/bible";

export function useVerseLookup(reference: string) {
  const { user } = useAuth();
  const [data, setData] = useState<VerseContextResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(reference));

  const fetchContext = useCallback(async () => {
    if (!reference) return;
    setLoading(true);
    try {
      setData(await generateVerseContext(reference));
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error("Failed to load verse context");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    if (reference) void fetchContext();
  }, [reference, fetchContext]);

  const canSave = useMemo(() => Boolean(user && data), [user, data]);

  const handleSave = useCallback(async () => {
    if (!user || !data) return;
    try {
      const result = await saveVerseIfNew({
        userId: user.id,
        reference: data.reference,
        text: data.verseText,
      });
      if (result === "exists") toast.info(`${data.reference} is already saved`);
      else toast.success(`Saved ${data.reference}`);
    } catch {
      toast.error("Failed to save verse");
    }
  }, [user, data]);

  return { data, loading, fetchContext, canSave, handleSave };
}

