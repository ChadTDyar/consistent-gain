// Stripe plan configuration
export const PLANS = {
  free: { name: 'Free', price: 0, price_id: null, product_id: null },
  plus: {
    name: 'Plus',
    price: 4.99,
    price_id: 'price_1T49SULnv14mW4wIBpFYk44h',
    product_id: 'prod_U2Duyohl5m98ud',
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    price_id: 'price_1T49VZLnv14mW4wIoZHM6DtD',
    product_id: 'prod_U2Dxf2eZc9xwan',
  },
} as const;

export type PlanTier = 'free' | 'plus' | 'pro';

export function getPlanFromProductId(productId: string | null): PlanTier {
  if (!productId) return 'free';
  if (productId === PLANS.plus.product_id) return 'plus';
  if (productId === PLANS.pro.product_id) return 'pro';
  // Legacy: treat unknown paid products as plus
  return 'plus';
}

export function canAccessFeature(plan: PlanTier, requiredPlan: PlanTier): boolean {
  const tierOrder: PlanTier[] = ['free', 'plus', 'pro'];
  return tierOrder.indexOf(plan) >= tierOrder.indexOf(requiredPlan);
}

export function getGoalLimit(plan: PlanTier): number | null {
  return plan === 'free' ? 3 : null; // null = unlimited
}

export function getHistoryDays(plan: PlanTier): number | null {
  if (plan === 'free') return 7;
  if (plan === 'plus') return 30;
  return null; // null = unlimited
}
