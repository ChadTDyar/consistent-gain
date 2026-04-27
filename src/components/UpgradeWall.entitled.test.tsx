import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

// Spy on gtag for the variant assertion.
const gtag = vi.fn();
beforeEach(() => {
  (window as unknown as { gtag: typeof gtag }).gtag = gtag;
  gtag.mockClear();
});
afterEach(() => {
  cleanup();
});

const flushPromises = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Re-import UpgradeWall after stubbing the supabase client to return a
 * specific entitlement. This is the entitled-user path: the pre-check
 * should swap the upsell for the Reader-rule manage dialog.
 *
 * `plan` is the raw value as it exists in `profiles.plan` — we test both
 * canonical 'plus' / 'pro' and the legacy 'premium' alias to prove the
 * normalizer is doing its job in this code path too.
 */
const renderWithPlan = async (
  plan: string | null,
  ios = false,
  props: Record<string, unknown> = {}
) => {
  vi.resetModules();
  vi.doMock("@/lib/platform", () => ({
    isIOSNative: () => ios,
    isAndroidNative: () => false,
    isNativeMobile: () => ios,
  }));
  vi.doMock("@capacitor/core", () => ({
    Capacitor: {
      isPluginAvailable: vi.fn(() => false),
      isNativePlatform: () => ios,
      getPlatform: () => (ios ? "ios" : "web"),
    },
  }));
  vi.doMock("@/integrations/supabase/client", () => {
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(() =>
        Promise.resolve({ data: { plan }, error: null })
      ),
    };
    return {
      supabase: {
        auth: {
          getSession: vi.fn(() =>
            Promise.resolve({
              data: { session: { user: { id: "test-user-id" } } },
              error: null,
            })
          ),
        },
        from: vi.fn(() => builder),
      },
    };
  });
  const { UpgradeWall } = await import("./UpgradeWall");
  const baseProps = {
    headline: "Unlock AI Coach",
    body: "Coach helps you understand patterns.",
    cta: "Upgrade to Premium",
    onUpgrade: vi.fn(),
    onDismiss: vi.fn(),
    gate: "coach" as const,
    tier: "premium" as const,
    ...props,
  };
  const result = render(<UpgradeWall {...baseProps} />);
  // Drain entitlement pre-check: getSession → from().select().eq().maybeSingle()
  // → setEntitlement → effect re-render → analytics + DOM swap.
  await flushPromises();
  await flushPromises();
  return result;
};

describe("UpgradeWall — entitlement pre-check", () => {
  describe("paying user gets the Reader-rule manage dialog (no upsell)", () => {
    it("swaps the upsell for an entitled-manage dialog when plan is 'pro' (Premium)", async () => {
      await renderWithPlan("pro");
      // The new dialog identifies itself by aria-labelledby.
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "upgrade-wall-entitled-title");
      // Affirms the user already has access — no upsell language.
      expect(screen.getByText(/you already have access/i)).toBeInTheDocument();
      // Plan name surfaces in the user-facing label (internal 'pro' → "Premium").
      expect(screen.getByText(/you're on premium/i)).toBeInTheDocument();
    });

    it("treats plan='plus' as Pro and shows the manage dialog", async () => {
      await renderWithPlan("plus");
      expect(screen.getByText(/you're on pro/i)).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-labelledby",
        "upgrade-wall-entitled-title"
      );
    });

    it("normalizes legacy 'premium' plan rows the same as 'pro'", async () => {
      // weekly-insights also defends against this legacy alias; the
      // pre-check must follow the same canonical mapping or paying users
      // on grandfathered rows would still see the upsell.
      await renderWithPlan("premium");
      expect(screen.getByText(/you're on premium/i)).toBeInTheDocument();
    });

    it("does NOT render the upsell CTA, price, or 'Upgrade to ...' button for entitled users", async () => {
      await renderWithPlan("pro");
      // The web upsell uses cta="Upgrade to Premium" — must be absent.
      expect(screen.queryByRole("button", { name: /upgrade to/i })).toBeNull();
      // Sanity: also no "$" or "/mo" pricing that could leak through.
      expect(screen.queryByText(/\$\d/)).toBeNull();
      expect(screen.queryByText(/\/mo/i)).toBeNull();
    });

    it("offers the two App-Review-safe management actions (web + iOS Settings)", async () => {
      await renderWithPlan("pro");
      expect(
        screen.getByRole("button", { name: /manage on web/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /manage subscription in settings/i })
      ).toBeInTheDocument();
    });

    it("fires upgrade_wall_shown with variant='entitled_manage' (not 'web' or 'ios_fallback')", async () => {
      await renderWithPlan("pro");
      const shown = gtag.mock.calls.find(
        (c) => c[0] === "event" && c[1] === "upgrade_wall_shown"
      );
      expect(shown).toBeTruthy();
      expect(shown?.[2]).toMatchObject({
        gate: "coach",
        tier: "premium",
        variant: "entitled_manage",
      });
    });

    it("renders the same manage dialog on iOS native (not the IAP-coming-soon fallback)", async () => {
      // A paying customer on iOS must NOT see "in-app purchases will be
      // available in a future update" — that copy is only honest for
      // non-customers. They get the entitled manage dialog instead.
      await renderWithPlan("pro", true);
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-labelledby",
        "upgrade-wall-entitled-title"
      );
      expect(
        screen.queryByText(/future update through the App Store/i)
      ).toBeNull();
    });

    it("Escape still dismisses the entitled dialog", async () => {
      const onDismiss = vi.fn();
      await renderWithPlan("pro", false, { onDismiss });
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe("free user falls through to the normal upsell", () => {
    it("renders the standard upsell when plan='free'", async () => {
      await renderWithPlan("free");
      // Standard upsell uses aria-labelledby="upgrade-wall-title".
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-labelledby",
        "upgrade-wall-title"
      );
      expect(
        screen.getByRole("button", { name: /upgrade to premium/i })
      ).toBeInTheDocument();
    });

    it("renders the standard upsell when the plan column is null", async () => {
      // Defensive: a brand-new account before the trigger populates 'plan'
      // should still see the upsell, never the manage dialog.
      await renderWithPlan(null);
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-labelledby",
        "upgrade-wall-title"
      );
    });

    it("fires upgrade_wall_shown with variant='web' for free web users", async () => {
      await renderWithPlan("free");
      const shown = gtag.mock.calls.find(
        (c) => c[0] === "event" && c[1] === "upgrade_wall_shown"
      );
      expect(shown?.[2]).toMatchObject({ variant: "web" });
    });
  });
});
