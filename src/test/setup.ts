import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Default Supabase client mock for the whole test suite.
//
// Why: UpgradeWall now performs an entitlement pre-check on mount that calls
// `supabase.auth.getSession()` and `supabase.from('profiles').select(...)`.
// Tests that don't care about entitlement should get the simplest possible
// behavior: "no signed-in user" → resolves to the free-plan path → renders
// the existing upsell UI. Individual tests can override this with
// `vi.doMock(...)` before importing the component, exactly as they already
// do for `@/lib/platform`.
vi.mock("@/integrations/supabase/client", () => {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
  };
  return {
    supabase: {
      auth: {
        getSession: vi.fn(() =>
          Promise.resolve({ data: { session: null }, error: null })
        ),
        getUser: vi.fn(() =>
          Promise.resolve({ data: { user: null }, error: null })
        ),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        signOut: vi.fn(() => Promise.resolve({ error: null })),
      },
      from: vi.fn(() => builder),
      functions: {
        invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
      },
    },
  };
});
