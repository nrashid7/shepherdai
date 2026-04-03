import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KeyboardEvent } from "react";

type ChatComposerProps = {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
};

export function ChatComposer({ input, isLoading, onInputChange, onSend, onKeyDown }: ChatComposerProps) {
  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-end gap-3 rounded-xl border border-border bg-card p-2 shadow-card">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Share what's on your heart..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            onClick={onSend}
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
  );
}
