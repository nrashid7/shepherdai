import type { VerseContextResponse } from "@/types/bible";

export function PassageViewer({
  surroundingPassage,
  bookChapter,
  highlightVerse,
}: {
  surroundingPassage: VerseContextResponse["surroundingPassage"];
  bookChapter: string;
  highlightVerse: number;
}) {
  if (!surroundingPassage || surroundingPassage.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Surrounding Passage</h2>
      <div className="space-y-2">
        {surroundingPassage.map((v, i) => (
          <p
            key={i}
            className={`font-body text-sm leading-relaxed ${
              v.verse === highlightVerse ? "font-semibold text-foreground" : "text-muted-foreground"
            }`}
          >
            <span className="mr-1 font-medium text-primary">
              {bookChapter}:{v.verse}
            </span>{" "}
            {v.text}
          </p>
        ))}
      </div>
    </div>
  );
}

