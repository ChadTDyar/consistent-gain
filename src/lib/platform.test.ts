import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Capacitor BEFORE importing the module under test so the module
// captures our spies. We re-import platform.ts via dynamic import in each
// test so the cache resets cleanly even if the helper isn't called.
vi.mock("@capacitor/core", () => {
  return {
    Capacitor: {
      isNativePlatform: vi.fn(() => false),
      getPlatform: vi.fn(() => "web"),
    },
  };
});

import { Capacitor } from "@capacitor/core";

const reload = async () => {
  vi.resetModules();
  return import("./platform");
};

type NavMutable = Navigator & {
  standalone?: boolean;
  __originalUA?: string;
  __originalPlatform?: string;
  __originalMaxTouch?: number;
};

const setUA = (ua: string) => {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
};
const setPlatform = (p: string) => {
  Object.defineProperty(window.navigator, "platform", {
    value: p,
    configurable: true,
  });
};
const setMaxTouchPoints = (n: number) => {
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    value: n,
    configurable: true,
  });
};
const setStandalone = (v: boolean | undefined) => {
  Object.defineProperty(window.navigator, "standalone", {
    value: v,
    configurable: true,
  });
};
const setMatchMediaStandalone = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn().mockImplementation((q: string) => ({
      matches: q.includes("standalone") ? matches : false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
    configurable: true,
  });
};
const setWKWebView = (present: boolean) => {
  if (present) {
    (window as unknown as { webkit?: unknown }).webkit = {
      messageHandlers: {},
    };
  } else {
    delete (window as unknown as { webkit?: unknown }).webkit;
  }
};

describe("platform detection", () => {
  let originalUA: string;
  let originalPlatform: string;
  let originalMaxTouch: number;

  beforeEach(() => {
    originalUA = navigator.userAgent;
    originalPlatform = navigator.platform;
    originalMaxTouch = navigator.maxTouchPoints;
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("web");
    setStandalone(undefined);
    setMatchMediaStandalone(false);
    setWKWebView(false);
  });

  afterEach(() => {
    setUA(originalUA);
    setPlatform(originalPlatform);
    setMaxTouchPoints(originalMaxTouch);
    setWKWebView(false);
    vi.clearAllMocks();
  });

  it("trusts Capacitor when reporting iOS native", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");
    const m = await reload();
    expect(m.isIOSNative()).toBe(true);
    expect(m.isAndroidNative()).toBe(false);
    expect(m.isNativeMobile()).toBe(true);
  });

  it("trusts Capacitor when reporting Android native", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("android");
    const m = await reload();
    expect(m.isAndroidNative()).toBe(true);
    expect(m.isIOSNative()).toBe(false);
    expect(m.isNativeMobile()).toBe(true);
  });

  it("detects iOS standalone PWA (Add to Home Screen) via display-mode", async () => {
    setUA(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
    );
    setMatchMediaStandalone(true);
    const m = await reload();
    expect(m.isIOSNative()).toBe(true);
    expect(m.isNativeMobile()).toBe(true);
  });

  it("detects iOS standalone PWA via legacy navigator.standalone", async () => {
    setUA(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
    );
    setStandalone(true);
    const m = await reload();
    expect(m.isIOSNative()).toBe(true);
  });

  it("detects non-Capacitor iOS WKWebView via window.webkit.messageHandlers", async () => {
    setUA(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
    );
    setWKWebView(true);
    const m = await reload();
    expect(m.isIOSNative()).toBe(true);
  });

  it("detects iPadOS desktop-mode masquerade (MacIntel + touch) as iOS", async () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
    );
    setPlatform("MacIntel");
    setMaxTouchPoints(5);
    setWKWebView(true);
    const m = await reload();
    expect(m.isIOSNative()).toBe(true);
  });

  it("does NOT classify mobile Safari tab as iOS native", async () => {
    setUA(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1"
    );
    // No standalone, no WKWebView → just a browser tab.
    const m = await reload();
    expect(m.isIOSNative()).toBe(false);
    expect(m.isNativeMobile()).toBe(false);
  });

  it("does NOT classify desktop Safari as iOS native", async () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15"
    );
    setPlatform("MacIntel");
    setMaxTouchPoints(0); // no touch → real desktop
    const m = await reload();
    expect(m.isIOSNative()).toBe(false);
  });

  it("does NOT classify Android Chrome as iOS", async () => {
    setUA(
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/120.0"
    );
    const m = await reload();
    expect(m.isIOSNative()).toBe(false);
    expect(m.isNativeMobile()).toBe(false);
  });

  it("memoizes the result across calls", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");
    const m = await reload();
    expect(m.isIOSNative()).toBe(true);
    // Flip Capacitor mid-session — should NOT change because of cache.
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("web");
    expect(m.isIOSNative()).toBe(true);
    // Reset cache → re-detects.
    m.__resetPlatformCacheForTests();
    expect(m.isIOSNative()).toBe(false);
  });

  it("falls back to heuristics if Capacitor throws during boot", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockImplementation(() => {
      throw new Error("bridge not ready");
    });
    setUA(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
    );
    setWKWebView(true);
    const m = await reload();
    expect(m.isIOSNative()).toBe(true);
  });
});
