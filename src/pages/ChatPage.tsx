import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  verses?: { reference: string; text: string }[];
}

const quickPrompts = [
  "I feel anxious about the future",
  "I'm struggling with forgiveness",
  "I need guidance about a decision",
  "Help me understand suffering",
  "I want to pray",
  "I'm feeling grateful today",
];

// Demo response for now — will be replaced with real AI
const demoResponse: Message = {
  id: "demo-1",
  role: "assistant",
  content: `I hear you, and I want you to know that what you're feeling is valid. God sees your heart and walks with you through every anxious moment.

**Scripture for You:**

> **Isaiah 41:10** — "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."

> **Philippians 4:6-7** — "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."

**Understanding the Passages:**
Isaiah reminds us that God's presence is not conditional on our circumstances. The command "do not fear" is paired with a promise — He will strengthen and uphold you. Paul's letter to the Philippians gives us a practical path: bring your worries to God in prayer, and His peace will guard your heart.

**Cross-Reference:** Psalm 55:22 — "Cast your cares on the Lord and he will sustain you."

**Reflection:** What is one specific worry you can release to God in prayer right now?

**Prayer:**
*Heavenly Father, I bring my anxious thoughts before You. You know every concern weighing on my heart. Strengthen me with Your presence and help me trust in Your plan. Fill me with the peace that surpasses all understanding. In Jesus' name, Amen.* 🙏`,
  verses: [
    {
      reference: "Isaiah 41:10",
      text: "So do not fear, for I am with you; do not be dismayed, for I am your God.",
    },
    {
      reference: "Philippians 4:6-7",
      text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    },
  ],
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { ...demoResponse, id: Date.now().toString() },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col pt-16">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
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
                Share your thoughts, struggles, or questions. I'll guide you with
                scripture and prayer.
              </p>

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
                      <div className="prose prose-sm max-w-none font-body text-foreground">
                        {msg.content.split("\n").map((line, i) => {
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return (
                              <p key={i} className="mb-2 mt-4 font-semibold text-foreground">
                                {line.replace(/\*\*/g, "")}
                              </p>
                            );
                          }
                          if (line.startsWith("> **")) {
                            const parts = line.replace(/^> \*\*/, "").split("**");
                            return (
                              <blockquote
                                key={i}
                                className="my-2 border-l-2 border-primary/40 pl-4"
                              >
                                <span className="font-semibold text-primary">
                                  {parts[0]}
                                </span>
                                <span className="text-muted-foreground">
                                  {parts[1]?.replace(/^ — /, " — ")}
                                </span>
                              </blockquote>
                            );
                          }
                          if (line.startsWith("*") && line.endsWith("*")) {
                            return (
                              <p key={i} className="my-2 italic text-muted-foreground">
                                {line.replace(/^\*|\*$/g, "")}
                              </p>
                            );
                          }
                          if (line.trim() === "") return <br key={i} />;
                          return (
                            <p key={i} className="mb-2 leading-relaxed text-foreground">
                              {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
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

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-end gap-3 rounded-xl border border-border bg-card p-2 shadow-card">
            <textarea
              ref={inputRef}
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
