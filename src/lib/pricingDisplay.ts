import { isIOSNative } from "@/lib/platform";

/**
 * Apple guideline 3.1.1: native iOS builds must not surface web subscription
 * prices. These helpers keep the web copy unchanged while stripping the price
 * (and any web-checkout CTA) inside the iOS wrapper.
 */

export const PREMIUM_MONTHLY_LABEL = "$7.99/mo";

/** "Premium ($7.99/mo)" on web, "Premium" on iOS native. */
export const premiumTierLabel = (base = "Premium"): string =>
  isIOSNative() ? base : `${base} (${PREMIUM_MONTHLY_LABEL})`;

/** Plan bullet line, price omitted on iOS native. */
export const premiumPlanLine = (features: string, base = "Premium"): string =>
  `${premiumTierLabel(base)} - ${features}`;

/** Whether a web pricing CTA / price block may render. */
export const canShowWebPricing = (): boolean => !isIOSNative();

/** Label for any "see pricing" affordance. */
export const pricingCtaLabel = (webLabel = "Compare plans"): string =>
  isIOSNative() ? "See pricing in app" : webLabel;
