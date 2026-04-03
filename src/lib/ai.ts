import type { ChatMessageInput, DevotionalResponse, PrayerResponse } from "@/types/ai";
import type { VerseContextResponse } from "@/types/bible";
import type { ChatMemoryContext } from "@/types/memory";
import { toDevotionalResponse, toPrayerResponse, toVerseContextResponse } from "@/lib/ai-guards";

const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const CHAT_URL = `${FUNCTIONS_BASE_URL}/chat`;

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${FUNCTIONS_BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return resp.json() as Promise<T>;
}

export async function streamChat({
  messages,
  user_memories,
  onDelta,
  onDone,
  signal,
}: {
  messages: ChatMessageInput[];
  user_memories?: ChatMemoryContext[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, user_memories }),
    signal,
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    if (resp.status === 402) throw new Error("Usage limit reached. Please add credits.");
    throw new Error("Failed to start stream");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export async function generatePrayer(input: { emotion?: string; topic?: string }): Promise<PrayerResponse> {
  return toPrayerResponse(await postJson<unknown>("prayer", input));
}

export async function generateDevotional(topic: string, days: number = 5): Promise<DevotionalResponse> {
  return toDevotionalResponse(await postJson<unknown>("devotional", { topic, days }));
}

export async function generateVerseContext(reference: string): Promise<VerseContextResponse> {
  return toVerseContextResponse(await postJson<unknown>("verse-context", { reference }));
}
