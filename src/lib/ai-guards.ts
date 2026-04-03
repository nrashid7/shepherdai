import type { DevotionalResponse, PrayerResponse } from "@/types/ai";
import type { VerseContextResponse } from "@/types/bible";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isObject(value) ? value : {};
}

export function toPrayerResponse(value: unknown): PrayerResponse {
  if (!isObject(value)) throw new Error("Malformed prayer response");
  if (!Array.isArray(value.supportingScriptures)) throw new Error("Malformed prayer response");
  return {
    topic: String(value.topic || ""),
    emotion: value.emotion == null ? null : String(value.emotion),
    supportingScriptures: value.supportingScriptures.map((v) => ({
      reference: String(asRecord(v).reference || ""),
      text: String(asRecord(v).text || ""),
      theme: String(asRecord(v).theme || ""),
    })),
    prayer: String(value.prayer || ""),
    encouragement: String(value.encouragement || ""),
  };
}

export function toDevotionalResponse(value: unknown): DevotionalResponse {
  if (!isObject(value) || !Array.isArray(value.days)) throw new Error("Malformed devotional response");
  if (value.days.length === 0) throw new Error("Malformed devotional response");
  return {
    topic: String(value.topic || ""),
    days: value.days.map((d) => {
      const rec = asRecord(d);
      const primary = asRecord(rec.primaryVerse);
      const day = Number(rec.day || 0);
      const title = String(rec.title || "");
      const theme = String(rec.theme || "");
      const primaryReference = String(primary.reference || "");
      const primaryText = String(primary.text || "");
      const reflection = String(rec.reflection || "");
      const actionStep = String(rec.actionStep || "");
      const prayer = String(rec.prayer || "");

      if (!title || !primaryReference || !primaryText || !reflection || !actionStep || !prayer) {
        throw new Error("Malformed devotional response");
      }

      return {
        day,
        title,
        theme,
        primaryVerse: { reference: primaryReference, text: primaryText },
        supportingVerses: Array.isArray(rec.supportingVerses)
          ? (rec.supportingVerses as unknown[]).map((s) => ({
            reference: String(asRecord(s).reference || ""),
            text: String(asRecord(s).text || ""),
          }))
          : [],
        reflection,
        actionStep,
        prayer,
      };
    }),
  };
}

export function toVerseContextResponse(value: unknown): VerseContextResponse {
  if (!isObject(value)) throw new Error("Malformed verse-context response");
  return {
    reference: String(value.reference || ""),
    verseText: String(value.verseText || ""),
    surroundingPassage: Array.isArray(value.surroundingPassage)
      ? value.surroundingPassage.map((v) => ({
        verse: Number(asRecord(v).verse || 0),
        text: String(asRecord(v).text || ""),
      }))
      : [],
    crossReferences: Array.isArray(value.crossReferences)
      ? value.crossReferences.map((v) => ({
        reference: String(asRecord(v).reference || ""),
        text: String(asRecord(v).text || ""),
        reason: String(asRecord(v).reason || ""),
      }))
      : [],
    studyNotes: Array.isArray(value.studyNotes)
      ? value.studyNotes.map((v) => ({
        source: String(asRecord(v).source || ""),
        note: String(asRecord(v).note || ""),
      }))
      : [],
    bookContext: String(value.bookContext || ""),
    explanation: String(value.explanation || ""),
    lifeApplication: String(value.lifeApplication || ""),
    relatedThemes: Array.isArray(value.relatedThemes) ? value.relatedThemes.map((t) => String(t)) : [],
  };
}
