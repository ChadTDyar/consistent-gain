import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { X, ExternalLink, Settings as SettingsIcon } from "lucide-react";
import { isIOSNative } from "@/lib/platform";
import { Capacitor } from "@capacitor/core";
import { analytics } from "@/lib/analytics";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

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

  // WCAG 2.3.3 Animation from Interactions: when the user prefers reduced
  // motion, omit the entry animation classes entirely. We don't just rely on
  // the global `prefers-reduced-motion` CSS guard (which only shortens the
  // duration) because:
  //   - Skipping the class avoids any transient transform/opacity state on
  //     the panel that could interfere with focus restoration math.
  //   - The dialog appears in its final visual state on the very first paint,
  //     which is the spec-recommended behavior for non-essential motion.
  const prefersReducedMotion = usePrefersReducedMotion();

  // Lock background scroll while the web variant is mounted. The iOS variant
  // is rendered by UpgradeWallIOSFallback which manages its own lock — we
  // disable here on iOS to avoid double-locking the body.
  useBodyScrollLock(!ios);

  // Funnel-event guards. We MUST fire dismissed XOR cta_clicked exactly once
  // per modal lifetime, never both, never zero.
  // - ctaClickedRef: set when the user clicks the upgrade CTA so subsequent
  //   onDismiss calls (which the parent typically issues to unmount the modal)
  //   do NOT also count as a dismissal.
  // - dismissTrackedRef: dedupe against rapid Escape + outside-click races.
  const ctaClickedRef = useRef(false);
  const dismissTrackedRef = useRef(false);

  const trackDismiss = (method: import("@/lib/analytics").UpgradeWallDismissMethod) => {
    if (ctaClickedRef.current || dismissTrackedRef.current) return;
    dismissTrackedRef.current = true;
    analytics.upgradeWallDismissed(gate, tier, method);
  };
  const trackCta = () => {
    if (ctaClickedRef.current) return;
    ctaClickedRef.current = true;
    analytics.upgradeWallCtaClicked(gate, tier);
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
  // mount-only key-handler effect can call it without re-binding. The
  // method must be supplied at the call site so each dismissal path
  // (escape | close_button | outside_click) is recorded distinctly.
  const dismissAndTrackRef = useRef(
    (_method: import("@/lib/analytics").UpgradeWallDismissMethod) => {}
  );
  dismissAndTrackRef.current = (
    method: import("@/lib/analytics").UpgradeWallDismissMethod
  ) => {
    trackDismiss(method);
    onDismissRef.current();
  };
  const dismissAndTrack = (
    method: import("@/lib/analytics").UpgradeWallDismissMethod
  ) => dismissAndTrackRef.current(method);

  // Programmatic-unmount tracker: if the parent unmounts the wall without
  // any user action firing a method (e.g. route change, auth-state flip,
  // upstream state cleared), we record `programmatic` exactly once on
  // cleanup so funnel math isn't silently inflated by zero-event walls.
  // The tracking guards (ctaClickedRef, dismissTrackedRef) ensure this is
  // a no-op when the user genuinely interacted.
  useEffect(() => {
    return () => trackDismiss("programmatic");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        dismissAndTrackRef.current("escape");
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
    return (
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
      dismissAndTrack("outside_click");
    }
    pointerDownOnBackdrop.current = false;
  };

  // Per-instance unique IDs.
  // Why: when two UpgradeWalls stack (rare but possible — e.g. a deferred
  // gate fires while another wall is mid-animation) or React StrictMode
  // double-mounts, hard-coded IDs collide and screen readers resolve
  // aria-labelledby/aria-describedby to the WRONG element. useId() guarantees
  // uniqueness within and across renders.
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const bodyId = `${reactId}-body`;
  const previewId = `${reactId}-preview`;
  const announcementId = `${reactId}-announcement`;
  const hasPreview = coachPreview || streakRepairPreview;

  // The dialog's accessible description includes the body paragraph plus the
  // preview block when present. Screen readers concatenate the referenced
  // nodes' text in document order, so SR users hear: headline → body → preview
  // copy ("What AI Coach does" / "What Streak Repair looks like" + example).
  // Without this, the most persuasive content is silently skipped on open.
  const describedBy = hasPreview ? `${bodyId} ${previewId}` : bodyId;

  // Polite live-region announcement.
  // Belt-and-suspenders for AT combinations that don't reliably announce a
  // newly-mounted role="dialog" (some Android TalkBack + Chrome flows). We
  // populate the live region one tick AFTER mount so the AT registers it as a
  // live update rather than initial DOM (which would race with the dialog
  // announcement and double-speak the headline).
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  useEffect(() => {
    if (ios) return;
    const t = window.setTimeout(() => {
      setLiveAnnouncement(`Upgrade dialog opened: ${headline}. ${body}`);
    }, 100);
    return () => window.clearTimeout(t);
    // headline/body are intentionally in the dep list: if a parent swaps the
    // wall content while the modal stays mounted (e.g. flipping
    // upgradeWallType), we want the new content re-announced.
  }, [ios, headline, body]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        prefersReducedMotion ? "" : "animate-backdrop-fade-in"
      }`}
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onPointerDown={handleBackdropPointerDown}
      onPointerUp={handleBackdropPointerUp}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-card rounded-xl max-w-[420px] w-full overflow-hidden shadow-2xl ${
          prefersReducedMotion ? "" : "animate-modal-pop-in"
        }`}
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <div className="p-[22px] pb-0 relative">
          <button
            ref={closeBtnRef}
            onClick={() => dismissAndTrack("close_button")}
            className="absolute top-[10px] right-[10px] text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Close upgrade dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <h3 id={titleId} className="font-semibold text-base text-foreground leading-tight pr-12">
            {headline}
          </h3>
        </div>

        <div className="px-[22px] pb-[22px] pt-3 space-y-[18px]">
          <p id={bodyId} className="text-sm text-muted-foreground leading-relaxed">{body}</p>

          {streakRepairPreview && (
            <div id={previewId} className="space-y-1.5">
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
            // Defensive: only the first rendered preview owns previewId so a
            // hypothetical caller that sets BOTH preview flags doesn't produce
            // duplicate IDs (which break aria-describedby resolution).
            <div id={streakRepairPreview ? undefined : previewId} className="space-y-1.5">
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

      {/*
        Polite live region — screen-reader-only.
        - aria-live="polite" so it doesn't interrupt the dialog announcement.
        - aria-atomic="true" so the full message is read on each update,
          not just the diff.
        - role="status" gives belt-and-suspenders coverage for AT that don't
          map aria-live polite onto a generic node.
        - Lives inside the dialog so the focus-trap + scroll lock don't have
          to consider an extra portal.
        - Populated 100ms after mount (see effect above) so the AT registers
          this as a *live update* rather than initial DOM, which would race
          with the dialog announcement and double-speak the headline.
        - sr-only utility hides it from sighted users.
      */}
      <div
        id={announcementId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
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

  // Per-instance unique IDs (see web variant for rationale).
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const bodyId = `${reactId}-body`;
  const previewId = `${reactId}-preview`;
  const announcementId = `${reactId}-announcement`;
  const hasPreview = coachPreview || streakRepairPreview;
  const describedBy = hasPreview ? `${bodyId} ${previewId}` : bodyId;
  // See web variant for rationale; same WCAG 2.3.3 policy applies on iOS.
  const prefersReducedMotion = usePrefersReducedMotion();

  // Polite live-region announcement (see web variant for rationale).
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => {
      setLiveAnnouncement(`Upgrade dialog opened: ${headline}. ${body}`);
    }, 100);
    return () => window.clearTimeout(t);
  }, [headline, body]);

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
  const trackDismiss = (
    method: import("@/lib/analytics").UpgradeWallDismissMethod
  ) => {
    if (ctaClickedRef.current || dismissTrackedRef.current) return;
    dismissTrackedRef.current = true;
    analytics.upgradeWallDismissed(gate, tier, method);
  };
  const trackCta = (
    method: import("@/lib/analytics").UpgradeWallCtaMethod = "manage_on_web"
  ) => {
    if (ctaClickedRef.current) return;
    ctaClickedRef.current = true;
    analytics.upgradeWallCtaClicked(gate, tier, method);
  };
  const dismissAndTrackRef = useRef(
    (_method: import("@/lib/analytics").UpgradeWallDismissMethod) => {}
  );
  dismissAndTrackRef.current = (
    method: import("@/lib/analytics").UpgradeWallDismissMethod
  ) => {
    trackDismiss(method);
    onDismissRef.current();
  };
  const dismissAndTrack = (
    method: import("@/lib/analytics").UpgradeWallDismissMethod
  ) => dismissAndTrackRef.current(method);

  // Programmatic-unmount tracker (see web variant). Only fires if the user
  // never produced a method-tagged dismissal or CTA click during the wall's
  // lifetime.
  useEffect(() => {
    return () => trackDismiss("programmatic");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        prefersReducedMotion ? "" : "animate-backdrop-fade-in"
      }`}
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onPointerDown={handleBackdropPointerDown}
      onPointerUp={handleBackdropPointerUp}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-card rounded-xl max-w-[420px] w-full overflow-hidden shadow-2xl ${
          prefersReducedMotion ? "" : "animate-modal-pop-in"
        }`}
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
            id={titleId}
            className="font-semibold text-base text-foreground leading-tight pr-12"
          >
            {headline}
          </h3>
        </div>

        <div className="px-[22px] pb-[22px] pt-3 space-y-[18px]">
          <p
            id={bodyId}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {body}
          </p>

          {streakRepairPreview && (
            <div id={previewId} className="space-y-1.5">
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
            // Defensive: only the first preview owns previewId (see web variant).
            <div id={streakRepairPreview ? undefined : previewId} className="space-y-1.5">
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
          <p className="text-center text-xs text-muted-foreground">
            Already a member? Sign in on the web to access this on iOS.
          </p>
        </div>
      </div>

      {/* Polite live region (see web variant for full rationale). */}
      <div
        id={announcementId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>
    </div>,
    document.body
  );
}

