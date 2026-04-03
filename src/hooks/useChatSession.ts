import { useRef, useState } from "react";
import { streamChat } from "@/lib/ai";
import { detectCrisis } from "@/components/CrisisBanner";
import type { ChatMemoryContext } from "@/types/memory";

export type ChatUiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type UseChatSessionOptions = {
  userMemories: ChatMemoryContext[];
  onConversationComplete: (userMessage: string, assistantResponse: string) => void | Promise<void>;
  onError: (message: string) => void;
};

export function useChatSession(options: UseChatSessionOptions) {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    if (detectCrisis(messageText)) {
      setShowCrisisBanner(true);
    }

    const userMsg: ChatUiMessage = { id: Date.now().toString(), role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let assistantSoFar = "";
    const chatMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      await streamChat({
        messages: chatMessages,
        user_memories: options.userMemories.length > 0 ? options.userMemories : undefined,
        signal: controller.signal,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
            return [...prev, { id: `ai-${Date.now()}`, role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => {
          setIsLoading(false);
        },
      });
      await options.onConversationComplete(messageText, assistantSoFar);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Failed to get response");
      if (err.name !== "AbortError") {
        options.onError(err.message || "Failed to get response");
      }
      setIsLoading(false);
    }
  };

  const abort = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    showCrisisBanner,
    setShowCrisisBanner,
    sendMessage,
    abort,
  };
}
