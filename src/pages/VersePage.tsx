import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Bookmark, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CrossRef {
  reference: string;
  text: string;
  connection: string;
}

interface SurroundingVerse {
  reference: string;
  text: string;
}

interface VerseContext {
  reference: string;
  verse_text: string;
  surrounding_passage: SurroundingVerse[];
  explanation: string;
  cross_references: CrossRef[];
  study_note: string;
  book_context: string;
}

const VersePage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const [data, setData] = useState<VerseContext | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (ref) fetchContext();
  }, [ref]);

  const fetchContext = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verse-context`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ reference: ref }),
      });
      if (!resp.ok) throw new Error("Failed to load verse context");
      setData(await resp.json());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !data) return;
    await supabase.from("saved_verses").insert({
      user_id: user.id,
      verse_reference: data.reference,
      verse_text: data.verse_text,
    });
    toast.success(`Saved ${data.reference}`);
  };

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
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h1 className="font-display text-2xl font-bold text-foreground">{data.reference}</h1>
                </div>
                {user && (
                  <Button onClick={handleSave} variant="ghost" size="sm" className="text-primary">
                    <Bookmark className="mr-1 h-4 w-4" /> Save
                  </Button>
                )}
              </div>
              <p className="font-display text-xl italic leading-relaxed text-foreground">
                "{data.verse_text}"
              </p>
            </div>

            {/* Book Context */}
            {data.book_context && (
              <div className="rounded-lg border border-border bg-secondary/50 p-5">
                <h2 className="mb-2 font-display text-base font-semibold text-foreground">Book Context</h2>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{data.book_context}</p>
              </div>
            )}

            {/* Surrounding Passage */}
            {data.surrounding_passage?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Surrounding Passage</h2>
                <div className="space-y-2">
                  {data.surrounding_passage.map((v, i) => (
                    <p key={i} className={`font-body text-sm leading-relaxed ${v.reference === data.reference ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      <span className="mr-1 font-medium text-primary">{v.reference}</span> {v.text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            {data.explanation && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Explanation</h2>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{data.explanation}</p>
              </div>
            )}

            {/* Cross References */}
            {data.cross_references?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Cross References</h2>
                <div className="space-y-4">
                  {data.cross_references.map((cr, i) => (
                    <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <Link
                        to={`/verse?ref=${encodeURIComponent(cr.reference)}`}
                        className="mb-1 inline-flex items-center gap-1 font-display text-sm font-semibold text-primary hover:underline"
                      >
                        {cr.reference} <ExternalLink className="h-3 w-3" />
                      </Link>
                      <p className="font-body text-sm italic text-muted-foreground">"{cr.text}"</p>
                      <p className="mt-1 font-body text-xs text-muted-foreground">{cr.connection}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Note */}
            {data.study_note && (
              <div className="rounded-xl border border-border bg-secondary/50 p-6">
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Study Note & Application</h2>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{data.study_note}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <p className="py-20 text-center font-body text-muted-foreground">Failed to load verse context.</p>
        )}
      </div>
    </div>
  );
};

export default VersePage;
