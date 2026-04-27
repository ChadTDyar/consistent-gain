import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

// Force the web (non-iOS) code path; iOS is exercised in its own suite below.
vi.mock("@/lib/platform", () => ({
  isIOSNative: () => false,
  isAndroidNative: () => false,
  isNativeMobile: () => false,
}));

const dismissedSpy = vi.fn();
const ctaSpy = vi.fn();
const timingSpy = vi.fn();
vi.mock("@/lib/analytics", () => ({
  analytics: {
    upgradeWallDismissed: (...a: unknown[]) => dismissedSpy(...a),
    upgradeWallCtaClicked: (...a: unknown[]) => ctaSpy(...a),
    upgradeWallShown: vi.fn(),
    upgradeWallNullReturn: vi.fn(),
    upgradeWallTiming: (...a: unknown[]) => timingSpy(...a),
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

/**
 * Helper: extract the time_ms argument from the most recent timing call.
 * Also asserts the first three positional args (gate, tier, outcome).
 */
function lastTimingCall() {
  expect(timingSpy).toHaveBeenCalled();
  const args = timingSpy.mock.calls[timingSpy.mock.calls.length - 1];
  return {
    gate: args[0] as string,
    tier: args[1] as string,
    outcome: args[2] as "dismissed" | "cta_clicked",
    time_ms: args[3] as number,
  };
}

describe("UpgradeWall — dwell-time (upgrade_wall_timing) — web", () => {
  beforeEach(() => {
    dismissedSpy.mockClear();
    ctaSpy.mockClear();
    timingSpy.mockClear();
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("fires upgrade_wall_timing once with outcome='dismissed' on Close click", () => {
    render(<UpgradeWall {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close upgrade dialog/i }));

    expect(timingSpy).toHaveBeenCalledTimes(1);
    const call = lastTimingCall();
    expect(call.gate).toBe("coach");
    expect(call.tier).toBe("premium");
    expect(call.outcome).toBe("dismissed");
    expect(call.time_ms).toBeGreaterThanOrEqual(0);
    // Sanity: a synchronous click in a test environment should be well
    // under 5 seconds. If this ever exceeds it, the timer is broken or
    // we accidentally captured wall-clock instead of monotonic time.
    expect(call.time_ms).toBeLessThan(5000);
  });

  it("fires upgrade_wall_timing once with outcome='cta_clicked' on CTA click", () => {
    render(<UpgradeWall {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /upgrade to premium/i }));

    expect(timingSpy).toHaveBeenCalledTimes(1);
    const call = lastTimingCall();
    expect(call.outcome).toBe("cta_clicked");
    expect(call.time_ms).toBeGreaterThanOrEqual(0);
  });

  it("fires exactly once even when dismiss is triggered twice (dedupe contract)", () => {
    render(<UpgradeWall {...baseProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /close upgrade dialog/i }));

    expect(dismissedSpy).toHaveBeenCalledTimes(1);
    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(lastTimingCall().outcome).toBe("dismissed");
  });

  it("never fires both dismissed and cta_clicked timing in the same lifetime", () => {
    render(<UpgradeWall {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /upgrade to premium/i }));
    // Parent normally calls onDismiss after onUpgrade — simulate by clicking close.
    fireEvent.click(screen.getByRole("button", { name: /close upgrade dialog/i }));

    expect(timingSpy).toHaveBeenCalledTimes(1);
    expect(lastTimingCall().outcome).toBe("cta_clicked");
  });

  it("measures elapsed time from mount, not from event registration", async () => {
    render(<UpgradeWall {...baseProps} />);
    // Wait ~25ms so the elapsed delta is observably non-zero on slow runners.
    await new Promise((r) => setTimeout(r, 25));
    fireEvent.click(screen.getByRole("button", { name: /close upgrade dialog/i }));

    const call = lastTimingCall();
    // Lower bound is generous (10ms) to keep the test non-flaky on heavily
    // loaded CI runners while still proving we didn't reset the timer at
    // event time. Upper bound guards against runaway/wall-clock bugs.
    expect(call.time_ms).toBeGreaterThanOrEqual(10);
    expect(call.time_ms).toBeLessThan(5000);
  });
});

// ---------------------------------------------------------------------------
// iOS fallback — re-mock platform + capacitor before importing UpgradeWall.
// ---------------------------------------------------------------------------
describe("UpgradeWall iOS — dwell-time (upgrade_wall_timing)", () => {
  const dismissedIos = vi.fn();
  const ctaIos = vi.fn();
  const timingIos = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let UpgradeWallIos: any;

  beforeEach(async () => {
    dismissedIos.mockClear();
    ctaIos.mockClear();
    timingIos.mockClear();
    vi.resetModules();
    vi.doMock("@/lib/platform", () => ({
      isIOSNative: () => true,
      isAndroidNative: () => false,
      isNativeMobile: () => true,
    }));
    vi.doMock("@/lib/analytics", () => ({
      analytics: {
        upgradeWallDismissed: (g: string, t: string) => dismissedIos(g, t),
        upgradeWallCtaClicked: (g: string, t: string) => ctaIos(g, t),
        upgradeWallShown: vi.fn(),
        upgradeWallNullReturn: vi.fn(),
        upgradeWallTiming: (g: string, t: string, o: string, ms: number) =>
          timingIos(g, t, o, ms),
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

  it("fires timing with outcome='dismissed' when iOS Close is tapped", () => {
    render(<UpgradeWallIos {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close dialog/i }));

    expect(timingIos).toHaveBeenCalledTimes(1);
    const args = timingIos.mock.calls[0];
    expect(args[0]).toBe("coach");
    expect(args[1]).toBe("premium");
    expect(args[2]).toBe("dismissed");
    expect(args[3]).toBeGreaterThanOrEqual(0);
    expect(args[3]).toBeLessThan(5000);
  });

  it("fires timing with outcome='cta_clicked' when 'Manage on web' is tapped", async () => {
    render(<UpgradeWallIos {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /manage on web/i }));

    await waitFor(() => expect(timingIos).toHaveBeenCalledTimes(1));
    const args = timingIos.mock.calls[0];
    expect(args[2]).toBe("cta_clicked");
    expect(args[3]).toBeGreaterThanOrEqual(0);
  });
});
