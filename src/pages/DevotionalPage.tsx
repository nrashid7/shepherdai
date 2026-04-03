import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2, ChevronDown, ChevronUp, Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useDevotionalGenerator } from "@/hooks/useDevotionalGenerator";

const suggestedTopics = ["Anxiety", "Hope", "Forgiveness", "Patience", "Love", "Faith", "Courage", "Gratitude"];

const DevotionalPage = () => {
  const [showSaved, setShowSaved] = useState(false);
  const { user } = useAuth();
  const {
    topic,
    setTopic,
    days,
    setDays,
    devotional,
    loading,
    expandedDay,
    setExpandedDay,
    savedDevotionals,
    handleGenerate,
    handleSave,
    loadDevotional,
  } = useDevotionalGenerator();

  useEffect(() => {
    document.title = "Devotional Generator — Shepherd AI";
  }, [user]);
  const handleLoadDevotional = (saved: (typeof savedDevotionals)[number]) => {
    loadDevotional(saved);
    setShowSaved(false);
  };

  return (
    <div className="min-h-screen pb-20 pt-16 md:pb-0">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div className="mb-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold shadow-soft">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Devotional Generator</h1>
          <p className="font-body text-muted-foreground">Create a personalized multi-day devotional on any topic.</p>
        </motion.div>

        {/* Saved Devotionals Toggle */}
        {user && savedDevotionals.length > 0 && (
          <div className="mb-6 text-center">
            <button onClick={() => setShowSaved(!showSaved)} className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary hover:underline">
              <Clock className="h-4 w-4" />
              {showSaved ? "Hide" : "View"} Saved Devotionals ({savedDevotionals.length})
            </button>
          </div>
        )}

        <AnimatePresence>
          {showSaved && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-card">
                {savedDevotionals.map((s) => (
                  <button key={s.id} onClick={() => handleLoadDevotional(s)} className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 text-left transition-all hover:border-primary/30">
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground">{s.topic}</p>
                      <p className="font-body text-xs text-muted-foreground">{s.days_count} days · {format(new Date(s.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <motion.div className="mb-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex gap-3">
            <Input
              placeholder="Enter a topic (e.g., anxiety, hope, forgiveness)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="bg-card border-border"
            />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-border bg-card px-3 py-2 font-body text-sm text-foreground"
            >
              {[3, 5, 7].map((d) => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
          <Button onClick={() => handleGenerate()} disabled={!topic.trim() || loading} className="w-full gradient-gold border-0 text-primary-foreground shadow-soft hover:opacity-90">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Devotional"}
          </Button>
        </motion.div>

        {/* Suggested Topics */}
        {devotional.length === 0 && !loading && (
          <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <p className="mb-3 text-center font-body text-sm text-muted-foreground">Or choose a topic:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedTopics.map((t) => (
                <button key={t} onClick={() => { setTopic(t); handleGenerate(t); }} className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground shadow-card transition-all hover:border-primary/30 hover:shadow-soft">
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-body text-sm">Crafting your devotional...</span>
          </motion.div>
        )}

        {/* Save Button */}
        {devotional.length > 0 && !loading && user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex justify-end">
            <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
              <Save className="h-4 w-4" /> Save Devotional
            </Button>
          </motion.div>
        )}

        {/* Devotional Days */}
        <AnimatePresence>
          {devotional.length > 0 && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {devotional.map((day) => {
                const isExpanded = expandedDay === day.day;
                return (
                  <motion.div key={day.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: day.day * 0.05 }} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                    <button onClick={() => setExpandedDay(isExpanded ? null : day.day)} className="flex w-full items-center justify-between p-5 text-left">
                      <div>
                        <span className="font-body text-xs font-medium uppercase tracking-wider text-primary">Day {day.day}</span>
                        <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{day.title}</h3>
                        <p className="font-body text-xs text-muted-foreground">{day.primaryVerse.reference}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="space-y-4 border-t border-border px-5 pb-5 pt-4">
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                              <p className="mb-1 font-display text-sm font-semibold text-primary">{day.primaryVerse.reference}</p>
                              <p className="font-display italic text-foreground">"{day.primaryVerse.text}"</p>
                            </div>
                            {day.supportingVerses.length > 0 && (
                              <div>
                                <h4 className="mb-2 font-display text-sm font-semibold text-foreground">Supporting Verses</h4>
                                <div className="space-y-1">
                                  {day.supportingVerses.map((s) => (
                                    <p key={s.reference} className="font-body text-sm text-muted-foreground">
                                      <span className="font-medium text-primary">{s.reference}</span> — "{s.text}"
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="mb-2 font-display text-sm font-semibold text-foreground">Reflection</h4>
                              <p className="font-body text-sm leading-relaxed text-muted-foreground">{day.reflection}</p>
                            </div>
                            <div className="rounded-lg bg-secondary/50 p-4">
                              <h4 className="mb-1 font-display text-sm font-semibold text-foreground">Action Step</h4>
                              <p className="font-body text-sm text-muted-foreground">{day.actionStep}</p>
                            </div>
                            <div>
                              <h4 className="mb-2 font-display text-sm font-semibold text-foreground">Prayer</h4>
                              <p className="font-body text-sm italic text-muted-foreground">{day.prayer}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DevotionalPage;
