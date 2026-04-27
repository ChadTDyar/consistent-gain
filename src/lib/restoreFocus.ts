/**
 * Restore keyboard focus to a sensible target after a modal/overlay closes.
 *
 * WCAG 2.4.3 (Focus Order) requires that closing a modal returns focus to
 * a meaningful element — ideally the trigger that opened it — so keyboard
 * and screen-reader users don't get dumped at <body> and have to re-walk
 * the document.
 *
 * Resolution priority:
 *   1. `explicit` — caller-supplied override (React ref, DOM node, or `null`).
 *      `null` means "I deliberately don't want any restoration."
 *   2. `auto` — the element that was focused immediately before the modal
 *      took focus (typically captured from `document.activeElement` at
 *      open time).
 *   3. `bodyFallback` — last-resort focusable container (usually `<body>`
 *      via a tabIndex=-1 wrapper, or a `<main>` landmark) so screen readers
 *      have a stable anchor instead of nothing.
 *
 * Each candidate is checked for `isConnected` before focusing — the trigger
 * may have unmounted while the modal was open (e.g. a "locked" card that
 * disappears after upgrade). `preventScroll: true` keeps long pages from
 * jolting on close.
 *
 * Returns the element that actually received focus, or `null` if every
 * candidate was unusable (caller can use this for telemetry).
 */
export function restoreFocus(opts: {
  explicit?: React.RefObject<HTMLElement> | HTMLElement | null;
  auto: HTMLElement | null;
  bodyFallback?: HTMLElement | null;
}): HTMLElement | null {
  const { explicit, auto, bodyFallback } = opts;

  // Resolve the explicit override first. `undefined` means "no override
  // supplied" (use auto). `null` means "opt out entirely" (return null).
  let target: HTMLElement | null;
  if (explicit === null) {
    return null;
  } else if (explicit && typeof explicit === "object" && "current" in explicit) {
    target = explicit.current ?? auto;
  } else if (explicit instanceof HTMLElement) {
    target = explicit;
  } else {
    target = auto;
  }

  // Walk the candidate chain: explicit/auto → bodyFallback. Each candidate
  // must be in the DOM and have a usable focus() before we accept it.
  const candidates: Array<HTMLElement | null> = [target, bodyFallback ?? null];
  for (const candidate of candidates) {
    if (
      candidate &&
      candidate.isConnected &&
      typeof candidate.focus === "function"
    ) {
      try {
        candidate.focus({ preventScroll: true });
      } catch {
        candidate.focus();
      }
      return candidate;
    }
  }
  return null;
}

/**
 * Capture the currently-focused element if it's a meaningful target.
 * `<body>` is treated as "nothing focused" — restoring to body is identical
 * to no restoration but masks the absence in telemetry.
 */
export function captureFocusOrigin(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const active = document.activeElement as HTMLElement | null;
  return active && active !== document.body ? active : null;
}
