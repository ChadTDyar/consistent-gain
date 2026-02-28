// Stripe plan configuration
export const PLANS = {
  free: { name: 'Free', price: 0, annualPrice: 0, price_id: null, annual_price_id: null, product_id: null },
  plus: {
    name: 'Starter',
    price: 9,
    annualPrice: 86.40,
    price_id: 'price_1T5nbML98dr6Pw0kHQlfSif0',
    annual_price_id: 'price_1T5nbML98dr6Pw0kIN3gcS0D',
    product_id: 'prod_U2Duyohl5m98ud',
  },
  pro: {
    name: 'Pro',
    price: 19,
    annualPrice: 182.40,
    price_id: 'price_1T5ncwL98dr6Pw0ktGV0YCL2',
    annual_price_id: 'price_1T5ncwL98dr6Pw0kdbGjczhT',
    product_id: 'prod_U2Dxf2eZc9xwan',
  },
} as const;

export type PlanTier = 'free' | 'plus' | 'pro';
export type BillingInterval = 'monthly' | 'annual';

export function getPlanFromProductId(productId: string | null): PlanTier {
  if (!productId) return 'free';
  if (productId === PLANS.plus.product_id) return 'plus';
  if (productId === PLANS.pro.product_id) return 'pro';
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
