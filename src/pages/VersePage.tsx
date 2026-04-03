import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useVerseLookup } from "@/hooks/useVerseLookup";
import { VerseHeader } from "@/components/verse/VerseHeader";
import { PassageViewer } from "@/components/verse/PassageViewer";
import { CrossReferenceList } from "@/components/verse/CrossReferenceList";
import { StudyNotesPanel } from "@/components/verse/StudyNotesPanel";

const VersePage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const { data, loading, canSave, handleSave } = useVerseLookup(ref);
  const [bookChapter, verseStr] = ref.split(":");
  const highlightVerse = Number(verseStr || "0");

  if (!ref) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <p className="font-body text-muted-foreground">No verse reference provided.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Link to="/chat" className="mb-6 inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Chat
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 font-body text-sm text-muted-foreground">Loading verse context…</span>
          </div>
        ) : data ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Main Verse */}
            <div>
              <VerseHeader reference={data.reference} canSave={canSave} onSave={handleSave} />
              <p className="mt-3 font-display text-xl italic leading-relaxed text-foreground">"{data.verseText}"</p>
            </div>

            {/* Book Context */}
            {data.bookContext && (
              <div className="rounded-lg border border-border bg-secondary/50 p-5">
                <h2 className="mb-2 font-display text-base font-semibold text-foreground">Book Context</h2>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{data.bookContext}</p>
              </div>
            )}

            {/* Surrounding Passage */}
            <PassageViewer surroundingPassage={data.surroundingPassage} bookChapter={bookChapter} highlightVerse={highlightVerse} />

            {/* Explanation */}
            {data.explanation && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Explanation</h2>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{data.explanation}</p>
              </div>
            )}

            {data.lifeApplication && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Life Application</h2>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{data.lifeApplication}</p>
              </div>
            )}

            {/* Cross References */}
            <CrossReferenceList crossReferences={data.crossReferences} />

            {/* Study Note */}
            <StudyNotesPanel studyNotes={data.studyNotes} />
          </motion.div>
        ) : (
          <p className="py-20 text-center font-body text-muted-foreground">Failed to load verse context.</p>
        )}
      </div>
    </div>
  );
};

export default VersePage;
