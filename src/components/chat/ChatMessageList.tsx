import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatMessageListProps = {
  messages: Message[];
  isLoading: boolean;
  renderAssistantContent: (content: string) => ReactNode;
};

export function ChatMessageList({ messages, isLoading, renderAssistantContent }: ChatMessageListProps) {
  return (
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
                  <span className="font-display text-sm font-semibold text-foreground">Shepherd AI</span>
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
    </div>
  );
}
