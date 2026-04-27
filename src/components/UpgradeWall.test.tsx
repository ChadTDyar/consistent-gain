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

  it("renders as an accessible modal dialog with per-instance aria ids", () => {
    render(<UpgradeWall {...baseProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // IDs come from useId() so they are non-empty and unique per instance,
    // but the exact value is implementation-defined — assert via resolution.
    const labelId = dialog.getAttribute("aria-labelledby");
    const descId = dialog.getAttribute("aria-describedby");
    expect(labelId).toBeTruthy();
    expect(descId).toBeTruthy();
  });

  it("aria-labelledby points to the headline; aria-describedby includes the body copy", () => {
    // Screen readers announce the dialog as <name> + <description>. If either
    // referenced id is missing or points to the wrong element, the announcement
    // collapses to "dialog" with no context — useless for blind users.
    render(<UpgradeWall {...baseProps} />);
    const dialog = screen.getByRole("dialog");
    const labelId = dialog.getAttribute("aria-labelledby")!;
    const descIds = dialog.getAttribute("aria-describedby")!.split(/\s+/);
    expect(document.getElementById(labelId)).toHaveTextContent(baseProps.headline);
    // describedby is space-separated and may include preview ids; the body
    // must be one of the referenced elements.
    const descTexts = descIds
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(descTexts).toContain(baseProps.body);
  });

  it("aria-describedby grows to include the preview block when shown", () => {
    // Without this, SR users hearing only "headline + body" miss the most
    // persuasive part of the upgrade pitch (the example dialogue or repair
    // explanation).
    render(<UpgradeWall {...baseProps} coachPreview />);
    const dialog = screen.getByRole("dialog");
    const descIds = dialog.getAttribute("aria-describedby")!.split(/\s+/);
    expect(descIds.length).toBeGreaterThanOrEqual(2);
    const concatenated = descIds
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(concatenated).toContain(baseProps.body);
    expect(concatenated).toMatch(/AI Coach does/i);
  });

  it("two stacked UpgradeWalls do not produce colliding aria ids", () => {
    // Hardcoded ids would resolve to the wrong element when two modals exist.
    // useId() guarantees uniqueness; verify the rendered ids differ.
    render(
      <>
        <UpgradeWall {...baseProps} headline="First" />
        <UpgradeWall {...baseProps} headline="Second" />
      </>
    );
    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(2);
    const id1 = dialogs[0].getAttribute("aria-labelledby");
    const id2 = dialogs[1].getAttribute("aria-labelledby");
    expect(id1).not.toBe(id2);
    expect(document.getElementById(id1!)).toHaveTextContent("First");
    expect(document.getElementById(id2!)).toHaveTextContent("Second");
  });

  it("renders a polite live region that announces the dialog opening", async () => {
    // Belt-and-suspenders for AT that miss the role=dialog mount announcement.
    // Populated ~100ms after mount so it registers as a live update, not
    // initial DOM (which would race with and double-speak the headline).
    vi.useFakeTimers();
    render(<UpgradeWall {...baseProps} />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    // Initially empty so the AT doesn't double-announce on mount.
    expect(liveRegion.textContent).toBe("");
    vi.advanceTimersByTime(150);
    expect(liveRegion.textContent).toContain(baseProps.headline);
    expect(liveRegion.textContent).toContain(baseProps.body);
    vi.useRealTimers();
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

  describe("focus restoration to the trigger button", () => {
    // Helper: simulate a real "trigger button opens modal" lifecycle.
    const renderWithTrigger = (label = "Open upgrade") => {
      const trigger = document.createElement("button");
      trigger.textContent = label;
      document.body.appendChild(trigger);
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      return trigger;
    };

    it("restores focus to the trigger after dismissal via Escape", () => {
      const trigger = renderWithTrigger();
      const onDismiss = vi.fn();
      const { rerender } = render(
        <UpgradeWall {...baseProps} onDismiss={onDismiss} />
      );
      expect(document.activeElement).not.toBe(trigger);

      fireEvent.keyDown(document, { key: "Escape" });
      rerender(<div />);

      expect(document.activeElement).toBe(trigger);
      document.body.removeChild(trigger);
    });

    it("restores focus to the trigger after clicking the Close button", () => {
      const trigger = renderWithTrigger();
      const onDismiss = vi.fn();
      const { rerender } = render(
        <UpgradeWall {...baseProps} onDismiss={onDismiss} />
      );

      fireEvent.click(screen.getByRole("button", { name: /close upgrade dialog/i }));
      rerender(<div />);

      expect(document.activeElement).toBe(trigger);
      document.body.removeChild(trigger);
    });

    it("restores focus to the trigger after outside-click dismissal", () => {
      const trigger = renderWithTrigger();
      const onDismiss = vi.fn();
      const { rerender } = render(
        <UpgradeWall {...baseProps} onDismiss={onDismiss} />
      );
      const backdrop = screen.getByRole("dialog");

      fireEvent.pointerDown(backdrop, { target: backdrop });
      fireEvent.pointerUp(backdrop, { target: backdrop });
      rerender(<div />);

      expect(document.activeElement).toBe(trigger);
      document.body.removeChild(trigger);
    });

    it("restores focus to the trigger after the user clicks the Upgrade CTA", () => {
      const trigger = renderWithTrigger();
      const onUpgrade = vi.fn();
      const { rerender } = render(
        <UpgradeWall {...baseProps} onUpgrade={onUpgrade} />
      );

      fireEvent.click(screen.getByRole("button", { name: /upgrade to pro/i }));
      // Parent typically unmounts the modal once the upgrade flow starts.
      rerender(<div />);

      expect(onUpgrade).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(trigger);
      document.body.removeChild(trigger);
    });

    it("does NOT attempt to focus a trigger that was removed from the DOM while the modal was open", () => {
      const trigger = renderWithTrigger();
      const { rerender } = render(<UpgradeWall {...baseProps} />);

      // Parent removes the trigger button before the modal closes.
      document.body.removeChild(trigger);

      // Should not throw and should not leave focus on the now-detached node.
      expect(() => rerender(<div />)).not.toThrow();
      expect(document.activeElement).not.toBe(trigger);
    });

    it("survives onDismiss prop identity changes without re-capturing focus", () => {
      // Regression guard: the trap effect must run mount-only so a parent that
      // recreates onDismiss on every render doesn't cause previouslyFocused to
      // be re-captured to the close button (which would break trigger restoration).
      const trigger = renderWithTrigger();
      const { rerender } = render(
        <UpgradeWall {...baseProps} onDismiss={() => {}} />
      );

      // Force several rerenders with brand-new onDismiss identities.
      rerender(<UpgradeWall {...baseProps} onDismiss={() => {}} />);
      rerender(<UpgradeWall {...baseProps} onDismiss={() => {}} />);

      // Unmount and verify focus still goes back to the original trigger.
      rerender(<div />);
      expect(document.activeElement).toBe(trigger);
      document.body.removeChild(trigger);
    });

    it("returnFocus prop (DOM node) overrides the auto-captured trigger", () => {
      // Use case: the trigger card is unmounted after upgrade. Caller passes a
      // stable nearby element so SR/keyboard users still land somewhere sane.
      const trigger = renderWithTrigger();
      const fallback = document.createElement("button");
      fallback.textContent = "Fallback target";
      document.body.appendChild(fallback);

      const { rerender } = render(
        <UpgradeWall {...baseProps} returnFocus={fallback} />
      );

      fireEvent.keyDown(document, { key: "Escape" });
      rerender(<div />);

      expect(document.activeElement).toBe(fallback);
      expect(document.activeElement).not.toBe(trigger);
      document.body.removeChild(trigger);
      document.body.removeChild(fallback);
    });

    it("returnFocus prop (React ref) is dereferenced at unmount", () => {
      const trigger = renderWithTrigger();
      const fallback = document.createElement("button");
      document.body.appendChild(fallback);
      const ref = { current: fallback };

      const { rerender } = render(
        <UpgradeWall {...baseProps} returnFocus={ref} />
      );

      fireEvent.keyDown(document, { key: "Escape" });
      rerender(<div />);

      expect(document.activeElement).toBe(fallback);
      document.body.removeChild(trigger);
      document.body.removeChild(fallback);
    });

    it("returnFocus={null} opts out of focus restoration entirely", () => {
      // Rare, deliberate: caller wants focus to land wherever the browser puts
      // it (e.g. a navigation will follow immediately). MUST NOT restore to
      // the trigger.
      const trigger = renderWithTrigger();

      const { rerender } = render(
        <UpgradeWall {...baseProps} returnFocus={null} />
      );

      fireEvent.keyDown(document, { key: "Escape" });
      rerender(<div />);

      expect(document.activeElement).not.toBe(trigger);
      document.body.removeChild(trigger);
    });

    it("returnFocus reads the latest prop value at unmount, not at mount", () => {
      // Parent may swap returnFocus between renders (e.g. attaching a ref
      // after mount). The mount-only effect must still pick up the new value.
      const trigger = renderWithTrigger();
      const first = document.createElement("button");
      const second = document.createElement("button");
      document.body.appendChild(first);
      document.body.appendChild(second);

      const { rerender } = render(
        <UpgradeWall {...baseProps} returnFocus={first} />
      );
      // Swap target while modal is open.
      rerender(<UpgradeWall {...baseProps} returnFocus={second} />);

      fireEvent.keyDown(document, { key: "Escape" });
      rerender(<div />);

      expect(document.activeElement).toBe(second);
      document.body.removeChild(trigger);
      document.body.removeChild(first);
      document.body.removeChild(second);
    });
  });

  describe("body scroll lock", () => {
    beforeEach(() => {
      // Reset body styles between tests so leaked state from a prior test
      // doesn't make the assertions misleading.
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
    });

    it("locks body scroll while open and restores on unmount", () => {
      expect(document.body.style.overflow).toBe("");
      const { unmount } = render(<UpgradeWall {...baseProps} />);
      expect(document.body.style.overflow).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      unmount();
      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.position).toBe("");
    });

    it("restores prior body styles, not just defaults", () => {
      // Some apps set body.overflow themselves (e.g. for a global scroll
      // container). The lock must save and restore that, not blindly clear it.
      document.body.style.overflow = "auto";
      const { unmount } = render(<UpgradeWall {...baseProps} />);
      expect(document.body.style.overflow).toBe("hidden");
      unmount();
      expect(document.body.style.overflow).toBe("auto");
    });
  });
});

