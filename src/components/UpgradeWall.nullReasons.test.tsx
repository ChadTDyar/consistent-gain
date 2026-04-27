import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import React from "react";

// Mock analytics module so we capture the reason values regardless of
// whether window.gtag is wired in jsdom.
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
  // probe disagrees (e.g. PWA installed to home screen). Verifies the
  // post-mount cross-check effect inside IOSBranchGuard.
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
});

// Boundary unit test — runs in its own describe so module mocks don't
// interfere with the IOSBranchGuard test above.
describe("UpgradeWallBoundary — error recovery beacons", () => {
  beforeEach(() => {
    upgradeWallNullReturn.mockClear();
  });

  it("emits ios_fallback_threw on initial throw and ios_render_error_recovered on retry", async () => {
    // No vi.resetModules here — keep the top-level mock active so the
    // boundary's analytics import resolves to our shared spy.
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

    let rendered: ReturnType<typeof render>;
    await act(async () => {
      rendered = render(
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
    });

    expect(reasons()).toContain("ios_fallback_threw");

    const retryBtn = rendered!.getByText("Try again");
    await act(async () => {
      retryBtn.click();
    });
    expect(rendered!.getByText("recovered child")).toBeTruthy();
    expect(reasons()).toContain("ios_render_error_recovered");

    errSpy.mockRestore();
  });
});

// Direct unit on the platform helper — keeps the Capacitor mock scoped to a
// single test file (lib/platform.test.ts would be cleaner long-term but this
// keeps the reason-vocabulary tests colocated).
describe("isIOSNative — defensive Capacitor probe", () => {
  it("returns false (and does not throw) when Capacitor.isNativePlatform throws", async () => {
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
    const platform = await import("@/lib/platform");
    expect(() => platform.isIOSNative()).not.toThrow();
    expect(platform.isIOSNative()).toBe(false);
  });
});
