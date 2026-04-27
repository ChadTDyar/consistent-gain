import { describe, it, expect, beforeEach } from "vitest";
import { restoreFocus, captureFocusOrigin } from "./restoreFocus";

describe("restoreFocus", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("focuses the auto-captured trigger when no explicit override is given", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const result = restoreFocus({ auto: trigger });
    expect(result).toBe(trigger);
    expect(document.activeElement).toBe(trigger);
  });

  it("explicit DOM node overrides the auto-captured trigger", () => {
    const trigger = document.createElement("button");
    const override = document.createElement("button");
    document.body.append(trigger, override);
    const result = restoreFocus({ explicit: override, auto: trigger });
    expect(result).toBe(override);
    expect(document.activeElement).toBe(override);
  });

  it("explicit React ref overrides the auto-captured trigger", () => {
    const trigger = document.createElement("button");
    const override = document.createElement("button");
    document.body.append(trigger, override);
    const ref = { current: override };
    const result = restoreFocus({ explicit: ref, auto: trigger });
    expect(result).toBe(override);
  });

  it("returns null and focuses nothing when explicit is null (deliberate opt-out)", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    // Move focus to body so we can detect that null left it alone.
    (document.activeElement as HTMLElement)?.blur();
    const result = restoreFocus({ explicit: null, auto: trigger });
    expect(result).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it("falls back to bodyFallback when the resolved target is disconnected", () => {
    // Trigger gets garbage-collected from the DOM (e.g. parent rerendered
    // it away) — restoration must NOT throw and must walk to the fallback.
    const trigger = document.createElement("button");
    // Note: NOT appended → isConnected is false.
    const main = document.createElement("main");
    document.body.appendChild(main);
    main.tabIndex = -1;
    const result = restoreFocus({ auto: trigger, bodyFallback: main });
    expect(result).toBe(main);
    expect(document.activeElement).toBe(main);
  });

  it("returns null when neither target nor fallback is connected", () => {
    const orphan = document.createElement("button");
    const orphanFallback = document.createElement("main");
    const result = restoreFocus({
      auto: orphan,
      bodyFallback: orphanFallback,
    });
    expect(result).toBeNull();
  });

  it("explicit ref with null .current falls through to auto", () => {
    // A common React pattern: caller declared a ref but the target hasn't
    // mounted yet (or already unmounted). We should NOT treat that as
    // 'opt-out' (which is reserved for explicit `null`).
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const ref = { current: null as HTMLElement | null };
    const result = restoreFocus({ explicit: ref, auto: trigger });
    expect(result).toBe(trigger);
  });
});

describe("captureFocusOrigin", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns the currently focused element", () => {
    const btn = document.createElement("button");
    document.body.appendChild(btn);
    btn.focus();
    expect(captureFocusOrigin()).toBe(btn);
  });

  it("returns null when <body> is the active element (nothing meaningful focused)", () => {
    // Restoring TO body is functionally identical to no restoration but
    // would mask a legitimate "no trigger" signal in telemetry. By
    // collapsing body→null up front, downstream restoreFocus can cleanly
    // fall back to the bodyFallback chain instead.
    document.body.focus();
    expect(captureFocusOrigin()).toBeNull();
  });
});
