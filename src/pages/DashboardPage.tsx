import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Map, Bookmark, Trash2, Share2, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SavedVerse {
  id: string;
  verse_reference: string;
  verse_text: string;
  note: string | null;
  theme: string | null;
  created_at: string;
}

interface PrayerEntry {
  id: string;
  emotion: string;
  verse_reference: string;
  prayer_text: string;
  created_at: string;
}

interface Memory {
  id: string;
  theme: string;
  verse_reference: string;
  frequency: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [cardVerse, setCardVerse] = useState<SavedVerse | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [versesRes, prayersRes, memoriesRes] = await Promise.all([
      supabase.from("saved_verses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("prayer_journal").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("user_memories").select("*").eq("user_id", user.id).order("frequency", { ascending: false }).limit(12),
    ]);
    if (versesRes.data) setSavedVerses(versesRes.data as SavedVerse[]);
    if (prayersRes.data) setPrayers(prayersRes.data as PrayerEntry[]);
    if (memoriesRes.data) setMemories(memoriesRes.data as Memory[]);
  };

  const deleteVerse = async (id: string) => {
    await supabase.from("saved_verses").delete().eq("id", id);
    setSavedVerses((prev) => prev.filter((v) => v.id !== id));
    toast.success("Verse removed");
  };

  const shareCard = async (verse: SavedVerse) => {
    const text = `"${verse.verse_text}"\n— ${verse.verse_reference}\n\nShared via Shepherd AI`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Sign in to view your journey</h2>
          <p className="font-body text-muted-foreground">Your saved verses, prayers, and spiritual themes will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Your Spiritual Journey</h1>
          <p className="font-body text-muted-foreground">A reflection of your walk with scripture and prayer.</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Life Verse Map */}
          <motion.div
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Life Verse Map</h2>
            </div>
            {memories.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {memories.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-lg border border-border bg-secondary/50 px-4 py-3"
                    style={{ minWidth: "140px" }}
                  >
                    <span className="font-body text-xs font-medium uppercase tracking-wider text-primary">
                      {item.theme}
                    </span>
                    <span className="mt-1 font-display text-sm font-semibold text-foreground">
                      {item.verse_reference}
                    </span>
                    <span className="mt-1 font-body text-xs text-muted-foreground">
                      Referenced {item.frequency} times
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">
                Your spiritual themes will appear here as you use Shepherd AI. Start chatting or praying to build your verse map!
              </p>
            )}
          </motion.div>

          {/* Prayer Journal */}
          <motion.div
            className="rounded-xl border border-border bg-card p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Recent Prayers</h2>
            </div>
            {prayers.length > 0 ? (
              <div className="space-y-4">
                {prayers.map((prayer) => (
                  <div key={prayer.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-xs font-medium text-primary">{prayer.emotion}</span>
                      <span className="font-body text-xs text-muted-foreground">
                        {format(new Date(prayer.created_at), "MMM d")}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-sm italic text-muted-foreground line-clamp-2">
                      {prayer.prayer_text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">
                Visit the Prayer page to start your prayer journal.
              </p>
            )}
          </motion.div>

          {/* Saved Verses */}
          <motion.div
            className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Saved Verses</h2>
            </div>
            {savedVerses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedVerses.map((verse) => (
                  <div
                    key={verse.id}
                    className="group relative rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:shadow-soft"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-display text-sm font-semibold text-primary">
                        {verse.verse_reference}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => shareCard(verse)} className="p-1 text-muted-foreground hover:text-primary">
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteVerse(verse.id)} className="p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {verse.verse_text}
                    </p>
                    {verse.note && (
                      <p className="mt-2 font-body text-xs italic text-warm-gray">{verse.note}</p>
                    )}
                    <span className="mt-2 block font-body text-xs text-muted-foreground">
                      {format(new Date(verse.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">
                Save verses from your chat conversations to build your collection.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
