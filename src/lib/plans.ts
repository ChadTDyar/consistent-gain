// Stripe plan configuration


export const PLANS = {
  free: { name: 'Free', price: 0, annualPrice: 0, price_id: null, annual_price_id: null, product_id: null, payment_link: null, annual_payment_link: null },
  pro: {
    name: 'Premium',
    price: 7.99,
    annualPrice: 69.99,
    price_id: 'price_1TFkM0L98dr6Pw0kXiu1hjbs',
    annual_price_id: 'price_1TNbD3L98dr6Pw0krnhh7i50',
    product_id: 'prod_U3w9PqaaJVSOto',
    payment_link: 'https://buy.stripe.com/cNi8wQgwk6D48HKcHB3ZK0v',
    annual_payment_link: 'https://buy.stripe.com/14A9AUfsg6D48HKePJ3ZK0w',
  },
} as const;

// 'plus' remains a legacy tier value for historical DB rows / webhooks only.
// There is no purchasable 'plus' plan.
export type PlanTier = 'free' | 'plus' | 'pro';
export type BillingInterval = 'monthly' | 'annual';

/**
 * Normalize any plan string from the database/webhooks to a known PlanTier.
 * Defensive against legacy values like 'premium' that may exist on older accounts.
 */
export function normalizePlan(plan: string | null | undefined): PlanTier {
  if (!plan) return 'free';
  const p = plan.toLowerCase();
  if (p === 'pro' || p === 'premium') return 'pro';
  if (p === 'plus') return 'plus';
  return 'free';
}

export function getPaymentLink(plan: 'pro', interval: BillingInterval): string {
  return interval === 'annual' ? PLANS[plan].annual_payment_link : PLANS[plan].payment_link;
}

/**
 * The single place a Stripe product ID is ever compared to a plan.
 * Unknown (legacy/retired) products keep the legacy 'plus' tier so no existing
 * subscriber is demoted; only a missing product ID means free.
 * NOTE: supabase/functions/{check-subscription,stripe-webhook} duplicate
 * PLANS.pro.product_id (edge functions cannot import from src/). Keep in sync.
 */
export function resolvePlanFromProductId(productId: string | null | undefined): PlanTier {
  if (!productId) return 'free';
  return productId === PLANS.pro.product_id ? 'pro' : 'plus';
}



// iOS gating now flows through RevenueCat entitlement (see checkEntitlement);
// no platform shortcuts here.
export function canAccessFeature(plan: PlanTier, requiredPlan: PlanTier): boolean {
  const tierOrder: PlanTier[] = ['free', 'plus', 'pro'];
  return tierOrder.indexOf(plan) >= tierOrder.indexOf(requiredPlan);
}

export function getGoalLimit(plan: PlanTier): number | null {
  return plan === 'free' ? 3 : null;
}

export function getHistoryDays(plan: PlanTier): number | null {
  if (plan === 'free') return 7;
  if (plan === 'plus') return 30;
  return null;
}
