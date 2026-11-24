import { describe, expect, it } from "vitest";
import {
  CANCELABLE_STATUSES,
  cancelAppSubscriptions,
} from "../../supabase/functions/delete-account/stripe-cancel";

const APP_PRODUCT = "prod_app";
const OTHER_APP_PRODUCT = "prod_other_app";
const PRODUCTS = new Set([APP_PRODUCT]);

type Sub = { id: string; status: string; product: string };

interface FakeStripe {
  customersByEmail?: string[];
  subsByCustomer?: Record<string, Sub[]>;
  failCustomerLookup?: number;
  failListFor?: string;
  failCancelFor?: string;
  throwOnCancel?: boolean;
  pageSize?: number;
}

function fakeStripe(cfg: FakeStripe) {
  const calls: Array<{ method: string; url: string }> = [];
  const canceled: string[] = [];

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  const page = <T extends { id: string }>(all: T[], url: URL) => {
    const size = cfg.pageSize ?? 100;
    const after = url.searchParams.get("starting_after");
    const start = after ? all.findIndex((x) => x.id === after) + 1 : 0;
    const data = all.slice(start, start + size);
    return json({ object: "list", data, has_more: start + size < all.length });
  };

  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    calls.push({ method, url: url.toString() });

    if (method === "GET" && url.pathname === "/v1/customers") {
      if (cfg.failCustomerLookup) return json({ error: {} }, cfg.failCustomerLookup);
      return page((cfg.customersByEmail ?? []).map((id) => ({ id })), url);
    }
    if (method === "GET" && url.pathname === "/v1/subscriptions") {
      const customer = url.searchParams.get("customer") ?? "";
      expect(url.searchParams.get("status")).toBe("all");
      if (cfg.failListFor === customer) return json({ error: {} }, 500);
      const subs = (cfg.subsByCustomer?.[customer] ?? []).map((s) => ({
        id: s.id,
        status: s.status,
        items: { data: [{ price: { product: s.product } }] },
      }));
      return page(subs, url);
    }
    if (method === "DELETE" && url.pathname.startsWith("/v1/subscriptions/")) {
      const id = decodeURIComponent(url.pathname.split("/").pop() ?? "");
      if (cfg.throwOnCancel) throw new Error("network down");
      if (cfg.failCancelFor === id) return json({ error: {} }, 402);
      canceled.push(id);
      return json({ id, status: "canceled" });
    }
    return json({ error: "unexpected" }, 404);
  }) as typeof fetch;

  return { fetchFn, calls, canceled };
}

describe("delete-account Stripe cancellation", () => {
  it("treats active, trialing, past_due, unpaid and paused as cancelable", () => {
    expect([...CANCELABLE_STATUSES].sort()).toEqual(
      ["active", "past_due", "paused", "trialing", "unpaid"],
    );
  });

  it("cancels a trialing subscription so the trial cannot convert after deletion", async () => {
    const s = fakeStripe({
      customersByEmail: ["cus_1"],
      subsByCustomer: { cus_1: [{ id: "sub_trial", status: "trialing", product: APP_PRODUCT }] },
    });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(true);
    expect(s.canceled).toEqual(["sub_trial"]);
  });

  it("cancels every billable status and leaves ended subscriptions alone", async () => {
    const s = fakeStripe({
      customersByEmail: ["cus_1"],
      subsByCustomer: {
        cus_1: [
          { id: "sub_active", status: "active", product: APP_PRODUCT },
          { id: "sub_trialing", status: "trialing", product: APP_PRODUCT },
          { id: "sub_past_due", status: "past_due", product: APP_PRODUCT },
          { id: "sub_unpaid", status: "unpaid", product: APP_PRODUCT },
          { id: "sub_paused", status: "paused", product: APP_PRODUCT },
          { id: "sub_canceled", status: "canceled", product: APP_PRODUCT },
          { id: "sub_expired", status: "incomplete_expired", product: APP_PRODUCT },
        ],
      },
    });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(true);
    expect(s.canceled.sort()).toEqual(
      ["sub_active", "sub_past_due", "sub_paused", "sub_trialing", "sub_unpaid"],
    );
    expect(r.canceled_subscription_ids.sort()).toEqual(s.canceled.sort());
  });

  it("does not cancel another app's subscription on the shared customer", async () => {
    const s = fakeStripe({
      customersByEmail: ["cus_1"],
      subsByCustomer: {
        cus_1: [
          { id: "sub_mine", status: "active", product: APP_PRODUCT },
          { id: "sub_theirs", status: "trialing", product: OTHER_APP_PRODUCT },
        ],
      },
    });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(true);
    expect(s.canceled).toEqual(["sub_mine"]);
    expect(r.skipped_subscription_ids).toEqual(["sub_theirs"]);
  });

  it("checks stored customer ids and email-matched customers, once each", async () => {
    const s = fakeStripe({
      customersByEmail: ["cus_email", "cus_stored"],
      subsByCustomer: {
        cus_stored: [{ id: "sub_a", status: "active", product: APP_PRODUCT }],
        cus_email: [{ id: "sub_b", status: "trialing", product: APP_PRODUCT }],
      },
    });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test",
      email: "a@b.com",
      knownCustomerIds: ["cus_stored", null, undefined],
      productIds: PRODUCTS,
      fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(true);
    expect(r.customer_ids.sort()).toEqual(["cus_email", "cus_stored"]);
    expect(s.canceled.sort()).toEqual(["sub_a", "sub_b"]);
    const listCalls = s.calls.filter((c) => c.url.includes("/v1/subscriptions?"));
    expect(listCalls).toHaveLength(2);
  });

  it("follows pagination on subscription lists", async () => {
    const subs = Array.from({ length: 5 }, (_, i) => ({
      id: `sub_${i}`, status: "active", product: APP_PRODUCT,
    }));
    const s = fakeStripe({ customersByEmail: ["cus_1"], subsByCustomer: { cus_1: subs }, pageSize: 2 });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(true);
    expect(s.canceled).toHaveLength(5);
  });

  it("is ok with nothing to cancel when the user never had a Stripe customer", async () => {
    const s = fakeStripe({ customersByEmail: [] });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(true);
    expect(r.canceled_subscription_ids).toEqual([]);
  });

  it("fails without calling Stripe when the secret key is missing", async () => {
    const s = fakeStripe({});
    const r = await cancelAppSubscriptions({
      stripeKey: undefined, email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(false);
    expect(s.calls).toHaveLength(0);
  });

  it("fails when the customer lookup errors", async () => {
    const s = fakeStripe({ failCustomerLookup: 500 });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("customer lookup");
  });

  it("fails when listing subscriptions errors", async () => {
    const s = fakeStripe({ customersByEmail: ["cus_1"], failListFor: "cus_1" });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(false);
  });

  it("fails when a cancel call is rejected, and still tries the rest", async () => {
    const s = fakeStripe({
      customersByEmail: ["cus_1"],
      subsByCustomer: {
        cus_1: [
          { id: "sub_bad", status: "trialing", product: APP_PRODUCT },
          { id: "sub_good", status: "active", product: APP_PRODUCT },
        ],
      },
      failCancelFor: "sub_bad",
    });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toContain("sub_bad");
    expect(s.canceled).toEqual(["sub_good"]);
  });

  it("fails when the cancel request throws", async () => {
    const s = fakeStripe({
      customersByEmail: ["cus_1"],
      subsByCustomer: { cus_1: [{ id: "sub_1", status: "active", product: APP_PRODUCT }] },
      throwOnCancel: true,
    });
    const r = await cancelAppSubscriptions({
      stripeKey: "sk_test", email: "a@b.com", productIds: PRODUCTS, fetchFn: s.fetchFn,
    });
    expect(r.ok).toBe(false);
  });
});
