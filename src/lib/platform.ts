import { Capacitor } from "@capacitor/core";

/**
 * Platform / runtime detection.
 *
 * Why this isn't just `Capacitor.isNativePlatform()`:
 * - Capacitor only knows about apps it wraps. Some users open the same web
 *   build from iOS Safari and "Add to Home Screen" — running as a standalone
 *   PWA inside iOS WebKit. Those sessions need the same App-Review-safe
 *   upgrade flow as the native shell, because in-app purchase is unavailable
 *   AND any "buy" CTA in a standalone iOS web context is the worst UX
 *   (opens the App Store, breaks the paying flow).
 * - On rare boot races, `Capacitor.getPlatform()` may briefly return "web"
 *   inside the iOS shell before the native bridge attaches. We fall back to
 *   UA + WKWebView heuristics so the paywall never shows the wrong variant
 *   during that window.
 * - We cache the result (lazy, per-runtime) because every UpgradeWall mount
 *   asks the question and the answer cannot change without a page reload.
 *
 * Detection precedence (first match wins, evaluated lazily, cached):
 *   1. Capacitor native bridge → trust `getPlatform()` directly. Authoritative.
 *   2. iOS UA + standalone display-mode (Add-to-Home-Screen PWA on iOS).
 *   3. iOS UA + WKWebView heuristic (`window.webkit.messageHandlers`),
 *      which catches non-Capacitor iOS native shells and edge boot races.
 *
 * Tests can reset the cache with `__resetPlatformCacheForTests()`.
 */

type PlatformKind = "ios-native" | "android-native" | "web";

let cachedPlatform: PlatformKind | null = null;

/** SSR / non-DOM safety. */
const hasWindow = (): boolean => typeof window !== "undefined";
const hasNavigator = (): boolean => typeof navigator !== "undefined";

/**
 * iOS UA detection that survives iPad's "Request Desktop Site" default
 * (which makes iPadOS UA look like macOS Safari). The platform check for
 * `MacIntel` + `maxTouchPoints > 1` is the canonical Apple-recommended
 * iPadOS workaround. We deliberately exclude desktop Safari (no touch).
 */
const isIOSUserAgent = (): boolean => {
  if (!hasNavigator()) return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ desktop-mode masquerade.
  const isMacLike = navigator.platform === "MacIntel";
  const hasTouch =
    typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  return isMacLike && hasTouch;
};

/**
 * Standalone display mode = installed PWA / Add-to-Home-Screen on iOS.
 * Two checks because Apple historically only exposed `navigator.standalone`
 * (non-standard) and only later honored the `display-mode: standalone`
 * media query in WebKit. Either one is sufficient.
 */
const isStandaloneDisplay = (): boolean => {
  if (!hasWindow()) return false;
  // Standard CSS media query (WebKit + Chromium).
  try {
    if (window.matchMedia?.("(display-mode: standalone)")?.matches) return true;
  } catch {
    /* matchMedia can throw in very old WebViews — ignore */
  }
  // Apple-specific legacy flag (iOS Safari home-screen apps).
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
};

/**
 * WKWebView heuristic. iOS native shells (Capacitor, Cordova, custom Swift
 * apps) all expose `window.webkit.messageHandlers`. Mobile Safari does NOT.
 * This catches the edge case where a different native wrapper embeds our
 * web build without Capacitor.
 */
const isWKWebView = (): boolean => {
  if (!hasWindow()) return false;
  const w = window as unknown as {
    webkit?: { messageHandlers?: unknown };
  };
  return !!w.webkit?.messageHandlers;
};

const detectPlatform = (): PlatformKind => {
  // 1. Capacitor is authoritative when present and reporting non-web.
  try {
    if (Capacitor.isNativePlatform()) {
      const p = Capacitor.getPlatform();
      if (p === "ios") return "ios-native";
      if (p === "android") return "android-native";
    }
  } catch {
    /* Capacitor not initialized yet — fall through to heuristics. */
  }

  // 2. + 3. iOS heuristics for non-Capacitor native shells, A2HS PWAs on iOS,
  //         and the brief boot window before Capacitor's bridge attaches.
  if (isIOSUserAgent() && (isStandaloneDisplay() || isWKWebView())) {
    return "ios-native";
  }

  return "web";
};

const getPlatform = (): PlatformKind => {
  if (cachedPlatform === null) cachedPlatform = detectPlatform();
  return cachedPlatform;
};

/**
 * Returns true when the runtime should use the iOS native upgrade
 * experience (App-Review-safe fallback, no purchase CTA, no price).
 *
 * Returns true for:
 *   - Capacitor iOS native builds
 *   - Other iOS native shells embedding the web build (WKWebView)
 *   - iOS standalone PWAs (Add to Home Screen) — IAP unavailable, so we
 *     can't safely show a checkout CTA without surprising the user
 *
 * Returns false in mobile Safari tabs, Chrome iOS (Blink-on-WebKit), Android,
 * and desktop browsers.
 */
export const isIOSNative = (): boolean => getPlatform() === "ios-native";

/**
 * Returns true when running inside the Android Capacitor wrapper.
 */
export const isAndroidNative = (): boolean =>
  getPlatform() === "android-native";

/**
 * Returns true when running inside any native mobile wrapper (Capacitor or
 * other WKWebView-based shell on iOS). Standalone PWAs on iOS are included
 * because they share the IAP-restricted experience.
 */
export const isNativeMobile = (): boolean => getPlatform() !== "web";

/**
 * Test-only: clear the memoized platform decision so individual tests can
 * mock different runtimes without polluting one another. Intentionally not
 * exported through a barrel — production callers should never need it.
 */
export const __resetPlatformCacheForTests = (): void => {
  cachedPlatform = null;
};
