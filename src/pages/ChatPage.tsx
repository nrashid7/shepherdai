import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BookOpen, Sparkles, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamChat } from "@/lib/ai";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { extractVerseRefs, extractThemes, upsertMemories } from "@/lib/memories";
import { detectCrisis, CrisisBanner } from "@/components/CrisisBanner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "I feel anxious about the future",
  "I'm struggling with forgiveness",
  "I need guidance about a decision",
  "Help me understand suffering",
  "I want to pray",
  "I'm feeling grateful today",
];

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [memoryHint, setMemoryHint] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPromptHandled = useRef(false);

  useEffect(() => { document.title = "Chat — Shepherd AI"; }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send prompt from query params
  useEffect(() => {
    if (initialPromptHandled.current) return;
    const prompt = searchParams.get("prompt");
    if (prompt) {
      initialPromptHandled.current = true;
      setSearchParams({}, { replace: true });
      handleSend(prompt);
    }
  }, [searchParams]);

  const [userMemories, setUserMemories] = useState<any[]>([]);

  // Load memories for hint + chat context
  useEffect(() => {
    if (user && messages.length === 0) loadMemories();
  }, [user]);

  const loadMemories = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_memories")
      .select("theme, verse_reference, frequency, note")
      .eq("user_id", user.id)
      .order("frequency", { ascending: false })
      .limit(5);
    if (data && data.length > 0) {
      setUserMemories(data);
      const pick = data[Math.floor(Math.random() * data.length)];
      setMemoryHint(`You've explored ${pick.theme} before with ${pick.verse_reference}. It might encourage you today.`);
    }
  };

  const saveConversation = async (userMsg: string, response: string) => {
    if (!user) return;
    try {
      const themes = extractThemes(userMsg);
      await supabase.from("conversations").insert({
        user_id: user.id,
        message: userMsg,
        response,
        themes,
      });
      // Populate spiritual memories
      await upsertMemories(user.id, userMsg, response);
    } catch (e) {
      console.error("Failed to save conversation:", e);
    }
  };

  const handleSaveVerse = async (reference: string, text: string) => {
    if (!user) {
      toast.error("Sign in to save verses");
      return;
    }
    try {
      // Check if already saved to avoid duplicates
      const { data: existing } = await supabase
        .from("saved_verses")
        .select("id")
        .eq("user_id", user.id)
        .eq("verse_reference", reference)
        .limit(1);
      if (existing && existing.length > 0) {
        toast.info(`${reference} is already saved`);
        return;
      }
      await supabase.from("saved_verses").insert({
        user_id: user.id,
        verse_reference: reference,
        verse_text: text,
      });
      toast.success(`Saved ${reference}`);
    } catch {
      toast.error("Failed to save verse");
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    // Crisis detection
    if (detectCrisis(messageText)) {
      setShowCrisisBanner(true);
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const chatMessages = [...messages, userMsg].map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    try {
      await streamChat({
        messages: chatMessages,
        user_memories: userMemories.length > 0 ? userMemories : undefined,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
              );
            }
            return [...prev, { id: `ai-${Date.now()}`, role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => {
          setIsLoading(false);
          saveConversation(messageText, assistantSoFar);
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render verse references as clickable links with save buttons
  const renderAssistantContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          strong: ({ children }) => {
            const text = String(children);
            // Check if this looks like a Bible reference
            const verseMatch = text.match(/^([1-3]?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s\d+:\d+(?:-\d+)?)$/);
            if (verseMatch) {
              const ref = verseMatch[1];
              return (
                <span className="inline-flex items-center gap-1">
                  <Link
                    to={`/verse?ref=${encodeURIComponent(ref)}`}
                    className="font-bold text-primary hover:underline"
                  >
                    {ref}
                    <ExternalLink className="ml-0.5 inline h-3 w-3" />
                  </Link>
                  {user && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveVerse(ref, "");
                      }}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-primary"
                      title="Save verse"
                    >
                      <Bookmark className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            }
            return <strong>{children}</strong>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col pb-16 pt-16 md:pb-0">
      <div className="flex-1 overflow-y-auto">
        {showCrisisBanner && (
          <div className="px-4 pt-4">
            <CrisisBanner onDismiss={() => setShowCrisisBanner(false)} />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-gold shadow-soft">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
                What's on your heart?
              </h2>
              <p className="mb-8 max-w-md font-body text-muted-foreground">
                Share your thoughts, struggles, or questions. I'll guide you with scripture and prayer.
              </p>

              {memoryHint && (
                <div className="mx-auto mb-6 max-w-md rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="font-body text-sm text-primary">
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    {memoryHint}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground shadow-card transition-all hover:border-primary/30 hover:shadow-soft"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="container mx-auto max-w-3xl px-4 py-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 ${msg.role === "user" ? "flex justify-end" : ""}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] rounded-2xl rounded-br-md gradient-gold px-5 py-3 text-primary-foreground shadow-soft">
                      <p className="font-body text-sm">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-gold">
                          <BookOpen className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-display text-sm font-semibold text-foreground">
                          Shepherd AI
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none font-body text-foreground prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-muted-foreground prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground">
                        {renderAssistantContent(msg.content)}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-gold">
                  <BookOpen className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-end gap-3 rounded-xl border border-border bg-card p-2 shadow-card">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your heart..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="gradient-gold border-0 text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center font-body text-xs text-muted-foreground">
            Shepherd AI provides scripture-based guidance. Always verify references with your Bible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
