import { BookOpen, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerseHeader({
  reference,
  canSave,
  onSave,
}: {
  reference: string;
  canSave: boolean;
  onSave: () => void;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">{reference}</h1>
        </div>
        {canSave && (
          <Button onClick={onSave} variant="ghost" size="sm" className="text-primary">
            <Bookmark className="mr-1 h-4 w-4" /> Save
          </Button>
        )}
      </div>
    </div>
  );
}

