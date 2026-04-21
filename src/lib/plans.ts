// Stripe plan configuration
import { isIOSNative } from './platform';

export const PLANS = {
  free: { name: 'Free', price: 0, annualPrice: 0, price_id: null, annual_price_id: null, product_id: null, payment_link: null, annual_payment_link: null },
  plus: {
    name: 'Pro',
    price: 3.99,
    annualPrice: 38,
    price_id: 'price_1TLROuL98dr6Pw0kEFuhgPnA',
    annual_price_id: 'price_1TLRPCL98dr6Pw0kvyaljYet',
    product_id: 'prod_U3w81PJvJRTiQQ',
    payment_link: 'https://buy.stripe.com/7sY14o3Jyd1sf68bDx3ZK0r',
    annual_payment_link: 'https://buy.stripe.com/5kQ3cw93S1iKbTW7nh3ZK0t',
  },
  pro: {
    name: 'Premium',
    price: 7.99,
    annualPrice: 69.99,
    price_id: 'price_1TLRRxL98dr6Pw0kdyFkEsEp',
    annual_price_id: 'price_1TNbD3L98dr6Pw0krnhh7i50',
    product_id: 'prod_U3w9PqaaJVSOto',
    payment_link: 'https://buy.stripe.com/cNi8wQgwk6D48HKcHB3ZK0v',
    annual_payment_link: 'https://buy.stripe.com/14A9AUfsg6D48HKePJ3ZK0w',
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

// iOS Apple IAP compliance: on native iOS builds, all paid features are unlocked
// since we don't show any subscription/upgrade UI in the iOS app.
export function canAccessFeature(plan: PlanTier, requiredPlan: PlanTier): boolean {
  if (isIOSNative()) return true;
  const tierOrder: PlanTier[] = ['free', 'plus', 'pro'];
  return tierOrder.indexOf(plan) >= tierOrder.indexOf(requiredPlan);
}

export function getGoalLimit(plan: PlanTier): number | null {
  if (isIOSNative()) return null;
  return plan === 'free' ? 3 : null;
}

export function getHistoryDays(plan: PlanTier): number | null {
  if (isIOSNative()) return null;
  if (plan === 'free') return 7;
  if (plan === 'plus') return 30;
  return null;
}
