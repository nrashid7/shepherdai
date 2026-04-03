import { motion } from "framer-motion";
import { Bookmark, Trash2, Share2, Image, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import type { SavedVerse } from "@/hooks/useDashboardData";

type SavedVersesPanelProps = {
  savedVerses: SavedVerse[];
  editingVerseId: string | null;
  editNote: string;
  setEditNote: (value: string) => void;
  onEdit: (verse: SavedVerse) => void;
  onSaveNote: (id: string) => void;
  onCancelEdit: () => void;
  onCreateCard: (input: { verse_reference: string; verse_text: string }) => void;
  onShare: (verse: SavedVerse) => void;
  onDelete: (id: string) => void;
};

export function SavedVersesPanel(props: SavedVersesPanelProps) {
  const {
    savedVerses, editingVerseId, editNote, setEditNote, onEdit, onSaveNote, onCancelEdit, onCreateCard, onShare, onDelete,
  } = props;

  return (
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
                  <button onClick={() => onEdit(verse)} className="p-1 text-muted-foreground hover:text-primary">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onCreateCard({ verse_reference: verse.verse_reference, verse_text: verse.verse_text })} className="p-1 text-muted-foreground hover:text-primary">
                    <Image className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onShare(verse)} className="p-1 text-muted-foreground hover:text-primary">
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete(verse.id)} className="p-1 text-muted-foreground hover:text-destructive">
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
                  <button onClick={() => onSaveNote(verse.id)} className="p-1 text-primary hover:text-primary/80">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={onCancelEdit} className="p-1 text-muted-foreground hover:text-foreground">
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
  );
}
