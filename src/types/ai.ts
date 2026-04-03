import type { SupportingScripture } from "./bible";

export type ChatRole = "user" | "assistant";

export interface ChatMessageInput {
  role: ChatRole;
  content: string;
}

export interface PrayerResponse {
  topic: string;
  emotion: string | null;
  supportingScriptures: SupportingScripture[];
  prayer: string;
  encouragement: string;
}

export interface DevotionalDay {
  day: number;
  title: string;
  theme: string;
  primaryVerse: { reference: string; text: string };
  supportingVerses: Array<{ reference: string; text: string }>;
  reflection: string;
  actionStep: string;
  prayer: string;
}

export interface DevotionalResponse {
  topic: string;
  days: DevotionalDay[];
}
