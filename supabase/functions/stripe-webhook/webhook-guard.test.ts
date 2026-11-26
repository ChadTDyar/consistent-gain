// Tests for webhook-guard.ts: signature checks against live/test secrets and
// once-only processing on event.id. Uses an in-memory stripe_webhook_events
// table, so no network, database or Stripe account is touched.
//
// Run: deno test --allow-env --allow-net supabase/functions/stripe-webhook/webhook-guard.test.ts
// (--allow-net only fetches the esm.sh imports.)

import { assert, assertEquals, assertRejects } from "jsr:@std/assert@1";

const LIVE_SECRET = "whsec_live_guard_test";
const TEST_SECRET = "whsec_test_guard_test";
Deno.env.set("STRIPE_WEBHOOK_SECRET", LIVE_SECRET);
Deno.env.set("STRIPE_WEBHOOK_SECRET_TEST", TEST_SECRET);

const { processOnce, verifyStripeEvent } = await import("./webhook-guard.ts");

async function sign(payload: string, secret: string, ts = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${payload}`));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `t=${ts},v1=${hex}`;
}

const eventJson = (id: string, livemode: boolean) =>
  JSON.stringify({ id, object: "event", type: "customer.subscription.updated", livemode, data: { object: {} } });

// Minimal stand-in for the supabase-js query builder over one table.
type Row = Record<string, unknown>;
function fakeDb() {
  const rows = new Map<string, Row>();
  const builder = (op: string, values?: Row) => {
    const filters: Array<(r: Row) => boolean> = [];
    let orFilter: ((r: Row) => boolean) | null = null;
    const matches = () => [...rows.values()].filter((r) => filters.every((f) => f(r)) && (!orFilter || orFilter(r)));
    const apply = () => {
      if (op === "update") {
        const hit = matches();
        for (const r of hit) Object.assign(r, values);
        return { data: hit.map((r) => ({ event_id: r.event_id })), error: null };
      }
      return { data: matches(), error: null };
    };
    const b: any = {
      eq(col: string, v: unknown) { filters.push((r) => r[col] === v); return b; },
      or(expr: string) {
        const stale = expr.match(/received_at\.lt\.([^)]+)\)/)?.[1] ?? "";
        orFilter = (r) => r.status === "failed" || (r.status === "processing" && String(r.received_at) < stale);
        return b;
      },
      select() { return b; },
      maybeSingle() { const { data } = apply(); return Promise.resolve({ data: data[0] ?? null, error: null }); },
      then(resolve: (v: unknown) => void) { resolve(apply()); },
    };
    return b;
  };
  return {
    rows,
    from(_table: string) {
      return {
        insert(values: Row) {
          if (rows.has(values.event_id as string)) {
            return Promise.resolve({ error: { code: "23505", message: "duplicate key" } });
          }
          rows.set(values.event_id as string, { status: "processing", received_at: new Date().toISOString(), ...values });
          return Promise.resolve({ error: null });
        },
        update(values: Row) { return builder("update", values); },
        select() { return builder("select"); },
      };
    },
  };
}

const evt = (id: string) => ({ id, type: "customer.subscription.updated", livemode: true }) as any;
const ok = () => Promise.resolve(new Response(JSON.stringify({ received: true, outcome: "done" }), { status: 200 }));

Deno.test("accepts a live event signed with the live secret", async () => {
  const body = eventJson("evt_live_1", true);
  const event = await verifyStripeEvent(body, await sign(body, LIVE_SECRET));
  assertEquals(event.id, "evt_live_1");
});

Deno.test("accepts a test event signed with the test secret", async () => {
  const body = eventJson("evt_test_1", false);
  const event = await verifyStripeEvent(body, await sign(body, TEST_SECRET));
  assertEquals(event.livemode, false);
});

Deno.test("rejects a live event signed with the test secret", async () => {
  const body = eventJson("evt_live_2", true);
  await assertRejects(async () => await verifyStripeEvent(body, await sign(body, TEST_SECRET)));
});

Deno.test("rejects a bad signature and a stale timestamp", async () => {
  const body = eventJson("evt_live_3", true);
  await assertRejects(async () => await verifyStripeEvent(body, await sign(body, "whsec_wrong")));
  const old = Math.floor(Date.now() / 1000) - 3600;
  await assertRejects(async () => await verifyStripeEvent(body, await sign(body, LIVE_SECRET, old)));
});

Deno.test("processes an event once; a redelivery is a no-op", async () => {
  const db = fakeDb();
  let runs = 0;
  const handle = () => { runs++; return ok(); };

  const first = await processOnce(db, evt("evt_once"), handle);
  const second = await processOnce(db, evt("evt_once"), handle);

  assertEquals(first.status, 200);
  assertEquals(second.status, 200);
  assertEquals((await second.json()).duplicate, true);
  assertEquals(runs, 1);
  assertEquals(db.rows.get("evt_once")?.status, "processed");
});

Deno.test("a failed run is marked failed and retried on redelivery", async () => {
  const db = fakeDb();
  let runs = 0;
  const flaky = () => {
    runs++;
    return runs === 1 ? Promise.resolve(new Response("{}", { status: 500 })) : ok();
  };

  assertEquals((await processOnce(db, evt("evt_retry"), flaky)).status, 500);
  assertEquals(db.rows.get("evt_retry")?.status, "failed");
  assertEquals((await processOnce(db, evt("evt_retry"), flaky)).status, 200);
  assertEquals(db.rows.get("evt_retry")?.status, "processed");
  assertEquals(runs, 2);
});

Deno.test("a thrown handler is marked failed with the reason", async () => {
  const db = fakeDb();
  const res = await processOnce(db, evt("evt_throw"), () => Promise.reject(new Error("boom")));
  assertEquals(res.status, 500);
  assertEquals(db.rows.get("evt_throw")?.status, "failed");
  assert(String(db.rows.get("evt_throw")?.outcome).includes("boom"));
});

Deno.test("a concurrent delivery of an in-flight event gets 409", async () => {
  const db = fakeDb();
  db.rows.set("evt_busy", { event_id: "evt_busy", status: "processing", received_at: new Date().toISOString() });
  let runs = 0;
  const res = await processOnce(db, evt("evt_busy"), () => { runs++; return ok(); });
  assertEquals(res.status, 409);
  assertEquals(runs, 0);
});

Deno.test("a claim abandoned for over 5 minutes is taken over", async () => {
  const db = fakeDb();
  const stale = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  db.rows.set("evt_stale", { event_id: "evt_stale", status: "processing", received_at: stale });
  let runs = 0;
  const res = await processOnce(db, evt("evt_stale"), () => { runs++; return ok(); });
  assertEquals(res.status, 200);
  assertEquals(runs, 1);
});
