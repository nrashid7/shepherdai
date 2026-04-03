import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PrayerCardModal } from "@/components/PrayerCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import type { SavedVerse } from "@/hooks/useDashboardData";
import { CheckinPanel } from "@/components/dashboard/CheckinPanel";
import { SavedPrayersPanel } from "@/components/dashboard/SavedPrayersPanel";
import { ConversationHistoryPanel } from "@/components/dashboard/ConversationHistoryPanel";
import { SavedVersesPanel } from "@/components/dashboard/SavedVersesPanel";

const DashboardPage = () => {
  const { user } = useAuth();
  const { savedVerses, setSavedVerses, prayers, memories, conversations, checkinStreak, isLoading } = useDashboardData(user?.id);
  const [cardData, setCardData] = useState<{ verse_reference: string; verse_text: string; prayer?: string } | null>(null);
  const [editingVerseId, setEditingVerseId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Dashboard — Shepherd AI";
  }, [user]);

  const deleteVerse = async (id: string) => {
    const { error } = await supabase.from("saved_verses").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete verse:", error);
      toast.error("Failed to remove verse");
      return;
    }
    setSavedVerses((prev) => prev.filter((v) => v.id !== id));
    toast.success("Verse removed");
  };

  const saveVerseNote = async (id: string) => {
    const { error } = await supabase.from("saved_verses").update({ note: editNote }).eq("id", id);
    if (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note");
      return;
    }
    setSavedVerses((prev) => prev.map((v) => (v.id === id ? { ...v, note: editNote } : v)));
    toast.success("Note saved");
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

        <CheckinPanel checkinStreak={checkinStreak} />

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

          <SavedPrayersPanel prayers={prayers} onCreateCard={setCardData} />

          <ConversationHistoryPanel
            conversations={conversations}
            expandedConvo={expandedConvo}
            onToggleConvo={(id) => setExpandedConvo(expandedConvo === id ? null : id)}
          />

          <SavedVersesPanel
            savedVerses={savedVerses}
            editingVerseId={editingVerseId}
            editNote={editNote}
            setEditNote={setEditNote}
            onEdit={(verse) => {
              setEditingVerseId(verse.id);
              setEditNote(verse.note || "");
            }}
            onSaveNote={saveVerseNote}
            onCancelEdit={() => setEditingVerseId(null)}
            onCreateCard={setCardData}
            onShare={shareCard}
            onDelete={deleteVerse}
          />
        </div>
        </>}
      </div>

      {cardData && <PrayerCardModal {...cardData} onClose={() => setCardData(null)} />}
    </div>
  );
};

export default DashboardPage;
