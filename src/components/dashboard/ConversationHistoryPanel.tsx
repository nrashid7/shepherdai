import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";
import type { ConversationEntry } from "@/hooks/useDashboardData";

type ConversationHistoryPanelProps = {
  conversations: ConversationEntry[];
  expandedConvo: string | null;
  onToggleConvo: (id: string) => void;
};

export function ConversationHistoryPanel({ conversations, expandedConvo, onToggleConvo }: ConversationHistoryPanelProps) {
  return (
    <motion.div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Conversation History</h2>
      </div>
      {conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((convo) => (
            <div key={convo.id} className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm font-medium text-foreground line-clamp-1">{convo.message}</p>
                <div className="flex items-center gap-2">
                  {convo.themes && convo.themes.length > 0 && (
                    <div className="flex gap-1">
                      {convo.themes.slice(0, 2).map((t) => (
                        <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] font-medium text-primary">{t}</span>
                      ))}
                    </div>
                  )}
                  <span className="shrink-0 font-body text-xs text-muted-foreground">{format(new Date(convo.created_at), "MMM d")}</span>
                </div>
              </div>
              <button onClick={() => onToggleConvo(convo.id)} className="mt-2 font-body text-xs font-medium text-primary hover:underline">
                {expandedConvo === convo.id ? "Hide response" : "View response"}
              </button>
              <AnimatePresence>
                {expandedConvo === convo.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden border-t border-border pt-3">
                    <p className="font-body text-sm leading-relaxed text-muted-foreground whitespace-pre-line line-clamp-[12]">{convo.response}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-sm text-muted-foreground">Start a conversation in Chat to see your history here.</p>
      )}
    </motion.div>
  );
}
