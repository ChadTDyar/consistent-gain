import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// Force the iOS-native code path so the fallback modal renders instead of
// the web upgrade wall. Must be hoisted via vi.mock before the import below.
vi.mock("@/lib/platform", () => ({
  isIOSNative: () => true,
  isAndroidNative: () => false,
  isNativeMobile: () => true,
}));

// Capacitor.isPluginAvailable controls which Browser path runs. Default to
// true; individual tests override.
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isPluginAvailable: vi.fn(() => true),
    isNativePlatform: () => true,
    getPlatform: () => "ios",
  },
}));

// Browser plugin: spy on .open so we can assert the Reader-rule URL.
const browserOpen = vi.fn().mockResolvedValue(undefined);
vi.mock("@capacitor/browser", () => ({
  Browser: { open: (...args: unknown[]) => browserOpen(...args) },
}));

import { UpgradeWall } from "./UpgradeWall";

const baseProps = {
  headline: "Unlock AI Coach",
  body: "AI Coach helps you understand your patterns and adapt your routine.",
  cta: "Upgrade to Premium",
  onUpgrade: vi.fn(),
  onDismiss: vi.fn(),
};

describe("UpgradeWall — iOS native fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    browserOpen.mockClear();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders an inform-only modal instead of returning null", () => {
    render(<UpgradeWall {...baseProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(baseProps.headline)).toBeInTheDocument();
    expect(screen.getByText(baseProps.body)).toBeInTheDocument();
  });

  it("does NOT show the web purchase CTA on iOS", () => {
    render(<UpgradeWall {...baseProps} cta="Upgrade to Premium" />);
    // The web modal would render the original cta text inside a button. Make
    // sure that exact button is absent.
    expect(
      screen.queryByRole("button", { name: /upgrade to premium/i })
    ).toBeNull();
    // And no padlock/cta marker either.
    expect(screen.queryByText(/🔒/)).toBeNull();
  });

  it("does NOT mention price anywhere", () => {
    render(<UpgradeWall {...baseProps} />);
    const dialog = screen.getByRole("dialog");
    const text = dialog.textContent ?? "";
    // Spot-check: no $, no /mo, no "month", no specific tier prices used
    // elsewhere in the app ($3.99, $7.99).
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toMatch(/\/mo\b/i);
    expect(text).not.toMatch(/per month/i);
    expect(text).not.toMatch(/\$3\.99|\$7\.99/);
  });

  it("offers the App-Review-safe action set: Manage on web + Manage in Settings + Close", () => {
    render(<UpgradeWall {...baseProps} />);
    expect(
      screen.getByRole("button", { name: /manage on web/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /manage subscription in settings/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close dialog/i })
    ).toBeInTheDocument();
  });

  it("'Manage on web' opens the Reader-rule /account URL via Capacitor Browser", async () => {
    render(<UpgradeWall {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /manage on web/i }));
    // Wait a microtask for the dynamic import + promise to resolve.
    await Promise.resolve();
    await Promise.resolve();
    expect(browserOpen).toHaveBeenCalledTimes(1);
    const arg = browserOpen.mock.calls[0][0] as { url: string };
    expect(arg.url).toBe("https://momentumfit.app/account");
    // Crucially, NOT the pricing/checkout page.
    expect(arg.url).not.toMatch(/pricing|checkout|buy|subscribe/i);
  });

  it("'Manage subscription in Settings' navigates to the iOS app-settings: scheme", () => {
    // jsdom throws on assignment to location.href for unsupported schemes;
    // stub the setter so we can observe the value without a navigation error.
    const original = Object.getOwnPropertyDescriptor(window, "location");
    let assigned = "";
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...window.location,
        set href(v: string) {
          assigned = v;
        },
        get href() {
          return assigned;
        },
      },
    });

    try {
      render(<UpgradeWall {...baseProps} />);
      fireEvent.click(
        screen.getByRole("button", { name: /manage subscription in settings/i })
      );
      expect(assigned).toBe("app-settings:");
    } finally {
      if (original) Object.defineProperty(window, "location", original);
    }
  });

  it("Escape key dismisses the iOS fallback", () => {
    const onDismiss = vi.fn();
    render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("Close button dismisses the iOS fallback", () => {
    const onDismiss = vi.fn();
    render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: /close dialog/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("places initial focus on the Close button (safe default, never on Manage on web)", () => {
    render(<UpgradeWall {...baseProps} />);
    const closeBtn = screen.getByRole("button", { name: /close dialog/i });
    expect(document.activeElement).toBe(closeBtn);
  });

  it("dialog exposes its accessible name and description", () => {
    render(<UpgradeWall {...baseProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "upgrade-wall-ios-title");
    expect(dialog).toHaveAttribute("aria-describedby", "upgrade-wall-ios-desc");
    expect(document.getElementById("upgrade-wall-ios-title")).toHaveTextContent(
      baseProps.headline
    );
    expect(document.getElementById("upgrade-wall-ios-desc")).toHaveTextContent(
      baseProps.body
    );
  });

  it("renders the coach preview block when coachPreview is true", () => {
    render(<UpgradeWall {...baseProps} coachPreview />);
    expect(screen.getByText(/what ai coach does/i)).toBeInTheDocument();
  });

  it("renders the streak repair preview block when streakRepairPreview is true", () => {
    render(<UpgradeWall {...baseProps} streakRepairPreview />);
    expect(screen.getByText(/what streak repair does/i)).toBeInTheDocument();
  });
});
