import { describe, expect, it } from "vitest";
import { parseBibleReference } from "./bible";

describe("parseBibleReference", () => {
  it("parses book chapter verse references", () => {
    expect(parseBibleReference("John 3:16")).toEqual({
      book: "John",
      chapter: 3,
      verse: 16,
    });
  });

  it("parses chapter-only references", () => {
    expect(parseBibleReference("1 Corinthians 13")).toEqual({
      book: "1 Corinthians",
      chapter: 13,
      verse: undefined,
    });
  });

  it("returns null for invalid references", () => {
    expect(parseBibleReference("Unknown 9:9")).toBeNull();
    expect(parseBibleReference("John x:y")).toBeNull();
  });
});
