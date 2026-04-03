import { describe, expect, it } from "vitest";
import { extractStructuredMemory, extractThemes, extractVerseRefs } from "./memories";

describe("memory extraction", () => {
  it("extracts themes from user message", () => {
    const themes = extractThemes("I feel anxious and need guidance for a decision.");
    expect(themes).toContain("anxiety");
    expect(themes).toContain("guidance");
  });

  it("extracts bold verse references", () => {
    const verses = extractVerseRefs("Lean on **Proverbs 3:5-6** and **Philippians 4:6-7**.");
    expect(verses).toEqual(["Proverbs 3:5-6", "Philippians 4:6-7"]);
  });

  it("builds structured memory without relying on bold format only", () => {
    const memory = extractStructuredMemory(
      "I'm anxious about my career and want to trust God more.",
      "Remember Philippians 4:6-7 and Proverbs 3:5-6 as you seek peace.",
    );
    expect(memory.themes).toContain("anxiety");
    expect(memory.verses).toContain("Philippians 4:6-7");
    expect(memory.spiritualGoals).toContain("trust God more");
    expect(memory.confidence).toBeGreaterThan(0.2);
  });
});
