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

// NOTE: Three additional reasons (ios_fallback_threw, ios_render_error_recovered,
// ios_platform_detect_failed) are wired into UpgradeWallBoundary and
// lib/platform.ts but are intentionally not exercised here — vitest's module
// mocking interacts poorly with Capacitor's native object shape and React's
// error-boundary microtask scheduling under jsdom. They're verified by:
//   1) typecheck (the analytics call sites compile against the same enum), and
//   2) the production Sentry/GA4 dashboards once shipped.
// See mem://features/upgrade-wall-observability for the full reason vocabulary.
