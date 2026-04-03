import { AppError } from "./errors.ts";

type UnknownRecord = Record<string, unknown>;

function assertObject(value: unknown, code: string, message: string): UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(400, code, message);
  }
  return value as UnknownRecord;
}

function assertString(value: unknown, code: string, message: string, maxLength?: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(400, code, message);
  }
  const trimmed = value.trim();
  if (maxLength && trimmed.length > maxLength) {
    throw new AppError(400, code, message);
  }
  return trimmed;
}

function coerceTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatMemory = { theme: string; verse_reference: string; frequency: number; note?: string | null };

export function parseChatRequest(body: unknown): { messages: ChatMessage[]; user_memories?: ChatMemory[] } {
  const obj = assertObject(body, "invalid_request", "Request body must be an object");
  const messagesRaw = obj.messages;
  if (!Array.isArray(messagesRaw) || messagesRaw.length === 0) {
    throw new AppError(400, "invalid_messages", "messages must be a non-empty array");
  }
  if (messagesRaw.length > 50) {
    throw new AppError(400, "invalid_messages", "Too many messages (max 50)");
  }

  const messages = messagesRaw.map((m, idx) => {
    const msg = assertObject(m, "invalid_messages", `Invalid message at index ${idx}`);
    const role = msg.role;
    if (role !== "user" && role !== "assistant") {
      throw new AppError(400, "invalid_messages", `Invalid role at index ${idx}`);
    }
    return {
      role,
      content: assertString(msg.content, "invalid_messages", `Invalid content at index ${idx}`, 5000),
    };
  });

  const userMemoriesRaw = obj.user_memories;
  const user_memories = Array.isArray(userMemoriesRaw)
    ? userMemoriesRaw
      .filter((m) => m && typeof m === "object")
      .map((m) => {
        const mm = m as UnknownRecord;
        return {
          theme: String(mm.theme || ""),
          verse_reference: String(mm.verse_reference || ""),
          frequency: Number(mm.frequency || 0),
          note: mm.note == null ? null : String(mm.note),
        };
      })
      .filter((m) => m.theme && m.verse_reference && Number.isFinite(m.frequency))
      .slice(0, 10)
    : undefined;

  return { messages, user_memories };
}

export function parsePrayerRequest(body: unknown): { emotion?: string; topic?: string } {
  const obj = assertObject(body, "invalid_request", "Request body must be an object");
  const emotion = obj.emotion != null ? assertString(obj.emotion, "invalid_emotion", "emotion must be a non-empty string (max 100 chars)", 100) : undefined;
  const topic = obj.topic != null ? assertString(obj.topic, "invalid_topic", "topic must be a non-empty string (max 120 chars)", 120) : undefined;

  if (!emotion && !topic) {
    throw new AppError(400, "invalid_request", "Provide emotion or topic");
  }
  return { emotion, topic };
}

export function parseDevotionalRequest(body: unknown): { topic: string; days: number } {
  const obj = assertObject(body, "invalid_request", "Request body must be an object");
  const topic = assertString(obj.topic, "invalid_topic", "topic must be a non-empty string (max 200 chars)", 200);
  const daysValue = obj.days ?? 5;
  const days = Number(daysValue);
  if (!Number.isInteger(days) || days < 1 || days > 14) {
    throw new AppError(400, "invalid_days", "days must be an integer between 1 and 14");
  }
  return { topic, days };
}

export function parseVerseContextRequest(body: unknown): { reference: string } {
  const obj = assertObject(body, "invalid_request", "Request body must be an object");
  const reference = assertString(obj.reference, "invalid_reference", "reference must be a non-empty string (max 100 chars)", 100);
  return { reference };
}

export type VerseContextAiOutput = {
  bookContext: string;
  explanation: string;
  lifeApplication: string;
  relatedThemes: string[];
};

export function validateVerseContextAiOutput(payload: unknown): VerseContextAiOutput {
  const obj = assertObject(payload, "invalid_ai_output", "Invalid verse-context model output");
  const relatedThemes = Array.isArray(obj.relatedThemes)
    ? obj.relatedThemes.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, 10)
    : [];
  return {
    bookContext: coerceTrimmedString(obj.bookContext),
    explanation: coerceTrimmedString(obj.explanation),
    lifeApplication: coerceTrimmedString(obj.lifeApplication),
    relatedThemes,
  };
}

export type PrayerAiOutput = {
  topic?: string;
  emotion?: string;
  prayer: string;
  encouragement: string;
};

export function validatePrayerAiOutput(payload: unknown): PrayerAiOutput {
  const obj = assertObject(payload, "invalid_ai_output", "Invalid prayer model output");
  const prayer = coerceTrimmedString(obj.prayer);
  const encouragement = coerceTrimmedString(obj.encouragement);
  if (!prayer) {
    throw new AppError(500, "invalid_ai_output", "Prayer generation returned malformed output");
  }
  return {
    topic: coerceTrimmedString(obj.topic) || undefined,
    emotion: coerceTrimmedString(obj.emotion) || undefined,
    prayer,
    encouragement,
  };
}

export type DevotionalAiOutputDay = {
  day: number;
  title: string;
  theme: string;
  primaryVerseReference: string;
  supportingVerseReferences?: string[];
  reflection: string;
  actionStep: string;
  prayer: string;
};

export type DevotionalAiOutput = {
  topic?: string;
  days: DevotionalAiOutputDay[];
};

export function validateDevotionalAiOutput(payload: unknown): DevotionalAiOutput {
  const obj = assertObject(payload, "invalid_ai_output", "Invalid devotional model output");
  const daysRaw = obj.days;
  if (!Array.isArray(daysRaw) || daysRaw.length === 0) {
    throw new AppError(500, "invalid_ai_output", "Devotional generation returned malformed output");
  }
  const days = daysRaw
    .filter((d) => d && typeof d === "object" && !Array.isArray(d))
    .map((d) => d as UnknownRecord)
    .map((d) => ({
      day: Number(d.day),
      title: coerceTrimmedString(d.title),
      theme: coerceTrimmedString(d.theme),
      primaryVerseReference: coerceTrimmedString(d.primaryVerseReference),
      supportingVerseReferences: Array.isArray(d.supportingVerseReferences)
        ? d.supportingVerseReferences.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, 8)
        : undefined,
      reflection: coerceTrimmedString(d.reflection),
      actionStep: coerceTrimmedString(d.actionStep),
      prayer: coerceTrimmedString(d.prayer),
    }))
    .filter((d, idx) => {
      if (!Number.isFinite(d.day) || d.day <= 0) d.day = idx + 1;
      return Boolean(d.title && d.reflection && d.actionStep && d.prayer);
    });

  if (days.length === 0) {
    throw new AppError(500, "invalid_ai_output", "Devotional generation returned malformed output");
  }

  return { topic: coerceTrimmedString(obj.topic) || undefined, days };
}
