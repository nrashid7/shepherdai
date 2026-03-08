import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart, Map, Bookmark, Trash2, Share2, Image, MessageCircle, Edit2, Check, X, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PrayerCardModal } from "@/components/PrayerCard";

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

interface Conversation {
  id: string;
  message: string;
  response: string;
  created_at: string;
  themes: string[] | null;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [cardData, setCardData] = useState<{ verse_reference: string; verse_text: string; prayer?: string } | null>(null);
  const [editingVerseId, setEditingVerseId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard — Shepherd AI";
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    const [versesRes, prayersRes, memoriesRes, convosRes, checkinsRes] = await Promise.all([
      supabase.from("saved_verses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("prayer_journal").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("user_memories").select("*").eq("user_id", user.id).order("frequency", { ascending: false }).limit(12),
      supabase.from("conversations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("daily_checkins" as any).select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    ]);
    if (versesRes.data) setSavedVerses(versesRes.data as SavedVerse[]);
    if (prayersRes.data) setPrayers(prayersRes.data as PrayerEntry[]);
    if (memoriesRes.data) setMemories(memoriesRes.data as Memory[]);
    if (convosRes.data) setConversations(convosRes.data as Conversation[]);

    // Calculate streak
    if (checkinsRes.data && (checkinsRes.data as any[]).length > 0) {
      let streak = 1;
      const dates = (checkinsRes.data as any[]).map((c: any) => format(new Date(c.created_at), "yyyy-MM-dd"));
      const unique = [...new Set(dates)];
      for (let i = 1; i < unique.length; i++) {
        const prev = new Date(unique[i - 1]);
        const curr = new Date(unique[i]);
        const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 1) streak++;
        else break;
      }
      setCheckinStreak(streak);
    }
    setIsLoading(false);
  };

  const deleteVerse = async (id: string) => {
    await supabase.from("saved_verses").delete().eq("id", id);
    setSavedVerses((prev) => prev.filter((v) => v.id !== id));
    toast.success("Verse removed");
  };

  const saveVerseNote = async (id: string) => {
    const { error } = await supabase.from("saved_verses").update({ note: editNote }).eq("id", id);
    if (!error) {
      setSavedVerses((prev) => prev.map((v) => (v.id === id ? { ...v, note: editNote } : v)));
      toast.success("Note saved");
    }
    setEditingVerseId(null);
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

  const LoadingSkeleton = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-36 rounded-lg" />)}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="mb-3 h-16 w-full rounded-lg" />)}
      </div>
      <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        {[1, 2].map((i) => <Skeleton key={i} className="mb-3 h-20 w-full rounded-lg" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 pt-16 md:pb-0">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Your Spiritual Journey</h1>
          <p className="font-body text-muted-foreground">A reflection of your walk with scripture and prayer.</p>
        </motion.div>

        {isLoading ? <LoadingSkeleton /> : <>

        {/* Streak + Stats */}
        {checkinStreak > 0 && (
          <motion.div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Flame className="h-6 w-6 text-primary" />
            <div>
              <p className="font-display text-lg font-bold text-foreground">{checkinStreak}-day streak!</p>
              <p className="font-body text-xs text-muted-foreground">Keep checking in daily to grow your streak.</p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Life Verse Map */}
          <motion.div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="mb-5 flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Life Verse Map</h2>
            </div>
            {memories.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {memories.map((item) => (
                  <div key={item.id} className="flex flex-col rounded-lg border border-border bg-secondary/50 px-4 py-3" style={{ minWidth: "140px" }}>
                    <span className="font-body text-xs font-medium uppercase tracking-wider text-primary">{item.theme}</span>
                    <span className="mt-1 font-display text-sm font-semibold text-foreground">{item.verse_reference}</span>
                    <span className="mt-1 font-body text-xs text-muted-foreground">Referenced {item.frequency} times</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Your spiritual themes will appear here as you use Shepherd AI.</p>
            )}
          </motion.div>

          {/* Prayer Journal */}
          <motion.div className="rounded-xl border border-border bg-card p-6 shadow-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="mb-5 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Recent Prayers</h2>
            </div>
            {prayers.length > 0 ? (
              <div className="space-y-4">
                {prayers.map((prayer) => (
                  <div key={prayer.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-xs font-medium text-primary">{prayer.emotion}</span>
                        <span className="font-body text-xs text-muted-foreground">{format(new Date(prayer.created_at), "MMM d")}</span>
                      </div>
                      <p className="mt-1 font-body text-sm italic text-muted-foreground line-clamp-2">{prayer.prayer_text}</p>
                    </div>
                    <button
                      onClick={() => setCardData({ verse_reference: prayer.verse_reference, verse_text: "", prayer: prayer.prayer_text })}
                      className="ml-2 shrink-0 p-1 text-muted-foreground hover:text-primary"
                      title="Create shareable card"
                    >
                      <Image className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Visit the Prayer page to start your prayer journal.</p>
            )}
          </motion.div>

          {/* Conversation History */}
          <motion.div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="mb-5 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Conversation History</h2>
            </div>
            {conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((convo) => (
                  <div key={convo.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-medium text-foreground line-clamp-1">{convo.message}</p>
                      <div className="flex items-center gap-2">
                        {convo.themes && convo.themes.length > 0 && (
                          <div className="flex gap-1">
                            {convo.themes.slice(0, 2).map((t) => (
                              <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] font-medium text-primary">{t}</span>
                            ))}
                          </div>
                        )}
                        <span className="shrink-0 font-body text-xs text-muted-foreground">{format(new Date(convo.created_at), "MMM d")}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedConvo(expandedConvo === convo.id ? null : convo.id)}
                      className="mt-2 font-body text-xs font-medium text-primary hover:underline"
                    >
                      {expandedConvo === convo.id ? "Hide response" : "View response"}
                    </button>
                    <AnimatePresence>
                      {expandedConvo === convo.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden border-t border-border pt-3"
                        >
                          <p className="font-body text-sm leading-relaxed text-muted-foreground whitespace-pre-line line-clamp-[12]">{convo.response}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Start a conversation in Chat to see your history here.</p>
            )}
          </motion.div>

          {/* Saved Verses with inline note editing */}
          <motion.div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="mb-5 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Saved Verses</h2>
            </div>
            {savedVerses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedVerses.map((verse) => (
                  <div key={verse.id} className="group relative rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:shadow-soft">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-display text-sm font-semibold text-primary">{verse.verse_reference}</span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => { setEditingVerseId(verse.id); setEditNote(verse.note || ""); }} className="p-1 text-muted-foreground hover:text-primary">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setCardData({ verse_reference: verse.verse_reference, verse_text: verse.verse_text })} className="p-1 text-muted-foreground hover:text-primary">
                          <Image className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => shareCard(verse)} className="p-1 text-muted-foreground hover:text-primary">
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteVerse(verse.id)} className="p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground line-clamp-3">{verse.verse_text}</p>

                    {editingVerseId === verse.id ? (
                      <div className="mt-2 flex items-center gap-1">
                        <input
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Add a personal note..."
                          className="flex-1 rounded border border-border bg-background px-2 py-1 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                        <button onClick={() => saveVerseNote(verse.id)} className="p-1 text-primary hover:text-primary/80">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingVerseId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      verse.note && <p className="mt-2 font-body text-xs italic text-muted-foreground">{verse.note}</p>
                    )}

                    <span className="mt-2 block font-body text-xs text-muted-foreground">{format(new Date(verse.created_at), "MMM d, yyyy")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Save verses from your chat conversations to build your collection.</p>
            )}
          </motion.div>
        </div>
        </>}

      {cardData && <PrayerCardModal {...cardData} onClose={() => setCardData(null)} />}
    </div>
  );
};

export default DashboardPage;
