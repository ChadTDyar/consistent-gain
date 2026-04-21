import { Capacitor } from '@capacitor/core';

/**
 * Returns true when app is running inside iOS Capacitor wrapper.
 * Used to hide paid subscription UI on iOS builds (Apple IAP compliance)
 * while keeping the web experience unchanged.
 */
export const isIOSNative = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
};

/**
 * Returns true when app is running inside Android Capacitor wrapper.
 */
export const isAndroidNative = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Returns true when running in any native mobile wrapper.
 */
export const isNativeMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};
