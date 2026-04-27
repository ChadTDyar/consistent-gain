import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom does not implement document.elementFromPoint. Components that perform
// pointer hit-testing (e.g. UpgradeWall's outside-click guard) need a sane
// stand-in. Tests inject a hint via window.__elementFromPointTarget when they
// want a specific element to be returned; otherwise we fall back to
// document.body. This is intentionally minimal — full geometry-based hit
// testing is out of scope for unit tests.
declare global {
  interface Window {
    __elementFromPointTarget?: Element | null;
  }
}
if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = ((_x: number, _y: number) => {
    if ("__elementFromPointTarget" in window) {
      return window.__elementFromPointTarget ?? null;
    }
    return document.body;
  }) as typeof document.elementFromPoint;
}

// jsdom provides setPointerCapture/releasePointerCapture as no-op stubs on
// Element since v16, but defensively ensure they exist so the component's
// try/catch path is exercised consistently.
if (typeof Element.prototype.setPointerCapture !== "function") {
  Element.prototype.setPointerCapture = function () {};
}
if (typeof Element.prototype.releasePointerCapture !== "function") {
  Element.prototype.releasePointerCapture = function () {};
}
