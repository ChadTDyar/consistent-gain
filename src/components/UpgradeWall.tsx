import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  headline: string;
  body: string;
  cta: string;
  accentColor?: string;
  onUpgrade: () => void;
  onDismiss: () => void;
  coachPreview?: boolean;
}

export function UpgradeWall({
  headline,
  body,
  cta,
  accentColor = "#0d3b5e",
  onUpgrade,
  onDismiss,
  coachPreview = false,
}: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl max-w-[420px] w-full overflow-hidden shadow-2xl"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div className="p-[22px] pb-0 relative">
          <button
            onClick={onDismiss}
            className="absolute top-[14px] right-[14px] text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="font-semibold text-base text-foreground leading-tight pr-5">
            {headline}
          </h3>
        </div>

        <div className="px-[22px] pb-[22px] pt-3 space-y-[18px]">
          <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>

          {coachPreview && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-semibold text-primary">Coach:</span>{" "}
                "You've skipped your morning stretch three Mondays in a row. What's different about Mondays for you?"
              </p>
              <div className="text-xs text-muted-foreground leading-relaxed blur-sm select-none">
                User response and coach follow-up...
              </div>
            </div>
          )}

          <button
            onClick={onUpgrade}
            className="block w-full py-3 rounded-lg font-bold text-sm text-white cursor-pointer border-none"
            style={{ background: accentColor }}
          >
            {cta}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Cancel anytime.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
