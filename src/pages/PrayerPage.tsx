import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, BookOpen, Clock, Loader2, Image } from "lucide-react";
import { generatePrayer } from "@/lib/ai";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { PrayerCardModal } from "@/components/PrayerCard";

interface PrayerEntry {
  id: string;
  emotion: string;
  verse_reference: string;
  prayer_text: string;
  reflection: string | null;
  created_at: string;
}

interface PrayerResponse {
  verse_reference: string;
  verse_text: string;
  prayer: string;
  reflection: string;
  cross_reference?: string;
}

const emotions = [
  { label: "Anxious", emoji: "😟" },
  { label: "Grateful", emoji: "🙏" },
  { label: "Sad", emoji: "😢" },
  { label: "Hopeful", emoji: "✨" },
  { label: "Angry", emoji: "😤" },
  { label: "Seeking Guidance", emoji: "🧭" },
];

const PrayerPage = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [prayer, setPrayer] = useState<PrayerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [journal, setJournal] = useState<PrayerEntry[]>([]);
  const [showJournal, setShowJournal] = useState(false);
  const [cardData, setCardData] = useState<{ verse_reference: string; verse_text: string; prayer?: string; reflection?: string } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadJournal();
  }, [user]);

  const loadJournal = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("prayer_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setJournal(data as PrayerEntry[]);
  };

  const handleSelectEmotion = async (emotion: string) => {
    setSelectedEmotion(emotion);
    setPrayer(null);
    setLoading(true);
    try {
      const result = await generatePrayer(emotion);
      setPrayer(result);
      if (user) {
        await supabase.from("prayer_journal").insert({
          user_id: user.id,
          emotion,
          verse_reference: result.verse_reference,
          prayer_text: result.prayer,
          reflection: result.reflection,
        });
        loadJournal();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate prayer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold shadow-soft">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">How are you feeling today?</h1>
          <p className="font-body text-muted-foreground">Select what resonates with your heart right now.</p>
        </motion.div>

        {user && journal.length > 0 && (
          <div className="mb-6 text-center">
            <button onClick={() => setShowJournal(!showJournal)} className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary hover:underline">
              <Clock className="h-4 w-4" />
              {showJournal ? "Hide" : "View"} Prayer Journal ({journal.length})
            </button>
          </div>
        )}

        <AnimatePresence>
          {showJournal && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-lg font-semibold text-foreground">Prayer Journal</h3>
                {journal.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-xs font-medium text-primary">{entry.emotion}</span>
                        <span className="font-body text-xs text-muted-foreground">{format(new Date(entry.created_at), "MMM d, yyyy")}</span>
                      </div>
                      <p className="mt-1 font-body text-xs text-muted-foreground">{entry.verse_reference}</p>
                      <p className="mt-1 font-body text-sm italic text-muted-foreground line-clamp-2">{entry.prayer_text}</p>
                    </div>
                    <button
                      onClick={() => setCardData({ verse_reference: entry.verse_reference, verse_text: "", prayer: entry.prayer_text, reflection: entry.reflection || undefined })}
                      className="ml-2 shrink-0 p-1 text-muted-foreground hover:text-primary"
                      title="Create shareable card"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {emotions.map((emotion) => {
            const isActive = selectedEmotion === emotion.label;
            return (
              <button
                key={emotion.label}
                onClick={() => handleSelectEmotion(emotion.label)}
                disabled={loading}
                className={`flex flex-col items-center gap-2 rounded-xl border p-5 font-body transition-all ${isActive ? "border-primary bg-primary/10 shadow-soft" : "border-border bg-card shadow-card hover:border-primary/30 hover:shadow-soft"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-3xl">{emotion.emoji}</span>
                <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>{emotion.label}</span>
              </button>
            );
          })}
        </motion.div>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-body text-sm">Seeking scripture for you...</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {prayer && !loading && (
            <motion.div key={selectedEmotion} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-display text-sm font-semibold text-primary">{prayer.verse_reference}</span>
                  </div>
                  <button
                    onClick={() => setCardData({ verse_reference: prayer.verse_reference, verse_text: prayer.verse_text, prayer: prayer.prayer, reflection: prayer.reflection })}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-body text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    <Image className="h-3.5 w-3.5" /> Share Card
                  </button>
                </div>
                <p className="font-display text-lg italic leading-relaxed text-foreground">"{prayer.verse_text}"</p>
              </div>

              {prayer.cross_reference && (
                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  <p className="font-body text-sm text-muted-foreground">
                    <span className="font-medium text-primary">Cross-reference:</span> {prayer.cross_reference}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Your Prayer</h3>
                <p className="font-body italic leading-relaxed text-muted-foreground">{prayer.prayer}</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/50 p-6">
                <h3 className="mb-2 font-display text-base font-semibold text-foreground">Reflection</h3>
                <p className="font-body text-sm text-muted-foreground">{prayer.reflection}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {cardData && <PrayerCardModal {...cardData} onClose={() => setCardData(null)} />}
    </div>
  );
};

export default PrayerPage;
