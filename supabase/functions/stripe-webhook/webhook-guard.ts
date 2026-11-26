// Shared plumbing for stripe-webhook: signature check, per-mode Stripe client,
// and once-only processing keyed on event.id (table stripe_webhook_events).
//
// Secrets (edge function env):
//   STRIPE_WEBHOOK_SECRET       signing secret of the LIVE endpoint
//   STRIPE_WEBHOOK_SECRET_TEST  signing secret of the TEST endpoint (optional)
//   STRIPE_SECRET_KEY           live API key
//   STRIPE_SECRET_KEY_TEST      test API key (optional; needed for test events)
import Stripe from "https://esm.sh/stripe@18.5.0";

const API_VERSION = "2025-08-27.basil";
const cryptoProvider = Stripe.createSubtleCryptoProvider();
// Signature checks never call the API, so this client needs no real key.
const verifier = new Stripe("sk_signature_check_only", { apiVersion: API_VERSION });

const env = (name: string) => (Deno.env.get(name) ?? "").trim();

export class ConfigError extends Error {}

/**
 * Verifies the Stripe-Signature header against the live secret, then the test
 * secret. An event signed with the test secret must be a test-mode event.
 */
export async function verifyStripeEvent(body: string, signature: string): Promise<Stripe.Event> {
  const candidates: Array<{ secret: string; testOnly: boolean }> = [];
  if (env("STRIPE_WEBHOOK_SECRET")) candidates.push({ secret: env("STRIPE_WEBHOOK_SECRET"), testOnly: false });
  if (env("STRIPE_WEBHOOK_SECRET_TEST")) candidates.push({ secret: env("STRIPE_WEBHOOK_SECRET_TEST"), testOnly: true });
  if (candidates.length === 0) throw new ConfigError("No STRIPE_WEBHOOK_SECRET configured");

  let lastError: unknown = null;
  for (const { secret, testOnly } of candidates) {
    try {
      const event = await verifier.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
      if (testOnly && event.livemode) throw new Error("Live event signed with the test secret");
      return event;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Signature verification failed");
}

/** Stripe client whose mode matches the event, so object lookups resolve. */
export function stripeFor(livemode: boolean): Stripe {
  const name = livemode ? "STRIPE_SECRET_KEY" : "STRIPE_SECRET_KEY_TEST";
  const key = env(name);
  if (!key) throw new ConfigError(`${name} is not set`);
  return new Stripe(key, { apiVersion: API_VERSION });
}

// deno-lint-ignore no-explicit-any
type Db = any;

const STALE_CLAIM_MS = 5 * 60 * 1000;

/**
 * Claims event.id before processing.
 *   "claimed"     process it
 *   "duplicate"   already processed; answer 200 and do nothing
 *   "in_progress" another delivery is working on it; answer non-2xx so Stripe retries
 * Failed runs, and claims older than 5 minutes (a crashed run), can be claimed again.
 */
export async function claimEvent(db: Db, event: Stripe.Event): Promise<"claimed" | "duplicate" | "in_progress"> {
  const { error } = await db
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type, livemode: event.livemode });
  if (!error) return "claimed";
  if (error.code !== "23505") throw new Error(`stripe_webhook_events insert failed: ${error.message}`);

  const staleBefore = new Date(Date.now() - STALE_CLAIM_MS).toISOString();
  const { data, error: takeError } = await db
    .from("stripe_webhook_events")
    .update({ status: "processing", outcome: null, received_at: new Date().toISOString(), processed_at: null })
    .eq("event_id", event.id)
    .or(`status.eq.failed,and(status.eq.processing,received_at.lt.${staleBefore})`)
    .select("event_id");
  if (takeError) throw new Error(`stripe_webhook_events reclaim failed: ${takeError.message}`);
  if (data && data.length > 0) return "claimed";

  const { data: row } = await db
    .from("stripe_webhook_events")
    .select("status")
    .eq("event_id", event.id)
    .maybeSingle();
  return row?.status === "processed" ? "duplicate" : "in_progress";
}

async function settleEvent(db: Db, eventId: string, status: "processed" | "failed", outcome: string) {
  const { error } = await db
    .from("stripe_webhook_events")
    .update({ status, outcome: outcome.slice(0, 500), processed_at: new Date().toISOString() })
    .eq("event_id", eventId);
  if (error) console.error(`[stripe-webhook] could not mark ${eventId} ${status}: ${error.message}`);
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/**
 * Runs handle() at most once per event.id. A 2xx marks the event processed;
 * anything else (or a throw) marks it failed so Stripe's retry reprocesses it.
 * The response body is stored as the outcome, so keep it free of personal data.
 */
export async function processOnce(db: Db, event: Stripe.Event, handle: () => Promise<Response>): Promise<Response> {
  const claim = await claimEvent(db, event);
  if (claim === "duplicate") return json({ received: true, duplicate: true }, 200);
  if (claim === "in_progress") return json({ error: "Event is already being processed" }, 409);

  let res: Response;
  try {
    res = await handle();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await settleEvent(db, event.id, "failed", `exception: ${message}`);
    return json({ error: message }, 500);
  }
  const outcome = await res.clone().text().catch(() => "");
  await settleEvent(db, event.id, res.ok ? "processed" : "failed", `${res.status} ${outcome}`);
  return res;
}
