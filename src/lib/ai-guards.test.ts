import { describe, expect, it } from "vitest";
import { toDevotionalResponse, toPrayerResponse, toVerseContextResponse } from "./ai-guards";

describe("ai guards", () => {
  it("validates and shapes prayer response", () => {
    const result = toPrayerResponse({
      topic: "peace",
      emotion: "anxious",
      supportingScriptures: [{ reference: "Philippians 4:6-7", text: "Be anxious...", theme: "peace" }],
      prayer: "Lord, help me trust You.",
      encouragement: "God is near.",
    });
    expect(result.supportingScriptures[0].reference).toBe("Philippians 4:6-7");
  });

  it("throws on malformed prayer response", () => {
    expect(() => toPrayerResponse({ topic: "x" })).toThrow();
  });

  it("shapes devotional days", () => {
    const result = toDevotionalResponse({
      topic: "hope",
      days: [{
        day: 1,
        title: "Hope in God",
        theme: "hope",
        primaryVerse: { reference: "Romans 15:13", text: "May the God of hope..." },
        supportingVerses: [],
        reflection: "Where do you need hope?",
        actionStep: "Pray 5 minutes.",
        prayer: "God give me hope.",
      }],
    });
    expect(result.days).toHaveLength(1);
  });

  it("provides safe fallbacks for verse context arrays", () => {
    const result = toVerseContextResponse({ reference: "John 3:16", verseText: "For God so loved..." });
    expect(result.surroundingPassage).toEqual([]);
    expect(result.crossReferences).toEqual([]);
  });

  it("normalizes missing optional fields without throwing", () => {
    const result = toDevotionalResponse({
      topic: "hope",
      days: [{
        day: 1,
        title: "Hope",
        theme: "hope",
        primaryVerse: { reference: "Romans 15:13", text: "May the God of hope..." },
        reflection: "Reflection",
        actionStep: "Action",
        prayer: "Prayer",
      }],
    });
    expect(result.days[0].supportingVerses).toEqual([]);
  });

  it("rejects malformed-but-shaped devotional payloads", () => {
    expect(() => toDevotionalResponse({ topic: "x", days: [{}] })).toThrow();
  });
});
