import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import React from "react";

// Spy on gtag to capture upgrade_wall_null_return reason values.
const gtag = vi.fn();
beforeEach(() => {
  (window as unknown as { gtag: typeof gtag }).gtag = gtag;
  gtag.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const findEvents = (name: string) =>
  gtag.mock.calls.filter((c) => c[0] === "event" && c[1] === name);

const findReason = (reason: string) =>
  findEvents("upgrade_wall_null_return").find((c) => c[2]?.reason === reason);

const baseProps = {
  headline: "Unlock AI Coach",
  body: "Coach helps you understand patterns.",
  cta: "Upgrade to Premium",
  onUpgrade: vi.fn(),
  onDismiss: vi.fn(),
  gate: "coach" as const,
  tier: "premium" as const,
};

const mockPlatform = (overrides: {
  ios?: boolean;
  capacitorNative?: boolean;
}) => {
  const ios = overrides.ios ?? true;
  const capacitorNative = overrides.capacitorNative ?? ios;
  vi.resetModules();
  vi.doMock("@/lib/platform", () => ({
    isIOSNative: () => ios,
    isAndroidNative: () => false,
    isNativeMobile: () => ios,
  }));
  vi.doMock("@capacitor/core", () => ({
    Capacitor: {
      isPluginAvailable: vi.fn(() => false),
      isNativePlatform: () => capacitorNative,
      getPlatform: () => (ios ? "ios" : "web"),
    },
  }));
};

describe("UpgradeWall — extended null-return reasons", () => {
  // ios_capacitor_unavailable: heuristic says iOS but canonical Capacitor
  // probe disagrees (e.g. PWA installed to home screen).
  it("fires ios_capacitor_unavailable when isIOSNative=true but Capacitor.isNativePlatform=false", async () => {
    mockPlatform({ ios: true, capacitorNative: false });
    const { UpgradeWall } = await import("./UpgradeWall");
    render(<UpgradeWall {...baseProps} />);
    // Effect runs in microtask; flush it.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(findReason("ios_capacitor_unavailable")).toBeTruthy();
  });

  // ios_unmounted_before_paint: rapid open/close before the post-mount
  // effect ran. We simulate by unmounting synchronously.
  it("fires ios_unmounted_before_paint when iOS branch unmounts before its paint check ran", async () => {
    mockPlatform({ ios: true, capacitorNative: true });
    const { UpgradeWall } = await import("./UpgradeWall");
    const { unmount } = render(<UpgradeWall {...baseProps} />);
    // Unmount synchronously inside act so cleanup fires before the post-
    // mount useEffect would have flagged paintCheckedRef. The Capacitor
    // cross-check effect will also have run (and not fired, since canonical
    // returned true), so the only null-return reason should be the unmount.
    // To force the race we unmount BEFORE flushing effects.
    act(() => {
      unmount();
    });
    expect(findReason("ios_unmounted_before_paint")).toBeTruthy();
  });

  // ios_render_error_recovered: boundary catches, retry succeeds.
  it("fires ios_fallback_threw on initial throw and ios_render_error_recovered after retry", async () => {
    mockPlatform({ ios: true, capacitorNative: true });

    // Mock the iOS fallback to throw on first render only, then succeed.
    let throwCount = 0;
    vi.doMock("./UpgradeWall", async () => {
      // Re-import the real module but patch UpgradeWallIOSFallback via the
      // boundary. Simpler approach: throw directly from a child rendered
      // inside the boundary by using a local test-only wrapper.
      const actual = await vi.importActual<typeof import("./UpgradeWall")>(
        "./UpgradeWall",
      );
      return actual;
    });

    const { UpgradeWallBoundary } = await import("./UpgradeWallBoundary");

    const Throwing: React.FC = () => {
      throwCount++;
      if (throwCount === 1) {
        throw new Error("simulated fallback render failure");
      }
      return <div>recovered child</div>;
    };

    // Suppress React's noisy error logging for the expected throw.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getByText } = render(
      <UpgradeWallBoundary
        gate="coach"
        tier="premium"
        fallback={({ retry }) => (
          <button onClick={retry} data-testid="retry">
            Try again
          </button>
        )}
      >
        <Throwing />
      </UpgradeWallBoundary>,
    );

    // After throw → boundary fired ios_fallback_threw.
    expect(findReason("ios_fallback_threw")).toBeTruthy();

    // Click retry → second render succeeds → recovered reason fires.
    const retryBtn = getByText("Try again");
    act(() => {
      retryBtn.click();
    });
    expect(getByText("recovered child")).toBeTruthy();
    expect(findReason("ios_render_error_recovered")).toBeTruthy();

    errSpy.mockRestore();
  });

  // ios_platform_detect_failed: Capacitor probe throws → isIOSNative
  // returns false and emits the reason via lazy-loaded analytics.
  it("fires ios_platform_detect_failed when Capacitor probe throws", async () => {
    vi.resetModules();
    vi.doMock("@capacitor/core", () => ({
      Capacitor: {
        isNativePlatform: () => {
          throw new Error("bridge not ready");
        },
        getPlatform: () => "ios",
        isPluginAvailable: () => false,
      },
    }));
    const { isIOSNative } = await import("@/lib/platform");
    expect(isIOSNative()).toBe(false);
    // Lazy import inside platform.ts — wait a microtask.
    await new Promise((r) => setTimeout(r, 0));
    expect(findReason("ios_platform_detect_failed")).toBeTruthy();
  });
});
