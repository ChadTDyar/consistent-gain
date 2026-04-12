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
  streakRepairPreview?: boolean;
}

export function UpgradeWall({
  headline,
  body,
  cta,
  accentColor = "#0d3b5e",
  onUpgrade,
  onDismiss,
  coachPreview = false,
  streakRepairPreview = false,
}: Props) {
  const isProCta = cta.toLowerCase().includes("pro");

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
            className="absolute top-[10px] right-[10px] text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="font-semibold text-base text-foreground leading-tight pr-12">
            {headline}
          </h3>
        </div>

        <div className="px-[22px] pb-[22px] pt-3 space-y-[18px]">
          <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>

          {streakRepairPreview && (
            <div className="space-y-1.5">
              <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground font-semibold">
                This is what Streak Repair looks like
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-foreground leading-relaxed">
                  "You missed Tuesday. Your streak is safe until Thursday. 48 hours to pick it back up."
                </p>
              </div>
            </div>
          )}

          {coachPreview && (
            <div className="space-y-1.5">
              <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground font-semibold">
                What AI Coach does
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-semibold text-primary">Coach:</span>{" "}
                  "You've skipped your morning stretch three Mondays in a row. What happens on Mondays?"
                </p>
                <div className="text-xs text-muted-foreground leading-relaxed blur-sm select-none">
                  User response and coach follow-up...
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onUpgrade}
            className="block w-full py-3 rounded-lg font-bold text-sm text-white cursor-pointer border-none"
            style={{ background: accentColor }}
          >
            🔒 {cta}
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
