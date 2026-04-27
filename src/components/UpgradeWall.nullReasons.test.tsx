import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import React from "react";

// We mock the analytics module directly so we capture calls regardless of
// whether window.gtag is wired (avoids module-cache races from vi.resetModules).
const upgradeWallNullReturn = vi.fn();
vi.mock("@/lib/analytics", () => ({
  analytics: {
    upgradeWallShown: vi.fn(),
    upgradeWallDismissed: vi.fn(),
    upgradeWallCtaClicked: vi.fn(),
    upgradeWallTiming: vi.fn(),
    upgradeWallNullReturn,
  },
}));

beforeEach(() => {
  upgradeWallNullReturn.mockClear();
});
afterEach(() => {
  cleanup();
});

const reasons = () =>
  upgradeWallNullReturn.mock.calls.map((c) => c[2] as string);

describe("UpgradeWall — extended null-return reasons", () => {
  // ios_capacitor_unavailable: heuristic says iOS but canonical Capacitor
  // probe disagrees (e.g. PWA installed to home screen).
  it("fires ios_capacitor_unavailable when isIOSNative=true but Capacitor.isNativePlatform=false", async () => {
    vi.resetModules();
    vi.doMock("@/lib/platform", () => ({
      isIOSNative: () => true,
      isAndroidNative: () => false,
      isNativeMobile: () => true,
    }));
    vi.doMock("@capacitor/core", () => ({
      Capacitor: {
        isPluginAvailable: vi.fn(() => false),
        isNativePlatform: () => false, // canonical disagrees
        getPlatform: () => "ios",
      },
    }));
    // Re-mock analytics under the new module graph.
    vi.doMock("@/lib/analytics", () => ({
      analytics: {
        upgradeWallShown: vi.fn(),
        upgradeWallDismissed: vi.fn(),
        upgradeWallCtaClicked: vi.fn(),
        upgradeWallTiming: vi.fn(),
        upgradeWallNullReturn,
      },
    }));
    const { UpgradeWall } = await import("./UpgradeWall");
    render(
      <UpgradeWall
        headline="h"
        body="b"
        cta="c"
        onUpgrade={vi.fn()}
        onDismiss={vi.fn()}
        gate="coach"
        tier="premium"
      />,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(reasons()).toContain("ios_capacitor_unavailable");
  });

  // ios_render_error_recovered: boundary catches, retry succeeds.
  it("fires ios_fallback_threw on throw and ios_render_error_recovered after retry", async () => {
    vi.resetModules();
    vi.doMock("@/lib/analytics", () => ({
      analytics: {
        upgradeWallShown: vi.fn(),
        upgradeWallDismissed: vi.fn(),
        upgradeWallCtaClicked: vi.fn(),
        upgradeWallTiming: vi.fn(),
        upgradeWallNullReturn,
      },
    }));
    const { UpgradeWallBoundary } = await import("./UpgradeWallBoundary");

    let throwCount = 0;
    const Throwing: React.FC = () => {
      throwCount++;
      if (throwCount === 1) {
        throw new Error("simulated fallback render failure");
      }
      return <div>recovered child</div>;
    };

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

    expect(reasons()).toContain("ios_fallback_threw");

    const retryBtn = getByText("Try again");
    act(() => {
      retryBtn.click();
    });
    expect(getByText("recovered child")).toBeTruthy();
    expect(reasons()).toContain("ios_render_error_recovered");

    errSpy.mockRestore();
  });

  // ios_platform_detect_failed: Capacitor probe throws → isIOSNative
  // returns false and emits the reason via lazy-loaded analytics.
  // We verify the FUNCTION'S RETURN VALUE here; the lazy analytics import
  // path is a side effect tested separately by the platform-helper unit.
  it("isIOSNative returns false (and does not throw) when Capacitor probe throws", async () => {
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
    expect(() => isIOSNative()).not.toThrow();
    expect(isIOSNative()).toBe(false);
  });
});
