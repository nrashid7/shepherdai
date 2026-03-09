import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Book, ChevronRight, ArrowLeft, Link2, StickyNote, Search, BookOpen, Bookmark, BookmarkCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50, testament: "OT" },
  { name: "Exodus", chapters: 40, testament: "OT" },
  { name: "Leviticus", chapters: 27, testament: "OT" },
  { name: "Numbers", chapters: 36, testament: "OT" },
  { name: "Deuteronomy", chapters: 34, testament: "OT" },
  { name: "Joshua", chapters: 24, testament: "OT" },
  { name: "Judges", chapters: 21, testament: "OT" },
  { name: "Ruth", chapters: 4, testament: "OT" },
  { name: "1 Samuel", chapters: 31, testament: "OT" },
  { name: "2 Samuel", chapters: 24, testament: "OT" },
  { name: "1 Kings", chapters: 22, testament: "OT" },
  { name: "2 Kings", chapters: 25, testament: "OT" },
  { name: "1 Chronicles", chapters: 29, testament: "OT" },
  { name: "2 Chronicles", chapters: 36, testament: "OT" },
  { name: "Ezra", chapters: 10, testament: "OT" },
  { name: "Nehemiah", chapters: 13, testament: "OT" },
  { name: "Esther", chapters: 10, testament: "OT" },
  { name: "Job", chapters: 42, testament: "OT" },
  { name: "Psalm", chapters: 150, testament: "OT" },
  { name: "Proverbs", chapters: 31, testament: "OT" },
  { name: "Ecclesiastes", chapters: 12, testament: "OT" },
  { name: "Song of Solomon", chapters: 8, testament: "OT" },
  { name: "Isaiah", chapters: 66, testament: "OT" },
  { name: "Jeremiah", chapters: 52, testament: "OT" },
  { name: "Lamentations", chapters: 5, testament: "OT" },
  { name: "Ezekiel", chapters: 48, testament: "OT" },
  { name: "Daniel", chapters: 12, testament: "OT" },
  { name: "Hosea", chapters: 14, testament: "OT" },
  { name: "Joel", chapters: 3, testament: "OT" },
  { name: "Amos", chapters: 9, testament: "OT" },
  { name: "Obadiah", chapters: 1, testament: "OT" },
  { name: "Jonah", chapters: 4, testament: "OT" },
  { name: "Micah", chapters: 7, testament: "OT" },
  { name: "Nahum", chapters: 3, testament: "OT" },
  { name: "Habakkuk", chapters: 3, testament: "OT" },
  { name: "Zephaniah", chapters: 3, testament: "OT" },
  { name: "Haggai", chapters: 2, testament: "OT" },
  { name: "Zechariah", chapters: 14, testament: "OT" },
  { name: "Malachi", chapters: 4, testament: "OT" },
  { name: "Matthew", chapters: 28, testament: "NT" },
  { name: "Mark", chapters: 16, testament: "NT" },
  { name: "Luke", chapters: 24, testament: "NT" },
  { name: "John", chapters: 21, testament: "NT" },
  { name: "Acts", chapters: 28, testament: "NT" },
  { name: "Romans", chapters: 16, testament: "NT" },
  { name: "1 Corinthians", chapters: 16, testament: "NT" },
  { name: "2 Corinthians", chapters: 13, testament: "NT" },
  { name: "Galatians", chapters: 6, testament: "NT" },
  { name: "Ephesians", chapters: 6, testament: "NT" },
  { name: "Philippians", chapters: 4, testament: "NT" },
  { name: "Colossians", chapters: 4, testament: "NT" },
  { name: "1 Thessalonians", chapters: 5, testament: "NT" },
  { name: "2 Thessalonians", chapters: 3, testament: "NT" },
  { name: "1 Timothy", chapters: 6, testament: "NT" },
  { name: "2 Timothy", chapters: 4, testament: "NT" },
  { name: "Titus", chapters: 3, testament: "NT" },
  { name: "Philemon", chapters: 1, testament: "NT" },
  { name: "Hebrews", chapters: 13, testament: "NT" },
  { name: "James", chapters: 5, testament: "NT" },
  { name: "1 Peter", chapters: 5, testament: "NT" },
  { name: "2 Peter", chapters: 3, testament: "NT" },
  { name: "1 John", chapters: 5, testament: "NT" },
  { name: "2 John", chapters: 1, testament: "NT" },
  { name: "3 John", chapters: 1, testament: "NT" },
  { name: "Jude", chapters: 1, testament: "NT" },
  { name: "Revelation", chapters: 22, testament: "NT" },
];

type Verse = {
  id: string;
  book: string;
  chapter: number;
  verse_number: number;
  text: string;
};

type CrossRef = {
  from_verse: string;
  to_verse: string;
  weight: number | null;
};

type StudyNote = {
  verse_reference: string;
  note_text: string;
};

const ExplorePage = () => {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [crossRefs, setCrossRefs] = useState<CrossRef[]>([]);
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedVerseRefs, setSavedVerseRefs] = useState<Set<string>>(new Set());
  const [savingVerse, setSavingVerse] = useState(false);
  const [quickJumpQuery, setQuickJumpQuery] = useState("");
  const [pendingVerse, setPendingVerse] = useState<number | null>(null);

  const bookData = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const otBooks = filteredBooks.filter((b) => b.testament === "OT");
  const ntBooks = filteredBooks.filter((b) => b.testament === "NT");

  // Load saved verses for current user
  useEffect(() => {
    if (!user) return;
    const loadSaved = async () => {
      const { data } = await supabase
        .from("saved_verses")
        .select("verse_reference")
        .eq("user_id", user.id);
      setSavedVerseRefs(new Set((data || []).map((d) => d.verse_reference)));
    };
    loadSaved();
  }, [user]);

  // Load chapter verses
  useEffect(() => {
    if (!selectedBook || !selectedChapter) return;
    setLoading(true);
    setSelectedVerse(null);
    setCrossRefs([]);
    setStudyNotes([]);

    const load = async () => {
      const { data } = await supabase
        .from("bible_verses")
        .select("id, book, chapter, verse_number, text")
        .eq("book", selectedBook)
        .eq("chapter", selectedChapter)
        .order("verse_number");
      setVerses(data || []);

      // Load study notes for this chapter
      const { data: notes } = await supabase
        .from("study_notes")
        .select("verse_reference, note_text")
        .like("verse_reference", `${selectedBook} ${selectedChapter}:%`);
      setStudyNotes(notes || []);

      setLoading(false);
    };
    load();
  }, [selectedBook, selectedChapter]);

  // Load cross-references for selected verse
  const loadCrossRefs = useCallback(async (verse: Verse) => {
    setSelectedVerse(verse);
    const ref = `${verse.book} ${verse.chapter}:${verse.verse_number}`;
    const { data } = await supabase
      .from("cross_references")
      .select("from_verse, to_verse, weight")
      .or(`from_verse.eq.${ref},to_verse.eq.${ref}`)
      .order("weight", { ascending: false })
      .limit(20);
    setCrossRefs(data || []);
  }, []);

  // Auto-select verse after quick-jump navigation
  useEffect(() => {
    if (pendingVerse && verses.length > 0 && !loading) {
      const target = verses.find((v) => v.verse_number === pendingVerse);
      if (target) loadCrossRefs(target);
      setPendingVerse(null);
    }
  }, [pendingVerse, verses, loading, loadCrossRefs]);

  const getStudyNoteForVerse = (verseNum: number) =>
    studyNotes.find((n) => n.verse_reference === `${selectedBook} ${selectedChapter}:${verseNum}`);

  const getVerseRef = (verse: Verse) => `${verse.book} ${verse.chapter}:${verse.verse_number}`;

  const isVerseSaved = (verse: Verse) => savedVerseRefs.has(getVerseRef(verse));

  const toggleSaveVerse = async (verse: Verse) => {
    if (!user) {
      toast.error("Sign in to save verses");
      return;
    }
    const ref = getVerseRef(verse);
    setSavingVerse(true);
    try {
      if (savedVerseRefs.has(ref)) {
        await supabase
          .from("saved_verses")
          .delete()
          .eq("user_id", user.id)
          .eq("verse_reference", ref);
        setSavedVerseRefs((prev) => { const next = new Set(prev); next.delete(ref); return next; });
        toast.success("Verse removed from collection");
      } else {
        await supabase.from("saved_verses").insert({
          user_id: user.id,
          verse_reference: ref,
          verse_text: verse.text,
        });
        setSavedVerseRefs((prev) => new Set(prev).add(ref));
        toast.success("Verse saved to collection");
      }
    } catch {
      toast.error("Failed to save verse");
    } finally {
      setSavingVerse(false);
    }
  };

  const parseReference = (input: string): { book: string; chapter: number; verse?: number } | null => {
    const trimmed = input.trim();
    // Match patterns like "John 3:16", "1 Corinthians 13", "Genesis 1:1"
    const match = trimmed.match(/^(\d?\s?[A-Za-z\s]+?)\s+(\d+)(?::(\d+))?$/);
    if (!match) return null;
    const rawBook = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : undefined;
    // Find matching book (case-insensitive)
    const found = BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === rawBook.toLowerCase()
    );
    if (!found || chapter < 1 || chapter > found.chapters) return null;
    return { book: found.name, chapter, verse };
  };

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseReference(quickJumpQuery);
    if (!parsed) {
      toast.error("Invalid reference. Try e.g. \"John 3:16\" or \"Genesis 1\"");
      return;
    }
    setSelectedBook(parsed.book);
    setSelectedChapter(parsed.chapter);
    setPendingVerse(parsed.verse ?? null);
    setQuickJumpQuery("");
  };

  const handleBack = () => {
    if (selectedVerse) {
      setSelectedVerse(null);
      setCrossRefs([]);
    } else if (selectedChapter) {
      setSelectedChapter(null);
      setVerses([]);
      setStudyNotes([]);
    } else {
      setSelectedBook(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 md:pb-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-6">
          {(selectedBook || selectedChapter) && (
            <button
              onClick={handleBack}
              className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {selectedBook
                  ? selectedChapter
                    ? `${selectedBook} ${selectedChapter}`
                    : selectedBook
                  : "Explore Scripture"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedBook
                  ? selectedChapter
                    ? `${verses.length} verses • ${studyNotes.length} study notes`
                    : `${bookData?.chapters} chapters`
                  : "Browse all 66 books of the Bible"}
              </p>
            </div>
          </div>
          {/* Quick Jump */}
          <form onSubmit={handleQuickJump} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Jump to verse… e.g. John 3:16"
                value={quickJumpQuery}
                onChange={(e) => setQuickJumpQuery(e.target.value)}
                className="pl-9 bg-card border-border"
                maxLength={50}
              />
            </div>
            <Button type="submit" size="default" variant="secondary" disabled={!quickJumpQuery.trim()}>
              Go
            </Button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {/* LEVEL 1: Book Selection */}
          {!selectedBook && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>

              {otBooks.length > 0 && (
                <>
                  <h2 className="mb-3 font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-normal">OT</Badge>
                    Old Testament
                  </h2>
                  <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {otBooks.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => setSelectedBook(book.name)}
                        className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{book.name}</p>
                          <p className="text-xs text-muted-foreground">{book.chapters} ch</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {ntBooks.length > 0 && (
                <>
                  <h2 className="mb-3 font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-normal">NT</Badge>
                    New Testament
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {ntBooks.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => setSelectedBook(book.name)}
                        className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{book.name}</p>
                          <p className="text-xs text-muted-foreground">{book.chapters} ch</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* LEVEL 2: Chapter Selection */}
          {selectedBook && !selectedChapter && bookData && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: bookData.chapters }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSelectedChapter(ch)}
                    className="flex h-12 items-center justify-center rounded-lg border border-border bg-card font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-sm"
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* LEVEL 3: Verses + Details */}
          {selectedBook && selectedChapter && (
            <motion.div
              key="verses"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-5 gap-6"
            >
              {/* Verse list */}
              <div className="md:col-span-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse rounded-lg bg-muted h-16" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-1">
                      {verses.map((verse) => {
                        const isSelected = selectedVerse?.id === verse.id;
                        const hasNote = !!getStudyNoteForVerse(verse.verse_number);
                        return (
                          <button
                            key={verse.id}
                            onClick={() => loadCrossRefs(verse)}
                            className={`w-full text-left rounded-lg p-3 transition-all ${
                              isSelected
                                ? "bg-primary/10 border border-primary/30 shadow-sm"
                                : "hover:bg-card border border-transparent"
                            }`}
                          >
                            <div className="flex gap-3">
                              <span className="font-display text-sm font-bold text-primary mt-0.5 flex-shrink-0 w-6 text-right">
                                {verse.verse_number}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm text-foreground leading-relaxed font-body">
                                  {verse.text}
                                </p>
                                {hasNote && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <StickyNote className="h-3 w-3 text-primary/60" />
                                    <span className="text-[10px] text-primary/60 font-medium">Study note available</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Side panel: study notes + cross-references */}
              <div className="md:col-span-2">
                <div className="sticky top-24 space-y-4">
                  {selectedVerse ? (
                    <>
                      {/* Selected verse info */}
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="font-display text-sm font-bold text-primary mb-1">
                          {selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse_number}
                        </p>
                        <p className="text-sm text-foreground italic leading-relaxed">
                          "{selectedVerse.text}"
                        </p>
                        <Button
                          variant={isVerseSaved(selectedVerse) ? "secondary" : "outline"}
                          size="sm"
                          className="w-full mt-3 gap-2"
                          disabled={savingVerse}
                          onClick={() => toggleSaveVerse(selectedVerse)}
                        >
                          {isVerseSaved(selectedVerse) ? (
                            <><BookmarkCheck className="h-4 w-4" /> Saved</>
                          ) : (
                            <><Bookmark className="h-4 w-4" /> Save Verse</>
                          )}
                        </Button>
                      </div>

                      {/* Study note */}
                      {getStudyNoteForVerse(selectedVerse.verse_number) && (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <StickyNote className="h-4 w-4 text-primary" />
                            <h3 className="font-display text-sm font-semibold text-foreground">Study Note</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {getStudyNoteForVerse(selectedVerse.verse_number)?.note_text}
                          </p>
                        </div>
                      )}

                      {/* Cross-references */}
                      <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Link2 className="h-4 w-4 text-primary" />
                          <h3 className="font-display text-sm font-semibold text-foreground">
                            Cross-References
                          </h3>
                          <Badge variant="secondary" className="text-[10px] ml-auto">
                            {crossRefs.length}
                          </Badge>
                        </div>
                        {crossRefs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No cross-references found.</p>
                        ) : (
                          <div className="space-y-2">
                            {crossRefs.map((cr, idx) => {
                              const ref = `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse_number}`;
                              const linkedVerse = cr.from_verse === ref ? cr.to_verse : cr.from_verse;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
                                >
                                  <Book className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                  <span className="text-sm text-foreground font-medium">{linkedVerse}</span>
                                  {cr.weight && cr.weight >= 2 && (
                                    <Badge variant="outline" className="text-[9px] ml-auto px-1.5 py-0">
                                      {cr.weight === 3 ? "Strong" : "Medium"}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                      <Book className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Select a verse to view study notes and cross-references
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExplorePage;
