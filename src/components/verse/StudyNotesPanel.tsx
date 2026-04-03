import type { VerseContextResponse } from "@/types/bible";

export function StudyNotesPanel({ studyNotes }: { studyNotes: VerseContextResponse["studyNotes"] }) {
  if (!studyNotes || studyNotes.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-6">
      <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Study Note & Application</h2>
      {studyNotes.map((note, idx) => (
        <p key={idx} className="font-body text-sm leading-relaxed text-muted-foreground">
          {note.note}
        </p>
      ))}
    </div>
  );
}

