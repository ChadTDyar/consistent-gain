import { createPortal } from "react-dom";
import React, { useEffect, useRef } from "react";
import { X, ExternalLink, Settings as SettingsIcon, Info } from "lucide-react";
import { isIOSNative } from "@/lib/platform";
import { Capacitor } from "@capacitor/core";
import { analytics } from "@/lib/analytics";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { UpgradeWallBoundary } from "@/components/UpgradeWallBoundary";

// Funnel-tracking taxonomy. Keep these in sync with GA4 / dashboards.
// `gate` identifies the feature that triggered the wall.
// `tier` is what the wall is selling (or 'unknown' when callers haven't
// declared a tier — e.g. legacy call sites).
export type UpgradeWallGate =
  | "coach"
  | "streak_repair"
  | "habit_limit"
  | "partner_lock"
  | "analytics_lock"
  | "history_limit"
  | "unknown";
export type UpgradeWallTier = "pro" | "premium" | "unknown";

interface Props {
  headline: string;
  body: string;
  cta: string;
  accentColor?: string;
  onUpgrade: () => void;
  onDismiss: () => void;
  coachPreview?: boolean;
  streakRepairPreview?: boolean;
  /** Which gated feature triggered this wall. Drives funnel analytics. */
  gate?: UpgradeWallGate;
  /** Which tier this wall is selling. Drives funnel analytics. */
  tier?: UpgradeWallTier;
  /**
   * Explicit element that should receive focus after the modal closes.
   * When provided, this overrides the auto-captured `document.activeElement`.
   *
   * Use this when:
   * - The trigger is unmounted while the modal is open (e.g. a "locked" card
   *   that disappears after upgrade) — pass a stable nearby element so SR/
   *   keyboard users still land somewhere meaningful.
   * - The modal opened programmatically without a click (no real trigger).
   * - You want focus to land on a different button than the one clicked
   *   (e.g. a "Try again" CTA after dismissal).
   *
   * Pass either a React ref or a DOM node. Pass `null` to opt out of focus
   * restoration entirely (rare; only for very deliberate flows).
   */
  returnFocus?: React.RefObject<HTMLElement> | HTMLElement | null;
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
  gate = "unknown",
  tier = "unknown",
  returnFocus,
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

  // Lock background scroll while the web variant is mounted. The iOS variant
  // is rendered by UpgradeWallIOSFallback which manages its own lock — we
  // disable here on iOS to avoid double-locking the body.
  useBodyScrollLock(!ios);

  // One-shot "shown" beacon — fires before any user interaction so the
  // funnel denominator (impressions) matches reality even if the user
  // dismisses in the same animation frame. Variant tag splits web vs the
  // App-Review-safe iOS fallback so we can confirm how often the fallback
  // is actually used in production. Empty deps + ref guard = exactly once
  // per mount, even under React StrictMode double-invocation.
  //
  // We also stamp `mountTimeRef` here (monotonic via performance.now when
  // available, Date.now fallback). The dwell-time companion event
  // `upgrade_wall_timing` measures from this stamp to the terminal action
  // (dismiss or CTA click) so we can identify drop-off windows.
  const shownTrackedRef = useRef(false);
  const mountTimeRef = useRef<number>(0);
  useEffect(() => {
    if (shownTrackedRef.current) return;
    shownTrackedRef.current = true;
    mountTimeRef.current =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    analytics.upgradeWallShown(gate, tier, ios ? "ios_fallback" : "web");
    // gate/tier/ios are stable for a given mount — re-running on prop
    // changes would double-count and corrupt the funnel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Returns ms elapsed since the modal was shown. Returns null if the shown
  // beacon never fired (defensive — should never happen in production).
  const elapsedMs = (): number | null => {
    if (!mountTimeRef.current) return null;
    const now =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    return now - mountTimeRef.current;
  };

  // Funnel-event guards. We MUST fire dismissed XOR cta_clicked exactly once
  // per modal lifetime, never both, never zero.
  // - ctaClickedRef: set when the user clicks the upgrade CTA so subsequent
  //   onDismiss calls (which the parent typically issues to unmount the modal)
  //   do NOT also count as a dismissal.
  // - dismissTrackedRef: dedupe against rapid Escape + outside-click races.
  const ctaClickedRef = useRef(false);
  const dismissTrackedRef = useRef(false);

  const trackDismiss = () => {
    if (ctaClickedRef.current || dismissTrackedRef.current) return;
    dismissTrackedRef.current = true;
    analytics.upgradeWallDismissed(gate, tier);
    const ms = elapsedMs();
    if (ms !== null) analytics.upgradeWallTiming(gate, tier, "dismissed", ms);
  };
  const trackCta = () => {
    if (ctaClickedRef.current) return;
    ctaClickedRef.current = true;
    analytics.upgradeWallCtaClicked(gate, tier);
    const ms = elapsedMs();
    if (ms !== null) analytics.upgradeWallTiming(gate, tier, "cta_clicked", ms);
  };

  // Keep onDismiss ref stable so the trap effect can run mount-only and so
  // that every dismissal path (Close button, Escape, outside-click) flows
  // through trackDismiss before calling the parent handler.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);
  // Mirror returnFocus into a ref so the mount-only restoration effect always
  // reads the latest value at unmount, without re-running and re-capturing
  // previouslyFocused on every parent render.
  const returnFocusRef = useRef(returnFocus);
  useEffect(() => {
    returnFocusRef.current = returnFocus;
  }, [returnFocus]);
  // Stable ref to the wrapped dismiss-with-analytics function so the
  // mount-only key-handler effect can call it without re-binding.
  const dismissAndTrackRef = useRef(() => {});
  dismissAndTrackRef.current = () => {
    trackDismiss();
    onDismissRef.current();
  };
  const dismissAndTrack = () => dismissAndTrackRef.current();

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
        dismissAndTrackRef.current();
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
      // Resolve the focus target with this priority:
      //   1. Explicit `returnFocus` prop (ref or DOM node) — caller knows best.
      //      `null` opts out of restoration entirely.
      //   2. Auto-captured trigger (`previouslyFocused`) — handles the common
      //      "user clicked a button, modal opened" case.
      // Both paths share the same connectedness + focus() guards.
      const explicit = returnFocusRef.current;
      let target: HTMLElement | null = null;
      if (explicit === null) {
        // Caller explicitly opted out.
        target = null;
      } else if (explicit && "current" in explicit) {
        target = explicit.current ?? null;
      } else if (explicit instanceof HTMLElement) {
        target = explicit;
      } else {
        target = previouslyFocused.current;
      }
      if (target && target.isConnected && typeof target.focus === "function") {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
    };
  }, [ios]);

  // Apple App Review compliance for iOS native builds:
  // - The standard web upgrade wall (with its purchase CTA + price) cannot be
  //   shown on iOS — Guideline 3.1.1 prohibits steering users to non-IAP
  //   purchase flows from inside the app.
  // - Returning null here used to mean iOS users tapping a gated feature got
  //   silence, which is a worse experience than the web and gave them no path
  //   forward.
  // - Instead we render an inform-only fallback: explains what the feature is,
  //   never mentions price or web purchase, and offers two App-Review-safe
  //   actions: (a) open iOS Settings to manage an existing subscription, and
  //   (b) the App-Store Reader Rule single Account link to manage on the web.
  // - Both side actions degrade gracefully if the Capacitor plugins are not
  //   available (web preview running through the iOS code path during dev).
  if (ios) {
    // Wrap the iOS branch in a runtime guard so a future regression that
    // makes the fallback render null is observable in production. Without
    // this, iOS users would silently get nothing and we'd only find out
    // from support tickets. The guard is render-time-cheap (one ref check
    // in an effect) and ships a single `upgrade_wall_null_return` event.
    return (
      <IOSBranchGuard gate={gate} tier={tier}>
        <UpgradeWallBoundary
          gate={gate}
          tier={tier}
          fallback={({ retry }) => (
            <IOSFallbackErrorState
              accentColor={accentColor}
              onDismiss={onDismiss}
              onRetry={retry}
            />
          )}
        >
          <UpgradeWallIOSFallback
            headline={headline}
            body={body}
            accentColor={accentColor}
            onDismiss={onDismiss}
            coachPreview={coachPreview}
            streakRepairPreview={streakRepairPreview}
            gate={gate}
            tier={tier}
          />
        </UpgradeWallBoundary>
      </IOSBranchGuard>
    );
  }

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
      dismissAndTrack();
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
      aria-describedby="upgrade-wall-body"
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
            onClick={dismissAndTrack}
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
          <p id="upgrade-wall-body" className="text-sm text-muted-foreground leading-relaxed">{body}</p>

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
            onClick={() => {
              trackCta();
              onUpgrade();
            }}
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

// ---------------------------------------------------------------------------
// iOS native fallback
// ---------------------------------------------------------------------------
// Apple App Review-safe modal shown when the standard upgrade wall would have
// returned null on iOS native builds. Strict rules enforced here:
//   1. NO mention of price.
//   2. NO purchase CTA. The only actions are dismiss, open iOS Settings, and
//      the single App-Store Reader Rule "Manage on web" link.
//   3. The "Manage on web" link goes to /account on the marketing site, which
//      is a subscription management surface, NOT a checkout. Apple permits a
//      single account-management link out per Reader Rule 3.1.3(a).
//   4. Capacitor plugin calls are best-effort: if the plugin is unavailable
//      (e.g. running in the web preview through this code path during a test)
//      the buttons silently no-op rather than crashing.
//
// The component reuses the same focus-trap, Escape-to-close, and outside-click
// patterns as the main modal so iOS keyboard / external-keyboard users get the
// same accessibility guarantees.
interface IOSFallbackProps {
  headline: string;
  body: string;
  accentColor: string;
  onDismiss: () => void;
  coachPreview: boolean;
  streakRepairPreview: boolean;
  gate: UpgradeWallGate;
  tier: UpgradeWallTier;
}

function UpgradeWallIOSFallback({
  headline,
  body,
  accentColor,
  onDismiss,
  coachPreview,
  streakRepairPreview,
  gate,
  tier,
}: IOSFallbackProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const pointerDownOnBackdrop = useRef(false);

  // Lock background scroll on iOS too. Even though the native WKWebView
  // doesn't show a scrollbar, rubber-band scrolling can still disrupt the
  // focus trap and pull the modal partially out of view.
  useBodyScrollLock(true);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Funnel-event guards (same contract as the web modal). On iOS the
  // "CTA" is the Reader-rule "Manage on web" button — that is what counts
  // as a real conversion intent here. Tapping "Manage subscription in
  // Settings" is treated as a dismissal in funnel terms because it does NOT
  // start a new purchase flow (existing-subscriber maintenance).
  const ctaClickedRef = useRef(false);
  const dismissTrackedRef = useRef(false);

  // Capture mount time for the dwell-time companion event. The parent
  // <UpgradeWall> fires `upgrade_wall_shown` in the same commit that mounts
  // this fallback, so the deltas are equivalent — but keeping the timer
  // local avoids prop-drilling and survives any future refactor that
  // mounts the fallback independently.
  const mountTimeRef = useRef<number>(
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now(),
  );
  const elapsedMs = (): number => {
    const now =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    return now - mountTimeRef.current;
  };

  const trackDismiss = () => {
    if (ctaClickedRef.current || dismissTrackedRef.current) return;
    dismissTrackedRef.current = true;
    analytics.upgradeWallDismissed(gate, tier);
    analytics.upgradeWallTiming(gate, tier, "dismissed", elapsedMs());
  };
  const trackCta = () => {
    if (ctaClickedRef.current) return;
    ctaClickedRef.current = true;
    analytics.upgradeWallCtaClicked(gate, tier);
    analytics.upgradeWallTiming(gate, tier, "cta_clicked", elapsedMs());
  };
  const dismissAndTrackRef = useRef(() => {});
  dismissAndTrackRef.current = () => {
    trackDismiss();
    onDismissRef.current();
  };
  const dismissAndTrack = () => dismissAndTrackRef.current();

  // Focus trap + Escape-to-close, identical contract to the web modal.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismissAndTrackRef.current();
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
      previouslyFocused.current?.focus?.();
    };
  }, []);

  const handleBackdropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownOnBackdrop.current = e.target === e.currentTarget;
  };
  const handleBackdropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerDownOnBackdrop.current && e.target === e.currentTarget) {
      dismissAndTrack();
    }
    pointerDownOnBackdrop.current = false;
  };

  // Open iOS Settings → app's subscription management page. We use the
  // app-settings: URL scheme via Capacitor App.openUrl. On older iOS or if
  // the plugin is unregistered we silently no-op so we never crash.
  // Open iOS Settings → app's subscription management page.
  // The @capacitor/app plugin does NOT expose openUrl in v7, and we don't
  // want to introduce a new native plugin just for this. The WKWebView
  // honors custom URL schemes via window.location, which iOS resolves to
  // the Settings app for the "app-settings:" scheme. On non-iOS or when the
  // scheme is blocked, this is a harmless no-op (the page won't navigate).
  const openIOSSettings = () => {
    try {
      window.location.href = "app-settings:";
    } catch {
      /* best effort */
    }
  };

  // App-Store Reader Rule 3.1.3(a) compliant link: opens the marketing site's
  // /account page in an in-app SFSafariViewController. /account must NOT show
  // a purchase form to a logged-out user; it must show subscription
  // management. (Pricing pages are a separate URL and are NOT linked here.)
  const openManageOnWeb = async () => {
    // "Manage on web" is the iOS conversion intent — fire CTA before opening
    // the in-app browser so we capture the click even if the browser handoff
    // takes a moment.
    trackCta();
    const url = "https://momentumfit.app/account";
    try {
      if (Capacitor.isPluginAvailable("Browser")) {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url, presentationStyle: "popover" });
        return;
      }
    } catch {
      /* fall through to window.open */
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Portal target sanity check. document.body is virtually always present,
  // but during pre-hydration race conditions or in certain test harnesses
  // it can be null/detached. Without this check React would throw with a
  // cryptic "Target container is not a DOM element".
  //
  // Critical UX rule: iOS must NEVER render nothing. If the portal target
  // is missing we render an inline (non-portal) inform-only notice with the
  // App-Review-safe coming-soon copy so the user still gets a visible
  // explanation of why the gated feature didn't open. We still emit the
  // `ios_portal_target_missing` analytics so the regression is observable.
  const portalTarget =
    typeof document !== "undefined" && document.body && document.body.isConnected
      ? document.body
      : null;
  if (!portalTarget) {
    try {
      analytics.upgradeWallNullReturn(gate, tier, "ios_portal_target_missing");
    } catch {
      /* no-op */
    }
    return (
      <UpgradeWallIOSInlineNotice
        headline={headline}
        body={body}
        accentColor={accentColor}
        onDismiss={dismissAndTrack}
        onManageOnWeb={openManageOnWeb}
        onOpenSettings={openIOSSettings}
      />
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onPointerDown={handleBackdropPointerDown}
      onPointerUp={handleBackdropPointerUp}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-wall-ios-title"
      aria-describedby="upgrade-wall-ios-desc"
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
            onClick={dismissAndTrack}
            className="absolute top-[10px] right-[10px] text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <h3
            id="upgrade-wall-ios-title"
            className="font-semibold text-base text-foreground leading-tight pr-12"
          >
            {headline}
          </h3>
        </div>

        <div className="px-[22px] pb-[22px] pt-3 space-y-[18px]">
          <p
            id="upgrade-wall-ios-desc"
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {body}
          </p>

          {streakRepairPreview && (
            <div className="space-y-1.5">
              <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground font-semibold">
                What Streak Repair does
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

          {/* Apple App Review-safe purchase-path notice. No price, no checkout link; web action goes to /account. Sets honest expectations that IAP is not yet available on iOS. "future update" makes no timing promise. */}
          <div role="note" aria-label="Subscription information" className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-foreground leading-relaxed">
              In-app purchases on iOS will be available in a future update through the App Store. Until then, you can manage an existing subscription on the web or in your iOS Settings.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={openManageOnWeb}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm text-white cursor-pointer border-none"
              style={{ background: accentColor }}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Manage on web
            </button>
            <button
              onClick={openIOSSettings}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium text-sm text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer border-none"
            >
              <SettingsIcon className="h-4 w-4" aria-hidden="true" />
              Manage subscription in Settings
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  );
}

// ----------------------------------------------------------------------------
// IOSBranchGuard
// ----------------------------------------------------------------------------
// Render-time + post-mount observability wrapper for the iOS native branch.
//
// Why both signals?
//   - Render-time check catches the case where `children` evaluated to a
//     falsy value (null / undefined / false) — i.e. the iOS fallback wasn't
//     rendered at all. We log immediately so the regression shows up in the
//     same session it happens.
//   - Post-mount DOM check (one tick after commit) catches subtler cases
//     where the fallback rendered an empty fragment or got stripped by an
//     ancestor portal/error boundary. If our wrapper has zero children in
//     the live DOM, treat it as a null return for funnel purposes.
//
// Both paths emit `analytics.upgradeWallNullReturn` (cheap, idempotent) and
// a Sentry breadcrumb when available so we can correlate with stack traces.
// We deliberately do NOT throw — a silent paywall is bad, but throwing on
// iOS would crash the gated screen entirely. Logging is enough.
function IOSBranchGuard({
  children,
  gate,
  tier,
}: {
  children: React.ReactNode;
  gate: UpgradeWallGate;
  tier: UpgradeWallTier;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reportedRef = useRef(false);

  const report = (reason: string) => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    try {
      analytics.upgradeWallNullReturn(gate, tier, reason);
    } catch {
      /* never let analytics swallow a render */
    }
    // Best-effort Sentry breadcrumb. We use the global to avoid a hard
    // dependency on @sentry/* in this hot path.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      w.Sentry?.captureMessage?.(
        `UpgradeWall iOS branch returned null (${reason})`,
        {
          level: "warning",
          tags: { component: "UpgradeWall", platform: "ios", gate, tier, reason },
        }
      );
    } catch {
      /* no-op */
    }
  };

  // Render-time guard. `children` is what the iOS branch produced; if it's
  // falsy the fallback never built a tree.
  const renderedNull =
    children === null || children === undefined || children === false;
  if (renderedNull) {
    // Fire synchronously during the render that already produced nothing.
    // Safe to call here because the analytics fn is side-effect-only and
    // doesn't trigger React state updates.
    report("ios_branch_returned_null");
  }

  // Post-mount DOM guard. Runs once. If the wrapper exists but is empty
  // after commit, the fallback effectively rendered nothing.
  //
  // Also performs a Capacitor cross-check: our isIOSNative() is a multi-
  // signal heuristic (Capacitor probe → standalone PWA → WKWebView UA).
  // If we got here via heuristic but the canonical `Capacitor.isNativePlatform()`
  // disagrees, that's a detection-chain divergence worth alerting on so we
  // can tune the heuristics. PWA-installed iOS users will trip this every
  // mount — see mem://features/upgrade-wall-observability for the dashboard
  // filter to slice noisy variants.
  //
  // Cleanup also fires `ios_unmounted_before_paint` when the component is
  // torn down before the post-mount check ran (rapid open/close race). The
  // `paintCheckedRef` flag lets cleanup tell the two cases apart.
  const paintCheckedRef = useRef(false);
  useEffect(() => {
    if (renderedNull) {
      // Already reported above; mark as "checked" so cleanup doesn't double-fire.
      paintCheckedRef.current = true;
      return;
    }
    const node = wrapperRef.current;
    if (!node) return;
    // The iOS fallback uses a portal, so this wrapper itself will be empty
    // by design when the portal mounts elsewhere. We only flag the case
    // where BOTH our wrapper is empty AND no dialog node was added to the
    // document. Querying by role keeps this resilient to id changes.
    const dialogPresent = !!document.querySelector('[role="dialog"]');
    if (!dialogPresent) {
      report("ios_fallback_no_dialog_in_dom");
    }

    // Capacitor cross-check. Done in an effect (not at render) because the
    // native bridge can take a tick to attach on cold start.
    try {
      const canonical = Capacitor.isNativePlatform();
      if (!canonical) {
        report("ios_capacitor_unavailable");
      }
    } catch {
      /* Capacitor probe threw — already covered by ios_platform_detect_failed */
    }

    paintCheckedRef.current = true;
    // Empty deps: we only need to verify once, right after the initial
    // render. Subsequent updates can't go from "rendered" to "null" without
    // unmounting first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unmount-before-paint guard. If the component is torn down before the
  // post-mount effect ever ran (rapid open/close, route change mid-mount),
  // we fire a distinct reason so this race is visible in the funnel.
  useEffect(() => {
    return () => {
      if (!paintCheckedRef.current) {
        report("ios_unmounted_before_paint");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}

// ----------------------------------------------------------------------------
// IOSFallbackErrorState
// ----------------------------------------------------------------------------
// Minimal, App-Review-safe surface shown when the iOS fallback subtree throws
// during render. We render a tiny dialog (no price, no purchase CTA) with a
// Close button and a Try-again button. The retry path is what fires the
// `ios_render_error_recovered` reason from UpgradeWallBoundary.
function IOSFallbackErrorState({
  accentColor,
  onDismiss,
  onRetry,
}: {
  accentColor: string;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  // Defensive portal-target lookup. The boundary normally fires after a
  // successful initial mount, so document.body is virtually always present
  // here. But the same pre-hydration race that triggers the inline notice
  // could in theory unmount body between renders, so fall back to inline
  // rendering rather than crashing the gated screen.
  const portalTarget =
    typeof document !== "undefined" && document.body && document.body.isConnected
      ? document.body
      : null;
  const tree = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Something went wrong"
    >
      <div
        className="bg-card rounded-xl max-w-[360px] w-full p-6 shadow-2xl"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-2">
          We couldn't load that just now
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tap Try again, or close and reopen the feature.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Close
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-semibold text-white rounded min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ background: accentColor }}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
  return portalTarget ? createPortal(tree, portalTarget) : tree;
}

// ----------------------------------------------------------------------------
// UpgradeWallIOSInlineNotice
// ----------------------------------------------------------------------------
// Last-resort, non-portal inline notice rendered when document.body is
// unavailable (pre-hydration race, jsdom test harness, detached body, etc).
//
// Why inline (no createPortal)?
//   - createPortal requires a valid Element target. If portalTarget is null
//     we can't portal anywhere — so we render in-tree where the parent
//     mounted us. This guarantees iOS users ALWAYS see something.
//
// App Review compliance is identical to the regular iOS fallback:
//   - No price.
//   - No purchase CTA.
//   - "Manage on web" goes to /account (subscription management, not
//     checkout) per Reader Rule 3.1.3(a).
//
// Visually we still use a fixed full-screen overlay so the user perceives
// it as a modal even though it's not portaled. It does not focus-trap or
// scroll-lock — those are best-effort niceties that require a healthy DOM,
// and the whole point of this branch is that the DOM is unhealthy.
function UpgradeWallIOSInlineNotice({
  headline,
  body,
  accentColor,
  onDismiss,
  onManageOnWeb,
  onOpenSettings,
}: {
  headline: string;
  body: string;
  accentColor: string;
  onDismiss: () => void;
  onManageOnWeb: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-wall-ios-inline-title"
      aria-describedby="upgrade-wall-ios-inline-desc"
    >
      <div
        className="bg-card rounded-xl max-w-[420px] w-full overflow-hidden shadow-2xl"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div className="p-[22px] pb-0 relative">
          <button
            onClick={onDismiss}
            className="absolute top-[10px] right-[10px] text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <h3
            id="upgrade-wall-ios-inline-title"
            className="font-semibold text-base text-foreground leading-tight pr-12"
          >
            {headline}
          </h3>
        </div>

        <div className="px-[22px] pb-[22px] pt-3 space-y-[18px]">
          <p
            id="upgrade-wall-ios-inline-desc"
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {body}
          </p>

          <div
            role="note"
            aria-label="Subscription information"
            className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2.5"
          >
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-foreground leading-relaxed">
              In-app purchases on iOS will be available in a future update through the App Store. Until then, you can manage an existing subscription on the web or in your iOS Settings.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={onManageOnWeb}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm text-white cursor-pointer border-none"
              style={{ background: accentColor }}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Manage on web
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium text-sm text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer border-none"
            >
              <SettingsIcon className="h-4 w-4" aria-hidden="true" />
              Manage subscription in Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

