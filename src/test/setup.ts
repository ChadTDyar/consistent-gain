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

// jsdom does not implement the PointerEvent constructor as of v25, which
// means fireEvent.pointerDown/pointerUp drops pointerId, isPrimary,
// pointerType, and clientX/clientY when the test passes them in the init
// dict. Polyfill a minimal PointerEvent that extends MouseEvent and
// preserves the pointer-specific properties so component handlers can read
// them in tests the same way they would in a real browser.
if (typeof (globalThis as { PointerEvent?: unknown }).PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    public pointerId: number;
    public isPrimary: boolean;
    public pointerType: string;
    public width: number;
    public height: number;
    public pressure: number;
    public tangentialPressure: number;
    public tiltX: number;
    public tiltY: number;
    public twist: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.isPrimary = init.isPrimary ?? false;
      this.pointerType = init.pointerType ?? "";
      this.width = init.width ?? 1;
      this.height = init.height ?? 1;
      this.pressure = init.pressure ?? 0;
      this.tangentialPressure = init.tangentialPressure ?? 0;
      this.tiltX = init.tiltX ?? 0;
      this.tiltY = init.tiltY ?? 0;
      this.twist = init.twist ?? 0;
    }
  }
  (globalThis as { PointerEvent?: typeof PointerEvent }).PointerEvent =
    PointerEventPolyfill as unknown as typeof PointerEvent;
  (window as { PointerEvent?: typeof PointerEvent }).PointerEvent =
    PointerEventPolyfill as unknown as typeof PointerEvent;
}

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
