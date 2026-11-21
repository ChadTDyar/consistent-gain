// Pure entitlement rules for check-subscription. No Deno/Stripe imports so the
// app's test runner can exercise it (src/lib/checkSubscriptionEntitlement.test.ts).

// Must stay in sync with PLANS.pro.product_id in src/lib/plans.ts
export const PREMIUM_PRODUCT = "prod_U3w9PqaaJVSOto";
// Legacy product, still honored for existing subscribers.
export const LEGACY_PLUS_PRODUCT = "prod_U3w81PJvJRTiQQ";

const PRODUCT_PLANS: Record<string, "pro" | "plus"> = {
  [PREMIUM_PRODUCT]: "pro",
  [LEGACY_PLUS_PRODUCT]: "plus",
};

const ENTITLED_STATUSES = new Set(["active", "trialing"]);

export interface SubLike {
  status: string;
  current_period_end?: number | null;
  items: {
    data: Array<{
      current_period_end?: number | null;
      price: { product: string | { id: string } };
    }>;
  };
}

export interface Entitlement {
  plan: "free" | "plus" | "pro";
  status: "active" | "trialing" | "inactive";
  productId: string | null;
  periodEnd: number | null; // unix seconds
}

const RANK = { free: 0, plus: 1, pro: 2 } as const;

/**
 * Only subscriptions with status active or trialing whose items include a
 * known product grant access. Unknown products grant nothing. When several
 * qualify, the higher plan wins; on a tie, active beats trialing.
 */
export function resolveEntitlement(subs: SubLike[]): Entitlement {
  let best: Entitlement = { plan: "free", status: "inactive", productId: null, periodEnd: null };

  for (const sub of subs) {
    if (!ENTITLED_STATUSES.has(sub.status)) continue;
    for (const item of sub.items?.data ?? []) {
      const product = typeof item.price.product === "string" ? item.price.product : item.price.product?.id;
      const plan = product ? PRODUCT_PLANS[product] : undefined;
      if (!plan) continue;
      const status = sub.status as "active" | "trialing";
      const better =
        RANK[plan] > RANK[best.plan] ||
        (RANK[plan] === RANK[best.plan] && best.status === "trialing" && status === "active");
      if (better) {
        best = {
          plan,
          status,
          productId: product!,
          periodEnd: item.current_period_end ?? sub.current_period_end ?? null,
        };
      }
    }
  }
  return best;
}
