/**
 * Verifies the iOS UpgradeWall NEVER returns null — even when the portal
 * target (document.body) is missing, an inline coming-soon notice is shown
 * with App-Review-safe messaging.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, within, cleanup } from "@testing-library/react";
import { UpgradeWall } from "./UpgradeWall";

vi.mock("@/lib/platform", () => ({
  isIOSNative: () => true,
}));

vi.mock("@/lib/analytics", () => ({
  analytics: {
    upgradeWallShown: vi.fn(),
    upgradeWallDismissed: vi.fn(),
    upgradeWallCtaClicked: vi.fn(),
    upgradeWallTiming: vi.fn(),
    upgradeWallNullReturn: vi.fn(),
  },
}));

describe("UpgradeWall iOS inline fallback (no portal target)", () => {
  let originalBody: HTMLElement;
  beforeEach(() => {
    originalBody = document.body;
  });
  afterEach(() => {
    // Restore body so cleanup doesn't fail.
    if (!document.body) {
      document.documentElement.appendChild(originalBody);
    }
    cleanup();
    vi.clearAllMocks();
  });

  it("renders inline coming-soon notice when document.body is detached", async () => {
    // Detach body to simulate a hostile pre-hydration / test harness state.
    const detachedBody = document.body;
    document.documentElement.removeChild(detachedBody);

    // Render into a fresh container attached to documentElement so React has
    // a mount target even though body is missing.
    const container = document.createElement("div");
    document.documentElement.appendChild(container);

    const { unmount } = render(
      <UpgradeWall
        headline="Unlock AI Coach"
        body="Get personalized accountability."
        cta="Upgrade to Premium"
        onUpgrade={() => {}}
        onDismiss={() => {}}
        gate="coach"
        tier="premium"
      />,
      { container },
    );

    const scoped = within(container);
    // Inline notice must be visible — never null.
    expect(scoped.getByRole("dialog")).toBeTruthy();
    expect(scoped.getByText("Unlock AI Coach")).toBeTruthy();
    // App-Review-safe coming-soon copy is present.
    expect(
      scoped.getByText(/In-app purchases on iOS will be available/i),
    ).toBeTruthy();
    // Reader-rule action present.
    expect(scoped.getByRole("button", { name: /Manage on web/i })).toBeTruthy();
    // No price or purchase CTA labels.
    expect(scoped.queryByText(/\$/)).toBeNull();

    // Analytics records the portal-target-missing reason.
    const { analytics } = await import("@/lib/analytics");
    expect(analytics.upgradeWallNullReturn).toHaveBeenCalledWith(
      "coach",
      "pro",
      "ios_portal_target_missing",
    );

    unmount();
    document.documentElement.appendChild(detachedBody);
  });
});
