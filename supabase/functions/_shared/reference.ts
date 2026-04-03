import { AppError } from "./errors.ts";

export type ParsedReference = {
  book: string;
  chapter: number;
  verse: number;
  raw: string;
};

const referenceRegex = /^([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+):(\d+)$/;

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
  if (chapter <= 0 || verse <= 0) {
    throw new AppError(400, "invalid_reference", `Invalid verse reference: "${reference}"`);
  }

  return {
    book: normalizeBookName(match[1]),
    chapter,
    verse,
    raw: trimmed,
  };
}

export function toReference(book: string, chapter: number, verse: number): string {
  return `${normalizeBookName(book)} ${chapter}:${verse}`;
}
