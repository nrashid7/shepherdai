import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Bookmark, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { extractVerseRefs, extractThemes, upsertMemories } from "@/lib/memories";
import { CrisisBanner } from "@/components/CrisisBanner";
import type { ChatMemoryContext } from "@/types/memory";
import { saveVerseIfNew } from "@/lib/saved-verses";
import { useChatSession } from "@/hooks/useChatSession";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessageList } from "@/components/chat/ChatMessageList";

const quickPrompts = [
  "I feel anxious about the future",
  "I'm struggling with forgiveness",
  "I need guidance about a decision",
  "Help me understand suffering",
  "I want to pray",
  "I'm feeling grateful today",
];

const ChatPage = () => {
  const [memoryHint, setMemoryHint] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPromptHandled = useRef(false);
  const [userMemories, setUserMemories] = useState<ChatMemoryContext[]>([]);

  const {
    messages,
    input,
    setInput,
    isLoading,
    showCrisisBanner,
    setShowCrisisBanner,
    sendMessage,
    abort,
  } = useChatSession({
    userMemories,
    onConversationComplete: async (userMessage, assistantResponse) => {
      await saveConversation(userMessage, assistantResponse);
    },
    onError: (message) => toast.error(message),
  });

  useEffect(() => {
    document.title = "Chat — Shepherd AI";
    return () => {
      abort();
    };
  }, []);

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
      sendMessage(prompt);
    }
  }, [searchParams]);

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
      const { error } = await supabase.from("conversations").insert({
        user_id: user.id,
        message: userMsg,
        response,
        themes,
      });
      if (error) {
        console.error("Failed to save conversation:", error);
      }
      await upsertMemories(user.id, userMsg, response, {
        citedVerses: extractVerseRefs(response),
        sourceType: "chat_stream",
      });
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
      let verseText = text;
      if (!verseText) {
        const refMatch = reference.match(/^([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+):(\d+)/);
        if (refMatch) {
          const { data: dbVerse } = await supabase
            .from("bible_verses")
            .select("text")
            .ilike("book", refMatch[1])
            .eq("chapter", parseInt(refMatch[2], 10))
            .eq("verse_number", parseInt(refMatch[3], 10))
            .limit(1)
            .maybeSingle();
          if (dbVerse?.text) {
            verseText = dbVerse.text;
          }
        }
        if (!verseText) {
          verseText = reference;
          toast.info("Verse text couldn't be loaded — try adding a note with the text");
        }
      }

      const saved = await saveVerseIfNew({
        userId: user.id,
        reference,
        text: verseText,
      });
      if (saved === "exists") toast.info(`${reference} is already saved`);
      else toast.success(`Saved ${reference}`);
    } catch {
      toast.error("Failed to save verse");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
            const verseMatch = text.match(/^([1-3]?\s?[A-Z][a-z]+(?:\s[a-zA-Z]+)*\s\d+:\d+(?:-\d+)?)$/);
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
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground shadow-card transition-all hover:border-primary/30 hover:shadow-soft"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            <ChatMessageList messages={messages} isLoading={isLoading} renderAssistantContent={renderAssistantContent} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatComposer
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={() => sendMessage()}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ChatPage;
