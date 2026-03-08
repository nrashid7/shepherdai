import { useRef } from "react";
import { toPng } from "html-to-image";
import { Download, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PrayerCardProps {
  verse_reference: string;
  verse_text: string;
  prayer?: string;
  reflection?: string;
  onClose: () => void;
}

export function PrayerCardModal({ verse_reference, verse_text, prayer, reflection, onClose }: PrayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `shepherd-ai-${verse_reference.replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded!");
    } catch {
      toast.error("Failed to generate image");
    }
  };

  const handleShare = async () => {
    const text = `"${verse_text}"\n— ${verse_reference}${prayer ? `\n\n${prayer}` : ""}\n\nShared via Shepherd AI`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* The card to capture */}
        <div
          ref={cardRef}
          className="overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, hsl(36 60% 50%), hsl(36 70% 60%), hsl(40 50% 75%))",
            padding: "2.5rem",
          }}
        >
          <div className="text-center">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest" style={{ color: "hsl(40 33% 98% / 0.7)" }}>
              Shepherd AI
            </p>
            <p className="mb-6 font-serif text-2xl font-bold leading-snug italic" style={{ color: "hsl(40 33% 98%)", fontFamily: "'Playfair Display', Georgia, serif" }}>
              "{verse_text}"
            </p>
            <p className="mb-6 text-sm font-semibold" style={{ color: "hsl(40 33% 98%)" }}>
              — {verse_reference}
            </p>
            {prayer && (
              <p className="text-sm italic leading-relaxed" style={{ color: "hsl(40 33% 98% / 0.85)", fontFamily: "'Inter', sans-serif" }}>
                {prayer.length > 200 ? prayer.slice(0, 200) + "…" : prayer}
              </p>
            )}
            {reflection && !prayer && (
              <p className="text-sm leading-relaxed" style={{ color: "hsl(40 33% 98% / 0.85)", fontFamily: "'Inter', sans-serif" }}>
                {reflection.length > 200 ? reflection.slice(0, 200) + "…" : reflection}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1 gradient-gold border-0 text-primary-foreground">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
