import { createPortal } from "react-dom";
import { RULES } from "@/constants/value-language";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  headline: string;
  body: string;
  cta: string;
  accentColor?: string;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function UpgradeWall({
  headline,
  body,
  cta,
  accentColor = "#0d3b5e",
  onUpgrade,
  onDismiss,
}: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl max-w-[420px] w-full overflow-hidden shadow-2xl"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground">
            {headline}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          <Button
            onClick={onUpgrade}
            className="w-full font-semibold btn-gradient"
            size="lg"
          >
            {cta}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {RULES.cancel_note}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
