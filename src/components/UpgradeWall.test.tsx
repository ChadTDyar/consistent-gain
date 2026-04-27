import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  describe("aria-labelledby / aria-describedby wiring", () => {
    it("aria-labelledby points to an element containing the headline", () => {
      render(<UpgradeWall {...baseProps} headline="Unlock Coach" />);
      const dialog = screen.getByRole("dialog");
      const labelId = dialog.getAttribute("aria-labelledby")!;
      expect(labelId).toBeTruthy();
      const labelEl = document.getElementById(labelId);
      expect(labelEl).not.toBeNull();
      expect(labelEl).toHaveTextContent("Unlock Coach");
      // The dialog should expose its accessible name via the heading.
      expect(dialog).toHaveAccessibleName("Unlock Coach");
    });

    it("aria-describedby points to an element containing the body copy", () => {
      render(
        <UpgradeWall {...baseProps} body="Upgrade to access AI Coach insights." />
      );
      const dialog = screen.getByRole("dialog");
      const descId = dialog.getAttribute("aria-describedby")!;
      expect(descId).toBeTruthy();
      const descEl = document.getElementById(descId);
      expect(descEl).not.toBeNull();
      expect(descEl).toHaveTextContent("Upgrade to access AI Coach insights.");
      expect(dialog).toHaveAccessibleDescription(
        "Upgrade to access AI Coach insights."
      );
    });

    it("title is a real heading so screen readers announce it as a heading", () => {
      render(<UpgradeWall {...baseProps} headline="Unlock Coach" />);
      // The headline is rendered as <h3>.
      expect(
        screen.getByRole("heading", { name: "Unlock Coach", level: 3 })
      ).toBeInTheDocument();
    });

    it("generates unique IDs per instance (no collisions between two modals)", () => {
      const { container: c1 } = render(
        <UpgradeWall {...baseProps} headline="First" />
      );
      const { container: c2 } = render(
        <UpgradeWall {...baseProps} headline="Second" />
      );
      // Two dialogs are rendered into document.body via portals.
      const dialogs = screen.getAllByRole("dialog");
      expect(dialogs).toHaveLength(2);

      const labelIds = dialogs.map((d) => d.getAttribute("aria-labelledby"));
      const descIds = dialogs.map((d) => d.getAttribute("aria-describedby"));
      expect(new Set(labelIds).size).toBe(2);
      expect(new Set(descIds).size).toBe(2);

      // Sanity: each ID resolves to an element and they don't cross-link.
      labelIds.forEach((id) => expect(document.getElementById(id!)).not.toBeNull());
      descIds.forEach((id) => expect(document.getElementById(id!)).not.toBeNull());

      // Suppress unused vars warning while keeping render scopes alive.
      void c1;
      void c2;
    });
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

  describe("outside-click dismissal with pointer capture", () => {
    // Helpers — synthesize realistic pointer events. The component reads
    // pointerId, isPrimary, clientX/clientY and uses pointer capture, so unit
    // tests must supply these fields. window.__elementFromPointTarget is
    // honored by the jsdom polyfill in src/test/setup.ts to drive the
    // hit-test guard deterministically.
    const pointerInit = (
      pointerId: number,
      target: Element,
      overrides: Partial<PointerEventInit> = {}
    ): PointerEventInit & { target?: Element } => ({
      pointerId,
      isPrimary: true,
      pointerType: "touch",
      clientX: 10,
      clientY: 10,
      ...overrides,
      target,
    });

    const setHit = (el: Element | null) => {
      window.__elementFromPointTarget = el;
    };

    afterEach(() => {
      delete window.__elementFromPointTarget;
    });

    it("dismisses on a clean tap: pointerdown + pointerup both on backdrop", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      setHit(backdrop);

      fireEvent.pointerDown(backdrop, pointerInit(1, backdrop));
      fireEvent.pointerUp(backdrop, pointerInit(1, backdrop));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does NOT dismiss when pointerdown starts inside the panel (no capture taken)", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      const heading = screen.getByText(baseProps.headline);
      setHit(backdrop);

      // pointerdown bubbles from heading -> backdrop, but target !== currentTarget,
      // so the component must NOT setPointerCapture and must NOT dismiss.
      fireEvent.pointerDown(heading, pointerInit(2, heading));
      fireEvent.pointerUp(backdrop, pointerInit(2, backdrop));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("does NOT dismiss when both events occur inside the panel", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const heading = screen.getByText(baseProps.headline);
      setHit(heading);

      fireEvent.pointerDown(heading, pointerInit(3, heading));
      fireEvent.pointerUp(heading, pointerInit(3, heading));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    // Touch/pen consistency — the whole point of pointer capture.
    // pointerdown on backdrop, finger drifts onto the panel, lifts there.
    // Because we captured the pointer, pointerup still fires on the backdrop,
    // but the hit-test target is the panel — so we must NOT dismiss.
    it("touch drift: pointerdown on backdrop, lift over panel — does NOT dismiss", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      const heading = screen.getByText(baseProps.headline);
      // Hit-test reports the panel descendant: user lifted over the panel.
      setHit(heading);

      fireEvent.pointerDown(backdrop, pointerInit(4, backdrop, { pointerType: "touch" }));
      fireEvent.pointerUp(backdrop, pointerInit(4, backdrop, { pointerType: "touch" }));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("pen drift: pointerdown on backdrop, lift over panel — does NOT dismiss", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      const heading = screen.getByText(baseProps.headline);
      setHit(heading);

      fireEvent.pointerDown(backdrop, pointerInit(5, backdrop, { pointerType: "pen" }));
      fireEvent.pointerUp(backdrop, pointerInit(5, backdrop, { pointerType: "pen" }));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("ignores pointerup whose pointerId never had capture", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      setHit(backdrop);

      // No matching pointerdown for pointerId 99.
      fireEvent.pointerUp(backdrop, pointerInit(99, backdrop));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("ignores non-primary pointers (multi-touch second finger)", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      setHit(backdrop);

      fireEvent.pointerDown(
        backdrop,
        pointerInit(7, backdrop, { isPrimary: false })
      );
      fireEvent.pointerUp(backdrop, pointerInit(7, backdrop));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("pointercancel clears state without dismissing (e.g. browser preempts gesture)", () => {
      const onDismiss = vi.fn();
      render(<UpgradeWall {...baseProps} onDismiss={onDismiss} />);
      const backdrop = screen.getByRole("dialog");
      setHit(backdrop);

      fireEvent.pointerDown(backdrop, pointerInit(8, backdrop));
      fireEvent.pointerCancel(backdrop, pointerInit(8, backdrop));
      // Subsequent stray pointerup with same id must not dismiss.
      fireEvent.pointerUp(backdrop, pointerInit(8, backdrop));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("preserves the focus trap: outside-tap dismiss restores focus to the trigger", () => {
      const trigger = document.createElement("button");
      trigger.textContent = "Open";
      document.body.appendChild(trigger);
      trigger.focus();

      const onDismiss = vi.fn();
      const { rerender } = render(
        <UpgradeWall {...baseProps} onDismiss={onDismiss} />
      );
      const backdrop = screen.getByRole("dialog");
      setHit(backdrop);

      fireEvent.pointerDown(backdrop, pointerInit(9, backdrop));
      fireEvent.pointerUp(backdrop, pointerInit(9, backdrop));
      expect(onDismiss).toHaveBeenCalledTimes(1);

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
  });
});
