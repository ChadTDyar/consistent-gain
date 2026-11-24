// supabase/functions/delete-account/stripe-cancel.ts
//
// Cancels every Stripe subscription this app owns for a user who is deleting
// their account. No Deno or Stripe SDK imports so the app's test runner can
// exercise it with a fake fetch.
//
// Rules:
//   - Every subscription that can still bill is canceled: active, trialing,
//     past_due, unpaid and paused. A trial must not survive deletion and
//     convert to a paid charge on a deleted account.
//   - The Stripe account is shared across ARL apps and checkout reuses one
//     customer per email, so only subscriptions whose items include one of
//     this app's products are canceled. Another app's subscription on the
//     same customer is left alone and reported in skipped_subscription_ids.
//   - Customers come from the caller's stored ids plus a Stripe email lookup.
//   - Any Stripe failure (missing key, HTTP error, network error) sets
//     ok=false. The caller must stop the deletion so billing never outlives
//     the account.

export const CANCELABLE_STATUSES: ReadonlySet<string> = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "paused",
]);

export interface StripeCancelResult {
  ok: boolean;
  customer_ids: string[];
  canceled_subscription_ids: string[];
  skipped_subscription_ids: string[];
  errors: string[];
}

export interface CancelAppSubscriptionsOptions {
  stripeKey: string | null | undefined;
  email: string | null | undefined;
  knownCustomerIds?: Array<string | null | undefined>;
  productIds: ReadonlySet<string>;
  fetchFn?: typeof fetch;
}

interface StripeItem {
  price?: { product?: string | { id?: string } | null } | null;
}

interface StripeSubscription {
  id: string;
  status: string;
  items?: { data?: StripeItem[] };
}

const STRIPE_API = "https://api.stripe.com/v1";

function productOf(item: StripeItem): string | null {
  const p = item?.price?.product;
  if (!p) return null;
  return typeof p === "string" ? p : p.id ?? null;
}

export function isAppSubscription(sub: StripeSubscription, productIds: ReadonlySet<string>): boolean {
  return (sub.items?.data ?? []).some((item) => productIds.has(productOf(item) ?? ""));
}

async function listAll<T extends { id: string }>(
  fetchFn: typeof fetch,
  stripeKey: string,
  path: string,
  params: Record<string, string>,
): Promise<T[]> {
  const out: T[] = [];
  let startingAfter: string | null = null;
  // Hard cap so a bad response can never loop forever.
  for (let page = 0; page < 20; page++) {
    const qs = new URLSearchParams({ ...params, limit: "100" });
    if (startingAfter) qs.set("starting_after", startingAfter);
    const res = await fetchFn(`${STRIPE_API}${path}?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    if (!res.ok) {
      throw new Error(`GET ${path}: HTTP ${res.status}`);
    }
    const json = await res.json();
    const data = (json?.data ?? []) as T[];
    out.push(...data);
    if (!json?.has_more || data.length === 0) return out;
    startingAfter = data[data.length - 1].id;
  }
  throw new Error(`GET ${path}: too many pages`);
}

export async function cancelAppSubscriptions(
  opts: CancelAppSubscriptionsOptions,
): Promise<StripeCancelResult> {
  const fetchFn = opts.fetchFn ?? fetch;
  const result: StripeCancelResult = {
    ok: false,
    customer_ids: [],
    canceled_subscription_ids: [],
    skipped_subscription_ids: [],
    errors: [],
  };

  const stripeKey = opts.stripeKey;
  if (!stripeKey) {
    result.errors.push("STRIPE_SECRET_KEY not set; cannot confirm billing is canceled");
    return result;
  }

  // 1. Resolve every customer that may hold this user's subscriptions.
  const customerIds = new Set<string>();
  for (const id of opts.knownCustomerIds ?? []) {
    if (id) customerIds.add(id);
  }
  if (opts.email) {
    try {
      const customers = await listAll<{ id: string }>(fetchFn, stripeKey, "/customers", {
        email: opts.email,
      });
      for (const c of customers) customerIds.add(c.id);
    } catch (e) {
      result.errors.push(`customer lookup: ${(e as Error).message}`);
      return result;
    }
  }
  result.customer_ids = [...customerIds];

  // 2. Cancel this app's billable subscriptions on each customer.
  for (const customerId of customerIds) {
    let subs: StripeSubscription[];
    try {
      subs = await listAll<StripeSubscription>(fetchFn, stripeKey, "/subscriptions", {
        customer: customerId,
        status: "all",
      });
    } catch (e) {
      result.errors.push(`list subscriptions ${customerId}: ${(e as Error).message}`);
      continue;
    }

    for (const sub of subs) {
      if (!CANCELABLE_STATUSES.has(sub.status)) continue;
      if (!isAppSubscription(sub, opts.productIds)) {
        result.skipped_subscription_ids.push(sub.id);
        continue;
      }
      try {
        const res = await fetchFn(`${STRIPE_API}/subscriptions/${encodeURIComponent(sub.id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        if (res.ok) {
          result.canceled_subscription_ids.push(sub.id);
        } else {
          result.errors.push(`cancel ${sub.id}: HTTP ${res.status}`);
        }
      } catch (e) {
        result.errors.push(`cancel ${sub.id}: ${(e as Error).message}`);
      }
    }
  }

  result.ok = result.errors.length === 0;
  return result;
}
