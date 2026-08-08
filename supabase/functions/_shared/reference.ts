import { AppError } from "./errors.ts";

export type ParsedReference = {
  book: string;
  chapter: number;
  verse: number;
  endChapter?: number;
  endVerse?: number;
  raw: string;
};

const referenceRegex = /^([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/;

export function normalizeBookName(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function parseReference(reference: string): ParsedReference {
  const trimmed = reference.trim();
  const match = trimmed.match(referenceRegex);
  if (!match) {
    throw new AppError(400, "invalid_reference", `Invalid verse reference: "${reference}"`);
  }

  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  const endChapter = match[5] ? Number(match[4] || match[2]) : undefined;
  const endVerse = match[5] ? Number(match[5]) : undefined;
  const rangeIsReversed = endChapter !== undefined && endVerse !== undefined &&
    (endChapter < chapter || (endChapter === chapter && endVerse < verse));
  if (chapter <= 0 || verse <= 0 || endChapter === 0 || endVerse === 0 || rangeIsReversed) {
    throw new AppError(400, "invalid_reference", `Invalid verse reference: "${reference}"`);
  }

  return {
    book: normalizeBookName(match[1]),
    chapter,
    verse,
    ...(endChapter !== undefined ? { endChapter } : {}),
    ...(endVerse !== undefined ? { endVerse } : {}),
    raw: trimmed,
  };
}

export function toReference(book: string, chapter: number, verse: number): string {
  return `${normalizeBookName(book)} ${chapter}:${verse}`;
}
