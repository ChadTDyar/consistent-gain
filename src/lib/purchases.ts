// RevenueCat purchase functions for iOS native in-app purchases
// These are stubs that will be replaced with actual RevenueCat SDK calls
// once @revenuecat/purchases-capacitor is installed and configured.

import { Capacitor } from '@capacitor/core';

let isInitialized = false;

export async function initializePurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform() || isInitialized) return;

  try {
    // RevenueCat SDK initialization will go here
    // e.g. Purchases.configure({ apiKey: 'appl_...' });
    isInitialized = true;
    console.log('[Purchases] RevenueCat initialized');
  } catch (error) {
    console.error('[Purchases] Failed to initialize:', error);
  }
}

export async function purchaseMonthly(): Promise<{ success: boolean }> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Native purchases are only available on mobile');
  }

  try {
    // TODO: Replace with actual RevenueCat purchase call
    // const { customerInfo } = await Purchases.purchaseProduct('momentum_premium_monthly');
    console.log('[Purchases] Monthly purchase initiated');
    // Placeholder — will be replaced with RevenueCat SDK call
    return { success: true };
  } catch (error: any) {
    if (error?.userCancelled) {
      return { success: false };
    }
    throw error;
  }
}

export async function purchaseAnnual(): Promise<{ success: boolean }> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Native purchases are only available on mobile');
  }

  try {
    // TODO: Replace with actual RevenueCat purchase call
    // const { customerInfo } = await Purchases.purchaseProduct('momentum_premium_annual');
    console.log('[Purchases] Annual purchase initiated');
    return { success: true };
  } catch (error: any) {
    if (error?.userCancelled) {
      return { success: false };
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<{ success: boolean; hasActiveSubscription: boolean }> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Restore purchases is only available on mobile');
  }

  try {
    // TODO: Replace with actual RevenueCat restore call
    // const { customerInfo } = await Purchases.restorePurchases();
    // const hasActive = customerInfo.activeSubscriptions.length > 0;
    console.log('[Purchases] Restore purchases initiated');
    return { success: true, hasActiveSubscription: false };
  } catch (error) {
    throw error;
  }
}
