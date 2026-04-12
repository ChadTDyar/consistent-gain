// Stripe plan configuration
export const PLANS = {
  free: { name: 'Free', price: 0, annualPrice: 0, price_id: null, annual_price_id: null, product_id: null, payment_link: null, annual_payment_link: null },
  plus: {
    name: 'Pro',
    price: 3.99,
    annualPrice: 38,
    price_id: 'price_1TLREvLnv14mW4wIxVzNyDzV',
    annual_price_id: 'price_1TLRFlLnv14mW4wITM4NPBvv',
    product_id: 'prod_U2Duyohl5m98ud',
    payment_link: 'https://buy.stripe.com/test_8x29AU2Im6Yg9zde5MdAk00',
    annual_payment_link: 'https://buy.stripe.com/test_cNifZidn06YgdPt2n4dAk03',
  },
  pro: {
    name: 'Premium',
    price: 7.99,
    annualPrice: 77,
    price_id: 'price_1TLRGDLnv14mW4wIxowUobtD',
    annual_price_id: 'price_1TLRGrLnv14mW4wI5qFZjuVt',
    product_id: 'prod_U2Dxf2eZc9xwan',
    payment_link: 'https://buy.stripe.com/test_bJe9AUer496odPt7HodAk04',
    annual_payment_link: 'https://buy.stripe.com/test_4gM7sM6YC3M412H0eWdAk05',
  },
} as const;

export type PlanTier = 'free' | 'plus' | 'pro';
export type BillingInterval = 'monthly' | 'annual';

export function getPaymentLink(plan: 'plus' | 'pro', interval: BillingInterval): string {
  return interval === 'annual' ? PLANS[plan].annual_payment_link : PLANS[plan].payment_link;
}

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
