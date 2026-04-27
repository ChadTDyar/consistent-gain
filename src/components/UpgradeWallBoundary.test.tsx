import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { UpgradeWallBoundary } from "./UpgradeWallBoundary";

vi.mock("@/lib/analytics", () => ({
  analytics: {
    upgradeWallDismissed: vi.fn(),
    upgradeWallCtaClicked: vi.fn(),
  },
}));
import { analytics } from "@/lib/analytics";

// A child that throws on demand so we can exercise the error boundary.
let shouldThrow = false;
function MaybeThrow({ label = "wall content" }: { label?: string }) {
  if (shouldThrow) throw new Error("boom");
  return <div data-testid="wall">{label}</div>;
}

describe("UpgradeWallBoundary", () => {
  beforeEach(() => {
    shouldThrow = false;
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the loading state during the initial warmup, then renders children", () => {
    render(
      <UpgradeWallBoundary onDismiss={() => {}} warmupMs={150}>
        <MaybeThrow />
      </UpgradeWallBoundary>
    );
    expect(screen.getByLabelText(/loading upgrade options/i)).toBeInTheDocument();
    expect(screen.queryByTestId("wall")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(screen.queryByLabelText(/loading upgrade options/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("wall")).toBeInTheDocument();
  });

  it("skips the warmup when warmupMs=0", () => {
    render(
      <UpgradeWallBoundary onDismiss={() => {}} warmupMs={0}>
        <MaybeThrow />
      </UpgradeWallBoundary>
    );
    expect(screen.getByTestId("wall")).toBeInTheDocument();
  });

  it("renders the error fallback with Try again + Dismiss when the child throws", () => {
    shouldThrow = true;
    // Suppress React's expected error log noise for this test.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <UpgradeWallBoundary onDismiss={() => {}} warmupMs={0} gate="coach" tier="premium">
        <MaybeThrow />
      </UpgradeWallBoundary>
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/couldn't load upgrade options/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^dismiss$/i })).toBeInTheDocument();

    // Render failure tagged in the funnel.
    expect(analytics.upgradeWallDismissed).toHaveBeenCalledWith("coach_render_error", "premium");

    errSpy.mockRestore();
  });

  it("recovers when Try again is pressed after the child stops throwing", () => {
    shouldThrow = true;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <UpgradeWallBoundary onDismiss={() => {}} warmupMs={0} gate="coach" tier="premium">
        <MaybeThrow />
      </UpgradeWallBoundary>
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Simulate the transient cause clearing (e.g. chunk now cached).
    shouldThrow = false;

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    });

    // Retry shows loading first.
    expect(screen.getByLabelText(/loading upgrade options/i)).toBeInTheDocument();
    expect(analytics.upgradeWallCtaClicked).toHaveBeenCalledWith("coach_retry", "premium");

    act(() => {
      vi.advanceTimersByTime(160);
    });

    expect(screen.queryByLabelText(/loading upgrade options/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("wall")).toBeInTheDocument();

    errSpy.mockRestore();
  });

  it("calls onDismiss from the error fallback's Dismiss button", () => {
    shouldThrow = true;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onDismiss = vi.fn();

    render(
      <UpgradeWallBoundary onDismiss={onDismiss} warmupMs={0}>
        <MaybeThrow />
      </UpgradeWallBoundary>
    );

    fireEvent.click(screen.getByRole("button", { name: /^dismiss$/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    errSpy.mockRestore();
  });

  it("calls onDismiss from the error fallback when Escape is pressed", () => {
    shouldThrow = true;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onDismiss = vi.fn();

    render(
      <UpgradeWallBoundary onDismiss={onDismiss} warmupMs={0}>
        <MaybeThrow />
      </UpgradeWallBoundary>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);

    errSpy.mockRestore();
  });

  it("focuses the Try again button when the error fallback mounts", () => {
    shouldThrow = true;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <UpgradeWallBoundary onDismiss={() => {}} warmupMs={0}>
        <MaybeThrow />
      </UpgradeWallBoundary>
    );

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /try again/i })
    );

    errSpy.mockRestore();
  });
});
