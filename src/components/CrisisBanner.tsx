import { AlertTriangle, X } from "lucide-react";

export function CrisisBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-destructive/30 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="font-display text-sm font-semibold text-foreground">
            You're not alone. Help is available.
          </p>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            If you're in crisis, please reach out to someone who can help:
          </p>
          <ul className="mt-2 space-y-1 font-body text-sm text-foreground">
            <li>
              <strong>988 Suicide & Crisis Lifeline:</strong>{" "}
              <a href="tel:988" className="text-primary underline">Call or text 988</a>
            </li>
            <li>
              <strong>Crisis Text Line:</strong> Text <strong>HOME</strong> to{" "}
              <a href="sms:741741" className="text-primary underline">741741</a>
            </li>
            <li>Talk to a trusted friend, pastor, or family member.</li>
          </ul>
        </div>
        <button onClick={onDismiss} className="shrink-0 p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
