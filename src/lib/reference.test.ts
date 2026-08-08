import { describe, expect, it } from "vitest";
import { parseReference } from "../../supabase/functions/_shared/reference";

describe("parseReference", () => {
  it("parses a single verse without range fields", () => {
    expect(parseReference("John 3:16")).toEqual({
      book: "John",
      chapter: 3,
      verse: 16,
      raw: "John 3:16",
    });
  });

  it("parses a same-chapter range", () => {
    expect(parseReference("Isaiah 9:6-7")).toMatchObject({
      book: "Isaiah",
      chapter: 9,
      verse: 6,
      endChapter: 9,
      endVerse: 7,
    });
  });

  it("parses a cross-chapter range", () => {
    expect(parseReference("John 3:36-4:2")).toMatchObject({
      chapter: 3,
      verse: 36,
      endChapter: 4,
      endVerse: 2,
    });
  });

  it.each(["John 0:1", "John 3:0", "John 3:16-15", "John 4:2-3:36"])(
    "rejects invalid reference %s",
    (reference) => expect(() => parseReference(reference)).toThrow(),
  );
});
