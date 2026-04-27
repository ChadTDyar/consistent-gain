import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

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
    await waitFor(() => expect(browserOpen).toHaveBeenCalledTimes(1));
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

  it("dialog exposes its accessible name and description via per-instance ids", () => {
    render(<UpgradeWall {...baseProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const labelId = dialog.getAttribute("aria-labelledby")!;
    const descIds = dialog.getAttribute("aria-describedby")!.split(/\s+/);
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId)).toHaveTextContent(baseProps.headline);
    const concatenated = descIds
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(concatenated).toContain(baseProps.body);
  });

  it("aria-describedby includes the preview block when shown (iOS)", () => {
    render(<UpgradeWall {...baseProps} streakRepairPreview />);
    const dialog = screen.getByRole("dialog");
    const descIds = dialog.getAttribute("aria-describedby")!.split(/\s+/);
    expect(descIds.length).toBeGreaterThanOrEqual(2);
    const concatenated = descIds
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(concatenated).toMatch(/streak repair/i);
  });

  it("renders a polite live region for the iOS fallback", () => {
    render(<UpgradeWall {...baseProps} />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
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

describe("UpgradeWall iOS — focus restoration safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("restores focus to the trigger element when the iOS fallback unmounts", async () => {
    // Set up a real trigger button so we have a meaningful element to
    // restore to. Without restoration, focus drops to <body> and SR users
    // are stranded.
    const trigger = document.createElement("button");
    trigger.textContent = "Open paywall";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(<UpgradeWall {...baseProps} />);
    // After mount the iOS Close (X) takes focus per WCAG-safe initial focus.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /close dialog/i })).toHaveFocus()
    );
    unmount();
    // Restoration must put focus back on the captured trigger.
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  it("falls back to the <main> landmark when the trigger is no longer in the DOM", async () => {
    // Simulates the "trigger card unmounts while the modal is open"
    // scenario (e.g. a locked card that disappears after upgrade or a
    // route change that swaps the page content). Without a fallback,
    // focus would land on <body> and the SR user gets silence.
    const main = document.createElement("main");
    document.body.appendChild(main);
    const trigger = document.createElement("button");
    main.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<UpgradeWall {...baseProps} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /close dialog/i })).toHaveFocus()
    );
    // Yank the trigger BEFORE unmounting the modal.
    main.removeChild(trigger);
    unmount();
    // <main> should now hold focus (with tabIndex=-1 set by the helper so
    // it's programmatically focusable).
    expect(document.activeElement).toBe(main);
    expect(main.tabIndex).toBe(-1);
    document.body.removeChild(main);
  });

  it("honours an explicit returnFocus ref override on iOS", async () => {
    // Caller-supplied override wins over the auto-captured trigger. This
    // matters when the trigger unmounts (handled above) AND when the
    // caller wants focus to land somewhere intentional (e.g. a "Try
    // again" button revealed after dismissal).
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const override = document.createElement("button");
    override.textContent = "Override";
    document.body.appendChild(override);

    const ref = { current: override };
    const { unmount } = render(<UpgradeWall {...baseProps} returnFocus={ref} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /close dialog/i })).toHaveFocus()
    );
    unmount();
    expect(document.activeElement).toBe(override);
    document.body.removeChild(trigger);
    document.body.removeChild(override);
  });

  it("opts out of restoration when returnFocus={null} is passed", async () => {
    // `null` is the deliberate opt-out signal. We accept that focus may
    // land on <body> in this case — the caller has explicitly told us
    // they don't want restoration (rare; only for very deliberate flows
    // like a redirect-on-dismiss).
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<UpgradeWall {...baseProps} returnFocus={null} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /close dialog/i })).toHaveFocus()
    );
    unmount();
    // The variant cleanup respects null and skips restoration. The parent
    // safety net ALSO sees null and respects it. Body is the expected
    // landing spot.
    expect(document.activeElement).toBe(document.body);
    document.body.removeChild(trigger);
  });
});
