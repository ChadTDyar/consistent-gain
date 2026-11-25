import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MOMENTUM } from "@/constants/value-language";

const insert = vi.fn(() => Promise.resolve({ error: null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "free-user-1" } } }),
    },
    from: () => ({ insert }),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { StreakRepair } from "./StreakRepair";

const src = (rel: string) => readFileSync(resolve(__dirname, "..", rel), "utf8");

describe("Streak Repair is a Free feature (decision 2026-11-25)", () => {
  afterEach(() => {
    cleanup();
    insert.mockClear();
  });

  it("shows a free user the repair action, not an upgrade gate", async () => {
    const onClose = vi.fn();
    render(<StreakRepair daysMissed={4} open onClose={onClose} />);

    expect(screen.queryByText(/upgrade to repair/i)).not.toBeInTheDocument();
    const action = screen.getByRole("button", { name: /let's go/i });
    expect(action).toBeEnabled();

    fireEvent.click(action);
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "free-user-1", days_missed: 4 }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("no Premium list or upgrade wall in value-language mentions Streak Repair", () => {
    const premiumCopy = [
      MOMENTUM.premium.headline,
      MOMENTUM.premium.desc,
      ...Object.values(MOMENTUM.walls).flatMap((w) => [w.headline, w.body, w.cta]),
    ];
    for (const line of premiumCopy) {
      expect(line).not.toMatch(/streak repair/i);
    }
  });

  it("PaywallModal has no Streak Repair unlock label", () => {
    expect(src("components/PaywallModal.tsx")).not.toMatch(/streak repair/i);
  });

  it("Terms does not list streak repair as a paid feature", () => {
    const terms = src("pages/Terms.tsx");
    const paid = terms.match(/Premium unlocks[^.]*\./)?.[0] ?? "";
    expect(paid).not.toBe("");
    expect(paid).not.toMatch(/streak repair/i);
  });

  it("Pricing premiumFeatures list does not include Streak Repair", () => {
    const pricing = src("pages/Pricing.tsx");
    const list = pricing.match(/const premiumFeatures = \[[\s\S]*?\];/)?.[0] ?? "";
    expect(list).not.toBe("");
    expect(list).not.toMatch(/repair/i);
    const free = pricing.match(/const freeFeatures = \[[\s\S]*?\];/)?.[0] ?? "";
    expect(free).toMatch(/repair window/i);
  });
});
