import { Capacitor } from '@capacitor/core';

/**
 * Best-effort one-shot reporter for platform-detection failures. We can't
 * import `@/lib/analytics` at module top because that file imports back into
 * platform helpers in some bundles (and we never want a circular import to
 * tank the iOS build). Lazy `import()` keeps the dependency one-way and
 * keeps the success path zero-cost.
 *
 * Reason vocabulary lives in mem://features/upgrade-wall-observability —
 * keep these strings in sync with the IOSBranchGuard reason set.
 */
let detectFailureReported = false;
const reportDetectFailure = (reason: string) => {
  if (detectFailureReported) return;
  detectFailureReported = true;
  void import('@/lib/analytics')
    .then(({ analytics }) => {
      try {
        analytics.upgradeWallNullReturn('unknown', 'unknown', reason);
      } catch {
        /* analytics must never crash detection */
      }
    })
    .catch(() => {
      /* analytics module load failure — nothing to do */
    });
};

/**
 * Returns true when app is running inside iOS Capacitor wrapper.
 * Used to hide paid subscription UI on iOS builds (Apple IAP compliance)
 * while keeping the web experience unchanged.
 *
 * Wrapped in try/catch because Capacitor's runtime probes have, on rare
 * occasion, thrown when the native bridge isn't ready yet (e.g. during the
 * very first paint of a cold start, or under StrictMode double-invocation).
 * A throw here would crash the upgrade wall before it could render its
 * fallback — strictly worse than the silent-paywall bug we're guarding
 * against. Default to `false` (web behavior) and emit a one-shot
 * `ios_platform_detect_failed` reason so the regression is visible.
 */
export const isIOSNative = (): boolean => {
  try {
    const result = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
    if (typeof result !== 'boolean') {
      reportDetectFailure('ios_platform_detect_failed');
      return false;
    }
    return result;
  } catch {
    reportDetectFailure('ios_platform_detect_failed');
    return false;
  }
};

/**
 * Returns true when app is running inside Android Capacitor wrapper.
 */
export const isAndroidNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
};

/**
 * Returns true when running in any native mobile wrapper.
 */
export const isNativeMobile = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};
