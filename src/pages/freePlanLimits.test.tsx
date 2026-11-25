import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ComponentType } from "react";
import { getGoalLimit } from "@/lib/plans";
import { FAQ } from "@/components/FAQ";
import Pricing from "./Pricing";
import Features from "./Features";
import MyFitnessPalAlternative from "./MyFitnessPalAlternative";

vi.mock("@/lib/platform", () => ({
  isIOSNative: () => false,
  isAndroidNative: () => false,
  isNativeMobile: () => false,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
  },
}));

vi.mock("@/components/SocialProof", () => ({ SocialProof: () => null }));

const pages: [string, ComponentType][] = [
  ["FAQ", FAQ],
  ["Pricing", Pricing],
  ["Features", Features],
  ["MyFitnessPalAlternative", MyFitnessPalAlternative],
];

describe("free plan limit copy", () => {
  afterEach(cleanup);

  it.each(pages)("%s renders getGoalLimit('free')", (_name, Page) => {
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>,
    );
    // FAQ answers sit in collapsed accordions and the JSON-LD schema, so check the whole document.
    const text = document.documentElement.innerHTML;
    expect(text).toMatch(new RegExp(`\\b${getGoalLimit("free")}\\b[- ]?(fitness )?habit`));
  });
});
