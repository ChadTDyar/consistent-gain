import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const ENTITLEMENT_ID = 'momentum_premium';

export async function initPurchases(userId: string) {
  if (!Capacitor.isNativePlatform()) return;
  const apiKey = import.meta.env.VITE_REVENUECAT_IOS_KEY;
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey });
  await Purchases.logIn({ appUserID: userId });
}

export async function getOfferings() {
  if (!Capacitor.isNativePlatform()) return null;
  const { offerings } = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchaseMonthly() {
  return purchaseByInterval('monthly');
}

export async function purchaseAnnual() {
  return purchaseByInterval('annual');
}

async function purchaseByInterval(interval: 'monthly' | 'annual') {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(p =>
    p.product.identifier.includes(interval)
  );
  if (!pkg) throw new Error(`Package not found: ${interval}`);
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
  if (isActive) await syncTier('premium');
  return isActive;
}

export async function checkEntitlement(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from('user_conversion_state')
      .select('tier')
      .eq('user_id', user.id)
      .single();
    return data?.tier === 'premium';
  }
  const { customerInfo } = await Purchases.getCustomerInfo();
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
}

export async function restorePurchases() {
  const { customerInfo } = await Purchases.restorePurchases();
  const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
  if (isActive) await syncTier('premium');
  return isActive;
}

async function syncTier(tier: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('user_conversion_state')
    .upsert({ user_id: user.id, tier, updated_at: new Date().toISOString() },
             { onConflict: 'user_id' });
}
