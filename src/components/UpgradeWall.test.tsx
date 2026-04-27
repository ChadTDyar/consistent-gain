import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpgradeWall } from "./UpgradeWall";

// Force the web (non-iOS) code path so the modal actually renders.
vi.mock("@/lib/platform", () => ({
  isIOSNative: () => false,
  isAndroidNative: () => false,
  isNativeMobile: () => false,
}));

const baseProps = {
  headline: "Unlock Coach",
  body: "Upgrade to access AI Coach.",
  cta: "Upgrade to Pro",
  onUpgrade: vi.fn(),
  onDismiss: vi.fn(),
};

describe("UpgradeWall accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders as an accessible modal dialog", () => {
    render(<UpgradeWall {...baseProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "upgrade-wall-title");
  });

  it("places initial focus on the Close button (safe default, not the upgrade CTA)", () => {
    render(<UpgradeWall {...baseProps} />);
    const closeBtn = screen.getByRole("button", { name: /close upgrade dialog/i });
    const upgradeBtn = screen.getByRole("button", { name: /upgrade to pro/i });
    // Safety policy: prevent accidental Enter-to-purchase on passive opens.
    expect(document.activeElement).toBe(closeBtn);
    expect(document.activeElement).not.toBe(upgradeBtn);
  });

  it("calls onDismiss when Escape is pressed", () => {
    const onDismiss = vi.fn();
    render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("traps Tab focus: Tab from last focusable cycles to the first", async () => {
    const user = userEvent.setup();
    render(<UpgradeWall {...baseProps} />);

    const closeBtn = screen.getByRole("button", { name: /close upgrade dialog/i });
    const upgradeBtn = screen.getByRole("button", { name: /upgrade to pro/i });

    // Move focus to the last focusable element (the upgrade CTA).
    upgradeBtn.focus();
    expect(document.activeElement).toBe(upgradeBtn);

    // Tab forward should wrap back to the first focusable element.
    await user.tab();
    expect(document.activeElement).toBe(closeBtn);
  });

  it("traps Shift+Tab: Shift+Tab from first focusable cycles to the last", async () => {
    const user = userEvent.setup();
    render(<UpgradeWall {...baseProps} />);

    const closeBtn = screen.getByRole("button", { name: /close upgrade dialog/i });
    const upgradeBtn = screen.getByRole("button", { name: /upgrade to pro/i });

    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(upgradeBtn);
  });

  it("restores focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(<UpgradeWall {...baseProps} />);
    // Modal stole focus
    expect(document.activeElement).not.toBe(trigger);

    unmount();
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  describe("outside-click dismissal", () => {
    it("dismisses when both pointerdown and pointerup occur on the backdrop", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");

      fireEvent.pointerDown(backdrop, { target: backdrop });
      fireEvent.pointerUp(backdrop, { target: backdrop });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does NOT dismiss when pointerdown starts inside the panel and releases on the backdrop (drag-out)", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      const heading = screen.getByText(baseProps.headline);

      // User starts a text selection inside the panel, then releases outside.
      fireEvent.pointerDown(heading);
      fireEvent.pointerUp(backdrop, { target: backdrop });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("does NOT dismiss when clicking inside the panel", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const heading = screen.getByText(baseProps.headline);

      fireEvent.pointerDown(heading);
      fireEvent.pointerUp(heading);

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("preserves the focus trap: outside-click dismiss restores focus to the previously focused element", () => {
      const trigger = document.createElement("button");
      trigger.textContent = "Open";
      document.body.appendChild(trigger);
      trigger.focus();

      const onDismiss = vi.fn();
      const { rerender } = render(
        <UpgradeWall {...baseProps} onDismiss={onDismiss} />
      );
      const backdrop = screen.getByRole("dialog");

      fireEvent.pointerDown(backdrop, { target: backdrop });
      fireEvent.pointerUp(backdrop, { target: backdrop });
      expect(onDismiss).toHaveBeenCalledTimes(1);

      // Simulate parent unmounting the modal in response to onDismiss.
      rerender(<div />);
      expect(document.activeElement).toBe(trigger);

      document.body.removeChild(trigger);
    });
  });
});
