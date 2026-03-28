// Stripe plan configuration
export const PLANS = {
  free: { name: 'Free', price: 0, annualPrice: 0, price_id: null, annual_price_id: null, product_id: null },
  plus: {
    name: 'Pro',
    price: 3.99,
    annualPrice: 0,
    price_id: 'price_1TFkLzL98dr6Pw0kxjO4cJvA',
    annual_price_id: null,
    product_id: 'prod_U3w81PJvJRTiQQ',
  },
  pro: {
    name: 'Premium',
    price: 7.99,
    annualPrice: 0,
    price_id: 'price_1TFkM0L98dr6Pw0kXiu1hjbs',
    annual_price_id: null,
    product_id: 'prod_U3w9PqaaJVSOto',
  },
} as const;

export type PlanTier = 'free' | 'plus' | 'pro';
export type BillingInterval = 'monthly' | 'annual';

export function getPlanFromProductId(productId: string | null): PlanTier {
  if (!productId) return 'free';
  if (productId === PLANS.plus.product_id) return 'plus';
  if (productId === PLANS.pro.product_id) return 'pro';
  // Legacy product IDs
  if (productId === 'prod_U2Duyohl5m98ud' || productId === 'prod_U3vSrPHBDq24U8') return 'plus';
  if (productId === 'prod_U2Dxf2eZc9xwan' || productId === 'prod_U3vT2StszUp7uL') return 'pro';
  return 'plus';
}

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
