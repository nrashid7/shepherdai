import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { VerseContextResponse } from "@/types/bible";

export function CrossReferenceList({ crossReferences }: { crossReferences: VerseContextResponse["crossReferences"] }) {
  if (!crossReferences || crossReferences.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Cross References</h2>
      <div className="space-y-4">
        {crossReferences.map((cr, i) => (
          <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
            <Link
              to={`/verse?ref=${encodeURIComponent(cr.reference)}`}
              className="mb-1 inline-flex items-center gap-1 font-display text-sm font-semibold text-primary hover:underline"
            >
              {cr.reference} <ExternalLink className="h-3 w-3" />
            </Link>
            <p className="font-body text-sm italic text-muted-foreground">"{cr.text}"</p>
            <p className="mt-1 font-body text-xs text-muted-foreground">{cr.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

