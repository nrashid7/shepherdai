import { Heart, Image } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { PrayerEntry } from "@/hooks/useDashboardData";

type SavedPrayersPanelProps = {
  prayers: PrayerEntry[];
  onCreateCard: (input: { verse_reference: string; verse_text: string; prayer?: string }) => void;
};

export function SavedPrayersPanel({ prayers, onCreateCard }: SavedPrayersPanelProps) {
  return (
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
                onClick={() => onCreateCard({ verse_reference: prayer.verse_reference, verse_text: "", prayer: prayer.prayer_text })}
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
  );
}
