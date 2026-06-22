import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const ENTITLEMENT_ID = 'momentum_premium';

// RevenueCat iOS public/publishable SDK key. Safe to embed in client bundle.
const REVENUECAT_IOS_PUBLIC_KEY = 'appl_IqFsjDfSkoyXBczCICRhizbqbcE';

export async function initPurchases(userId: string) {
  if (!Capacitor.isNativePlatform()) return;
  const apiKey = import.meta.env.VITE_REVENUECAT_IOS_KEY || REVENUECAT_IOS_PUBLIC_KEY;
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey });
  await Purchases.logIn({ appUserID: userId });
}

export async function getOfferings() {
  if (!Capacitor.isNativePlatform()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchaseMonthly() {
  return purchaseByInterval('monthly');
}

export async function purchaseAnnual() {
  return purchaseByInterval('annual');
}

async function purchaseByInterval(interval: 'monthly' | 'annual') {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Purchases are only available in the native app');
  }
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(p =>
    p.product.identifier.includes(interval)
  );
  if (!pkg) throw new Error(`Package not found: ${interval}`);
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
  if (isActive) await syncPremium(true);
  return isActive;
}

export async function checkEntitlement(): Promise<boolean> {
  // Native (iOS + Android): read real entitlement from RevenueCat.
  // iOS is paid via StoreKit IAP through RevenueCat as of v1.2.
  if (Capacitor.isNativePlatform()) {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return !!customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
    } catch (e) {
      console.error('[purchases] getCustomerInfo failed:', e);
      return false;
    }
  }
  // Web: read is_premium from profiles (Stripe path).
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();
  return !!data?.is_premium;
}

export async function restorePurchases() {
  if (!Capacitor.isNativePlatform()) return false;
  const { customerInfo } = await Purchases.restorePurchases();
  const isActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
  if (isActive) await syncPremium(true);
  return isActive;
}

async function syncPremium(isPremium: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // Note: subscription state is normally written server-side via webhooks.
  // This client-side sync is a best-effort hint; RLS may restrict it.
  await supabase
    .from('profiles')
    .update({ is_premium: isPremium })
    .eq('id', user.id);
}
