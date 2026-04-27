import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { isIOSNative } from "@/lib/platform";

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
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // Tracks whether the pointer press that started this click began on the
  // backdrop. Prevents accidental dismissal when a user mousedowns inside the
  // panel (e.g. selecting text) and releases on the backdrop.
  const pointerDownOnBackdrop = useRef(false);
  const ios = isIOSNative();

  // Keep onDismiss ref stable so the trap effect can run mount-only.
  // If we depended on onDismiss in the effect deps, parents passing a new
  // function identity each render would tear down the trap and re-capture
  // previouslyFocused.current to the close button (since focus moved into
  // the modal), breaking trigger restoration.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // WCAG 2.4.3 / 2.1.2: Escape-to-dismiss + focus trap + focus restoration.
  // Initial focus policy: the Close (X) button — NOT the Upgrade CTA.
  // Rationale: this modal can open passively when a user taps a gated feature.
  // Focusing the CTA would mean the next Enter/Space keystroke triggers a
  // paywall/checkout the user did not ask for. Focusing Close is the
  // accessibility-safe default and keeps the upgrade action one Tab away.
  //
  // Focus restoration (WCAG 2.4.3 — Focus Order):
  // On open we capture the trigger element from document.activeElement BEFORE
  // moving focus into the modal. On unmount we restore focus to that exact
  // trigger so keyboard users land back where they were. Guards:
  //   - Skip restoration if the trigger is no longer in the DOM (e.g., the
  //     parent rerendered it away).
  //   - Skip if the trigger is <body> (means nothing was meaningfully focused).
  //   - Use preventScroll so restoration doesn't jolt long pages.
  useEffect(() => {
    if (ios) return;
    const trigger = document.activeElement as HTMLElement | null;
    previouslyFocused.current =
      trigger && trigger !== document.body ? trigger : null;
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismissRef.current();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      const target = previouslyFocused.current;
      if (target && target.isConnected && typeof target.focus === "function") {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
    };
  }, [ios]);

  // Apple IAP compliance: never show paid upgrade walls on iOS native builds
  if (ios) return null;

  // Outside-click dismissal (WCAG-safe):
  // - Only dismiss when BOTH pointerdown and pointerup occurred on the backdrop.
  //   This avoids accidental close when a user starts a text selection inside
  //   the panel and drags out, matching Radix/React-Aria dialog behavior.
  // - Keyboard users are unaffected (they use Escape, handled above).
  // - Focus trap is preserved: dismiss simply unmounts the modal; the cleanup
  //   in the focus-trap effect restores focus to the previously focused element.
  const handleBackdropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownOnBackdrop.current = e.target === e.currentTarget;
  };
  const handleBackdropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerDownOnBackdrop.current && e.target === e.currentTarget) {
      onDismiss();
    }
    pointerDownOnBackdrop.current = false;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onPointerDown={handleBackdropPointerDown}
      onPointerUp={handleBackdropPointerUp}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-wall-title"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl max-w-[420px] w-full overflow-hidden shadow-2xl"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div className="p-[22px] pb-0 relative">
          <button
            ref={closeBtnRef}
            onClick={onDismiss}
            className="absolute top-[10px] right-[10px] text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Close upgrade dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <h3 id="upgrade-wall-title" className="font-semibold text-base text-foreground leading-tight pr-12">
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
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-semibold text-muted-foreground">You:</span>{" "}
                  "Meetings start at 8 — I'm rushing."
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-semibold text-primary">Coach:</span>{" "}
                  "Move it to Sunday night, 5 minutes before bed. Want me to set that up?"
                </p>
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
