// Handler test for delete-account: drives the real index.ts with fetch and
// Deno.serve stubbed, so no network, database or Stripe account is touched.
//
// Run: deno test --allow-env --allow-read --allow-net supabase/functions/delete-account/index.test.ts
// (--allow-net only fetches the esm.sh imports; every runtime request is stubbed.)

import { assert, assertEquals } from "jsr:@std/assert@1";

const SB = "https://test-project.supabase.co";
const USER_ID = "00000000-0000-4000-8000-000000000001";
const EMAIL = "delete-me@example.com";
const APP_PRODUCT = "prod_U3w9PqaaJVSOto";

Deno.env.set("SUPABASE_URL", SB);
Deno.env.set("SUPABASE_ANON_KEY", "anon-key");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service-key");
Deno.env.set("STRIPE_SECRET_KEY", "sk_test_fake");
Deno.env.set("REVENUECAT_SECRET_API_KEY", "rc_fake");
Deno.env.set("REVENUECAT_API_KEY", "rc_fake");

type Call = { method: string; url: URL };
let calls: Call[] = [];
let stripeCancelStatus = 200;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const req = input instanceof Request ? input : new Request(String(input), init);
  const url = new URL(req.url);
  calls.push({ method: req.method, url });

  if (url.origin === SB) {
    if (url.pathname === "/auth/v1/user") {
      return json({
        id: USER_ID, email: EMAIL, aud: "authenticated", role: "authenticated",
        app_metadata: {}, user_metadata: {}, created_at: "2026-11-01T00:00:00Z",
      });
    }
    if (req.method === "GET" && url.pathname.startsWith("/rest/v1/")) {
      const wantsObject = (req.headers.get("accept") ?? "").includes("vnd.pgrst.object");
      return json(wantsObject ? { stripe_customer_id: null } : []);
    }
    return json([]);
  }

  if (url.hostname === "api.stripe.com") {
    if (req.method === "GET" && url.pathname === "/v1/customers") {
      return json({ data: [{ id: "cus_test" }], has_more: false });
    }
    if (req.method === "GET" && url.pathname === "/v1/subscriptions") {
      // Honor Stripe's status filter: without one Stripe excludes only canceled.
      const status = url.searchParams.get("status");
      const subs = [{ id: "sub_trial", status: "trialing", items: { data: [{ price: { product: APP_PRODUCT } }] } }];
      return json({
        data: status && status !== "all" ? subs.filter((s) => s.status === status) : subs,
        has_more: false,
      });
    }
    if (req.method === "DELETE" && url.pathname === "/v1/subscriptions/sub_trial") {
      return json({ id: "sub_trial", status: "canceled" }, stripeCancelStatus);
    }
    if (req.method === "POST" && url.pathname === "/v1/subscriptions/sub_trial/cancel") {
      return json({ id: "sub_trial", status: "canceled" }, stripeCancelStatus);
    }
  }

  if (url.hostname === "api.revenuecat.com") return json({});
  return json({ error: `unexpected ${req.method} ${url}` }, 404);
}) as typeof fetch;

type Handler = (req: Request) => Response | Promise<Response>;
let handler: Handler | null = null;
// deno-lint-ignore no-explicit-any
(Deno as any).serve = (a: unknown, b?: unknown) => {
  handler = (typeof a === "function" ? a : b) as Handler;
  return { finished: Promise.resolve(), shutdown: () => Promise.resolve() };
};
await import("./index.ts");

async function callDelete(): Promise<Response> {
  calls = [];
  assert(handler, "index.ts did not register a handler");
  return await handler(new Request("http://localhost/delete-account", {
    method: "POST",
    headers: { Authorization: "Bearer test-jwt", "Content-Type": "application/json" },
  }));
}

const dataWrites = () =>
  calls.filter((c) =>
    c.url.origin === SB &&
    (c.method === "DELETE" || c.url.pathname.startsWith("/auth/v1/admin/") ||
      c.url.pathname.startsWith("/rest/v1/rpc/"))
  );

const opts = { sanitizeOps: false, sanitizeResources: false };

Deno.test({
  ...opts,
  name: "Stripe cancel failure stops the deletion before any data or auth delete",
  fn: async () => {
    stripeCancelStatus = 500;
    const res = await callDelete();
    await res.text();
    assertEquals(res.status, 502);
    assertEquals(dataWrites().map((c) => `${c.method} ${c.url.pathname}`), []);
    assertEquals(calls.filter((c) => c.url.hostname === "api.revenuecat.com").length, 0);
  },
});

Deno.test({
  ...opts,
  name: "missing STRIPE_SECRET_KEY stops the deletion",
  fn: async () => {
    stripeCancelStatus = 200;
    Deno.env.delete("STRIPE_SECRET_KEY");
    try {
      const res = await callDelete();
      await res.text();
      assertEquals(res.status, 502);
      assertEquals(dataWrites().length, 0);
    } finally {
      Deno.env.set("STRIPE_SECRET_KEY", "sk_test_fake");
    }
  },
});

Deno.test({
  ...opts,
  name: "a trialing subscription is canceled, then the account is deleted",
  fn: async () => {
    stripeCancelStatus = 200;
    const res = await callDelete();
    await res.text();
    assertEquals(res.status, 200);
    const cancelIdx = calls.findIndex((c) =>
      c.url.hostname === "api.stripe.com" && c.url.pathname.startsWith("/v1/subscriptions/sub_trial")
    );
    const authDeleteIdx = calls.findIndex((c) =>
      c.method === "DELETE" && c.url.pathname === `/auth/v1/admin/users/${USER_ID}`
    );
    assert(cancelIdx >= 0, "trialing subscription was not canceled");
    assert(authDeleteIdx > cancelIdx, "auth user must be deleted after Stripe cancel");
  },
});
