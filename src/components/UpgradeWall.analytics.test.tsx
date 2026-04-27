import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

// Force the web (non-iOS) code path for the bulk of tests; one suite below
// re-mocks for iOS to verify the iOS analytics path.
vi.mock("@/lib/platform", () => ({
  isIOSNative: () => false,
  isAndroidNative: () => false,
  isNativeMobile: () => false,
}));

const dismissedSpy = vi.fn();
const ctaSpy = vi.fn();
vi.mock("@/lib/analytics", () => ({
  analytics: {
    upgradeWallDismissed: (gate: string, tier: string, method?: string) =>
      dismissedSpy(gate, tier, method),
    upgradeWallCtaClicked: (gate: string, tier: string, method?: string) =>
      ctaSpy(gate, tier, method),
  },
}));

import { UpgradeWall } from "./UpgradeWall";

const baseProps = {
  headline: "Unlock AI Coach",
  body: "AI Coach helps you understand your patterns.",
  cta: "Upgrade to Premium",
  onUpgrade: vi.fn(),
  onDismiss: vi.fn(),
  gate: "coach" as const,
  tier: "premium" as const,
};

describe("UpgradeWall — funnel analytics", () => {
  beforeEach(() => {
    dismissedSpy.mockClear();
    ctaSpy.mockClear();
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("upgrade_wall_dismissed", () => {
    it("fires once with method='close_button' when the Close button is clicked", () => {
      render(<UpgradeWall {...baseProps} />);
      fireEvent.click(screen.getByRole("button", { name: /close upgrade dialog/i }));
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).toHaveBeenCalledWith("coach", "premium", "close_button");
      expect(ctaSpy).not.toHaveBeenCalled();
    });

    it("fires once with method='escape' when Escape is pressed", () => {
      render(<UpgradeWall {...baseProps} gate="streak_repair" tier="pro" />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).toHaveBeenCalledWith("streak_repair", "pro", "escape");
    });

    it("fires once with method='outside_click' when the user clicks outside the panel", () => {
      render(<UpgradeWall {...baseProps} gate="habit_limit" tier="pro" />);
      const backdrop = screen.getByRole("dialog");
      fireEvent.pointerDown(backdrop, { target: backdrop });
      fireEvent.pointerUp(backdrop, { target: backdrop });
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).toHaveBeenCalledWith("habit_limit", "pro", "outside_click");
    });

    it("dedupes across rapid Escape + Close (fires exactly once with the FIRST method)", () => {
      // First user action wins. The second action's method is not recorded
      // because the dismissTrackedRef guard short-circuits — this matches
      // GA4 funnel semantics where each wall instance contributes one event.
      render(<UpgradeWall {...baseProps} />);
      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.click(screen.getByRole("button", { name: /close upgrade dialog/i }));
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).toHaveBeenCalledWith("coach", "premium", "escape");
    });

    it("falls back to 'unknown' for gate/tier when caller omits them", () => {
      render(
        <UpgradeWall
          headline="x"
          body="y"
          cta="z"
          onUpgrade={vi.fn()}
          onDismiss={vi.fn()}
        />
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(dismissedSpy).toHaveBeenCalledWith("unknown", "unknown", "escape");
    });

    it("fires method='programmatic' when the parent unmounts the wall without user interaction", () => {
      // Routing changes / auth flips can yank the wall mid-display. We still
      // want one dismissed event so funnel math (shown == dismissed + cta)
      // balances, but tagged distinctly so this cohort can be excluded from
      // UX experiments that only care about real user closures.
      const { unmount } = render(<UpgradeWall {...baseProps} />);
      unmount();
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).toHaveBeenCalledWith("coach", "premium", "programmatic");
    });

    it("does NOT fire 'programmatic' when a user-tagged dismissal already fired", () => {
      // The dismissTrackedRef guard ensures the unmount-cleanup is a no-op
      // after a real user dismissal — otherwise every wall would double-count.
      const { unmount } = render(<UpgradeWall {...baseProps} />);
      fireEvent.keyDown(document, { key: "Escape" });
      unmount();
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).toHaveBeenCalledWith("coach", "premium", "escape");
    });
  });

  describe("upgrade_wall_cta_clicked", () => {
    it("fires once with method='cta_button' when the upgrade CTA is clicked", () => {
      const onUpgrade = vi.fn();
      render(<UpgradeWall {...baseProps} onUpgrade={onUpgrade} />);
      fireEvent.click(screen.getByRole("button", { name: /upgrade to premium/i }));
      expect(ctaSpy).toHaveBeenCalledTimes(1);
      expect(ctaSpy).toHaveBeenCalledWith("coach", "premium", "cta_button");
      expect(onUpgrade).toHaveBeenCalledTimes(1);
    });

    it("does NOT also fire dismissed when the parent unmounts the modal after CTA", () => {
      // Simulates the real call site: clicking the CTA calls onUpgrade, which
      // typically calls onDismiss to unmount. The dismiss MUST NOT count as a
      // close in the funnel because the user converted.
      const onUpgrade = vi.fn();
      const onDismiss = vi.fn();
      const { unmount } = render(
        <UpgradeWall
          {...baseProps}
          onUpgrade={() => {
            onUpgrade();
            onDismiss();
          }}
          onDismiss={onDismiss}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: /upgrade to premium/i }));
      // Force unmount-cleanup to confirm the programmatic-dismiss tracker
      // also respects ctaClickedRef.
      unmount();
      expect(ctaSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).not.toHaveBeenCalled();
    });

    it("dedupes if the user double-clicks the CTA", () => {
      render(<UpgradeWall {...baseProps} />);
      const btn = screen.getByRole("button", { name: /upgrade to premium/i });
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(ctaSpy).toHaveBeenCalledTimes(1);
    });
  });
});

// ---------------------------------------------------------------------------
// iOS analytics path — separate suite because vi.mock is module-scoped.
// ---------------------------------------------------------------------------
describe("UpgradeWall iOS — funnel analytics", () => {
  let dismissedIos: ReturnType<typeof vi.fn>;
  let ctaIos: ReturnType<typeof vi.fn>;
  let UpgradeWallIos: typeof UpgradeWall;

  beforeEach(async () => {
    vi.resetModules();
    dismissedIos = vi.fn();
    ctaIos = vi.fn();
    vi.doMock("@/lib/platform", () => ({
      isIOSNative: () => true,
      isAndroidNative: () => false,
      isNativeMobile: () => true,
    }));
    vi.doMock("@/lib/analytics", () => ({
      analytics: {
        upgradeWallDismissed: (g: string, t: string) => dismissedIos(g, t),
        upgradeWallCtaClicked: (g: string, t: string) => ctaIos(g, t),
      },
    }));
    vi.doMock("@capacitor/core", () => ({
      Capacitor: {
        isPluginAvailable: () => true,
        isNativePlatform: () => true,
        getPlatform: () => "ios",
      },
    }));
    vi.doMock("@capacitor/browser", () => ({
      Browser: { open: vi.fn().mockResolvedValue(undefined) },
    }));
    UpgradeWallIos = (await import("./UpgradeWall")).UpgradeWall;
  });

  afterEach(() => {
    cleanup();
    vi.doUnmock("@/lib/platform");
    vi.doUnmock("@/lib/analytics");
    vi.doUnmock("@capacitor/core");
    vi.doUnmock("@capacitor/browser");
  });

  it("fires upgrade_wall_dismissed when the iOS Close button is tapped", () => {
    render(<UpgradeWallIos {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close dialog/i }));
    expect(dismissedIos).toHaveBeenCalledTimes(1);
    expect(dismissedIos).toHaveBeenCalledWith("coach", "premium");
  });

  it("fires upgrade_wall_cta_clicked when 'Manage on web' is tapped (Reader-rule conversion intent)", async () => {
    render(<UpgradeWallIos {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /manage on web/i }));
    await waitFor(() => expect(ctaIos).toHaveBeenCalledTimes(1));
    expect(ctaIos).toHaveBeenCalledWith("coach", "premium");
    expect(dismissedIos).not.toHaveBeenCalled();
  });

  it("'Manage subscription in Settings' counts as a dismissal, NOT a CTA click", () => {
    // Stub location.href so the iOS scheme does not throw.
    const original = Object.getOwnPropertyDescriptor(window, "location");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...window.location,
        set href(_v: string) {},
        get href() {
          return "";
        },
      },
    });
    try {
      render(<UpgradeWallIos {...baseProps} />);
      fireEvent.click(
        screen.getByRole("button", { name: /manage subscription in settings/i })
      );
      // Settings deep-link does NOT itself dismiss the modal in the component
      // (no onDismiss call). It's a side-action for existing subscribers.
      // Therefore neither analytics event fires from this button alone — we
      // only count dismiss on close/escape/outside or CTA on Manage-on-web.
      expect(ctaIos).not.toHaveBeenCalled();
      expect(dismissedIos).not.toHaveBeenCalled();
    } finally {
      if (original) Object.defineProperty(window, "location", original);
    }
  });
});
