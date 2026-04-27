import { Component, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { analytics } from "@/lib/analytics";

/**
 * UpgradeWallBoundary
 * -------------------
 * Render-safety wrapper around <UpgradeWall>. Solves three problems that the
 * raw modal can't solve on its own:
 *
 * 1. **First-paint flash.** UpgradeWall mounts a portal, traps focus, and
 *    starts an animation in the same frame. On low-end devices (and some
 *    iOS WebViews coming back from background) that frame can drop, leaving
 *    the user looking at a half-rendered backdrop with no visible affordance.
 *    We show a tiny portal-based loading state for ~150ms before mounting
 *    the real wall so the first frame the user sees is always coherent.
 *
 * 2. **Render failures.** Real-world reports include lazy-loaded chunk
 *    failures (Browser plugin import on iOS Safari restore), DOM-portal
 *    crashes, and prop-shape mismatches from feature flags arriving late.
 *    A React error boundary catches those and offers a **Try again** button
 *    instead of a blank screen / dismissed gate the user paid attention to.
 *
 * 3. **Recovery without losing intent.** When retry is pressed we re-key
 *    the inner subtree to force a clean remount of <UpgradeWall>. The user
 *    keeps the same gate/tier context — they don't have to re-tap the
 *    locked feature to get back to the upgrade conversation.
 *
 * The wrapper is intentionally additive: callers keep passing the exact
 * same props as before. `onDismiss` is also called when the user taps
 * "Dismiss" in the error fallback, so funnel math stays consistent.
 */

interface UpgradeWallBoundaryProps {
  /** The wall (or wall-like) element to render. */
  children: ReactNode;
  /** Called when the user dismisses from any state (loading, error, or modal). */
  onDismiss: () => void;
  /**
   * Optional gate/tier — only used for analytics tagging on render failure.
   * Defaults match UpgradeWall's "unknown" sentinel so the funnel stays
   * complete even when callers don't thread these.
   */
  gate?: string;
  tier?: string;
  /**
   * Loading-state warmup duration in ms. Set to 0 to disable the warmup
   * (useful in tests). Default 150ms — long enough to cover one dropped
   * frame on low-end devices, short enough to feel instant.
   */
  warmupMs?: number;
}

/**
 * Inner class component — React error boundaries MUST be class components.
 * We keep it private and let the public hook-based wrapper own loading state.
 */
interface InnerBoundaryProps {
  children: ReactNode;
  onError: (err: Error) => void;
  onDismiss: () => void;
  /** Render-key bump from parent forces a clean remount on retry. */
  resetKey: number;
  onRetry: () => void;
}
interface InnerBoundaryState {
  error: Error | null;
}
class InnerBoundary extends Component<InnerBoundaryProps, InnerBoundaryState> {
  state: InnerBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): InnerBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Surface to analytics so we can see render-failure rate per session.
    // We deliberately do NOT call console.error here — React already does,
    // and double-logging makes Sentry breadcrumbs noisy.
    this.props.onError(error);
  }

  /**
   * When the parent bumps `resetKey`, drop the cached error so the next
   * render attempts the children again. This is the retry mechanism.
   */
  componentDidUpdate(prevProps: InnerBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <UpgradeWallErrorFallback
          onRetry={this.props.onRetry}
          onDismiss={this.props.onDismiss}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * Loading and error fallbacks live in portals so they overlay the rest of
 * the app the same way <UpgradeWall> does. Same z-index, same backdrop, so
 * the visual transition between loading → modal → (retry) is seamless.
 */
function PortalOverlay({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      // Aria roles intentionally omitted on this transient layer — the real
      // dialog (or the error fallback) provides the labelled role="dialog".
    >
      {children}
    </div>,
    document.body
  );
}

function UpgradeWallLoading() {
  return (
    <PortalOverlay>
      <div
        className="bg-card rounded-xl max-w-[420px] w-full p-6 shadow-2xl flex items-center gap-3"
        style={{ borderLeft: "4px solid #0d3b5e" }}
        role="status"
        aria-live="polite"
        aria-label="Loading upgrade options"
      >
        <Loader2
          className="h-5 w-5 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-sm text-muted-foreground">
          Loading upgrade options…
        </span>
      </div>
    </PortalOverlay>
  );
}

interface ErrorFallbackProps {
  onRetry: () => void;
  onDismiss: () => void;
}
function UpgradeWallErrorFallback({ onRetry, onDismiss }: ErrorFallbackProps) {
  // Mirror the main modal's focus contract: capture origin on mount, restore
  // on unmount, initial focus on the primary action so a stray Enter/Space
  // means "retry" (the recoverable choice), not "dismiss".
  const retryBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = captureFocusOrigin();
    retryBtnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      const main =
        typeof document !== "undefined"
          ? (document.querySelector<HTMLElement>("main") ??
            (document.body as HTMLElement | null))
          : null;
      if (main && main.tabIndex < 0) main.tabIndex = -1;
      restoreFocus({
        auto: previouslyFocused.current,
        bodyFallback: main,
      });
    };
    // We intentionally don't depend on onDismiss — the latest is read via
    // the closure on each keypress. Re-binding listeners on every parent
    // re-render would be wasteful here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PortalOverlay>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="upgrade-wall-error-title"
        aria-describedby="upgrade-wall-error-body"
        className="bg-card rounded-xl max-w-[420px] w-full overflow-hidden shadow-2xl"
        style={{ borderLeft: "4px solid #0d3b5e" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-[22px] space-y-[18px]">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="h-5 w-5 text-amber-500 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-1.5">
              <h3
                id="upgrade-wall-error-title"
                className="font-semibold text-base text-foreground leading-tight"
              >
                Couldn't load upgrade options
              </h3>
              <p
                id="upgrade-wall-error-body"
                className="text-sm text-muted-foreground leading-relaxed"
              >
                Something went wrong showing the upgrade screen. Check your
                connection and try again.
              </p>
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <button
              ref={retryBtnRef}
              onClick={onRetry}
              className="w-full py-3 rounded-lg font-semibold text-sm text-white cursor-pointer border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ background: "#0d3b5e" }}
            >
              Try again
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-lg font-medium text-sm text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </PortalOverlay>
  );
}

export function UpgradeWallBoundary({
  children,
  onDismiss,
  gate = "unknown",
  tier = "unknown",
  warmupMs = 150,
}: UpgradeWallBoundaryProps) {
  // Phase 1 — brief loading state so the first frame is never half-rendered.
  // We still call onDismiss / restore focus correctly if the parent unmounts
  // us during the warmup window: the inner Boundary just never gets a chance
  // to render, which is fine.
  const [warm, setWarm] = useState(warmupMs <= 0);
  useEffect(() => {
    if (warmupMs <= 0) return;
    const t = window.setTimeout(() => setWarm(true), warmupMs);
    return () => window.clearTimeout(t);
  }, [warmupMs]);

  // Retry mechanism: bumping resetKey triggers InnerBoundary to clear its
  // captured error and re-render `children`. We also briefly re-enter the
  // loading state on retry so the user sees the system "doing something" —
  // an instant flicker between error → modal feels broken.
  const [resetKey, setResetKey] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const handleRetry = () => {
    analytics.upgradeWallCtaClicked(`${gate}_retry`, tier);
    setRetrying(true);
    setResetKey((k) => k + 1);
    // Same warmup as initial mount; gives any lazy chunks a chance to load
    // before we try to render again.
    window.setTimeout(() => setRetrying(false), Math.max(warmupMs, 100));
  };

  const handleError = (err: Error) => {
    // Funnel: tag this as a special dismissal cause so the dashboard can
    // separate "user changed their mind" from "we failed to render".
    analytics.upgradeWallDismissed(`${gate}_render_error`, tier);
    // Best-effort breadcrumb for Sentry. Avoid a hard import so this file
    // stays cheap to load on the marketing site.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      w.Sentry?.captureException?.(err, {
        tags: { component: "UpgradeWall", gate, tier },
      });
    } catch {
      /* never let analytics swallow a render error */
    }
  };

  if (!warm || retrying) return <UpgradeWallLoading />;

  return (
    <InnerBoundary
      resetKey={resetKey}
      onError={handleError}
      onRetry={handleRetry}
      onDismiss={onDismiss}
    >
      {children}
    </InnerBoundary>
  );
}
