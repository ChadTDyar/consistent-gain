import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";

// Spy on gtag so we can assert event payloads directly.
const gtag = vi.fn();
beforeEach(() => {
  (window as unknown as { gtag: typeof gtag }).gtag = gtag;
  gtag.mockClear();
});
afterEach(() => {
  cleanup();
});

// Each test re-imports UpgradeWall after re-mocking platform, so the
// `isIOSNative()` value used by the module is the one we want.
const renderWithPlatform = async (ios: boolean, props: Record<string, unknown> = {}) => {
  vi.resetModules();
  vi.doMock("@/lib/platform", () => ({
    isIOSNative: () => ios,
    isAndroidNative: () => false,
    isNativeMobile: () => ios,
  }));
  vi.doMock("@capacitor/core", () => ({
    Capacitor: {
      isPluginAvailable: vi.fn(() => false),
      isNativePlatform: () => ios,
      getPlatform: () => (ios ? "ios" : "web"),
    },
  }));
  const { UpgradeWall } = await import("./UpgradeWall");
  const baseProps = {
    headline: "Unlock AI Coach",
    body: "Coach helps you understand patterns.",
    cta: "Upgrade to Premium",
    onUpgrade: vi.fn(),
    onDismiss: vi.fn(),
    gate: "coach" as const,
    tier: "premium" as const,
    ...props,
  };
  return render(<UpgradeWall {...baseProps} />);
};

const findEvent = (name: string) =>
  gtag.mock.calls.find((c) => c[0] === "event" && c[1] === name);

describe("UpgradeWall — render observability", () => {
  it("fires upgrade_wall_shown with variant=web on the web/Android path", async () => {
    await renderWithPlatform(false);
    const ev = findEvent("upgrade_wall_shown");
    expect(ev).toBeTruthy();
    expect(ev?.[2]).toMatchObject({
      gate: "coach",
      tier: "premium",
      variant: "web",
      event_label: "coach:premium:web",
    });
  });

  it("fires upgrade_wall_shown with variant=ios_fallback on iOS native", async () => {
    await renderWithPlatform(true);
    const ev = findEvent("upgrade_wall_shown");
    expect(ev).toBeTruthy();
    expect(ev?.[2]).toMatchObject({
      gate: "coach",
      tier: "premium",
      variant: "ios_fallback",
      event_label: "coach:premium:ios_fallback",
    });
  });

  it("fires upgrade_wall_shown exactly once even if props change", async () => {
    vi.resetModules();
    vi.doMock("@/lib/platform", () => ({
      isIOSNative: () => false,
      isAndroidNative: () => false,
      isNativeMobile: () => false,
    }));
    vi.doMock("@capacitor/core", () => ({
      Capacitor: {
        isPluginAvailable: vi.fn(() => false),
        isNativePlatform: () => false,
        getPlatform: () => "web",
      },
    }));
    const { UpgradeWall } = await import("./UpgradeWall");
    const props = {
      headline: "h",
      body: "b",
      cta: "c",
      onUpgrade: vi.fn(),
      onDismiss: vi.fn(),
      gate: "coach" as const,
      tier: "premium" as const,
    };
    const { rerender } = render(<UpgradeWall {...props} />);
    rerender(<UpgradeWall {...props} body="b2" />);
    rerender(<UpgradeWall {...props} body="b3" />);
    const shown = gtag.mock.calls.filter(
      (c) => c[0] === "event" && c[1] === "upgrade_wall_shown"
    );
    expect(shown).toHaveLength(1);
  });

  it("does NOT fire upgrade_wall_null_return when the iOS fallback renders normally", async () => {
    await renderWithPlatform(true);
    expect(findEvent("upgrade_wall_null_return")).toBeUndefined();
    // And the dialog actually exists in the DOM, so the post-mount guard is
    // also satisfied.
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  });
});
