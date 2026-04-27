import { useEffect } from "react";

// Module-level ref-counter so multiple modals mounted simultaneously don't
// fight over the body lock. The lock is only applied/removed at the
// 0 → 1 and 1 → 0 transitions; intermediate locks just bump the count.
//
// Why a counter instead of a simple effect?
// - If two overlays open near-simultaneously (e.g. an UpgradeWall and a Toast
//   that promotes itself to a modal), the second unmount would otherwise
//   restore body scroll while the first overlay is still visible — breaking
//   its focus trap and letting the page scroll behind it.
let lockCount = 0;
let savedScrollY = 0;
let savedStyles: {
  overflow: string;
  position: string;
  top: string;
  width: string;
  paddingRight: string;
} | null = null;

function applyLock() {
  const body = document.body;
  const html = document.documentElement;

  // Preserve the user's current scroll position. We can't just set
  // overflow:hidden — on iOS Safari the page still rubber-bands and the focus
  // trap inside the modal can get disrupted by background scroll momentum.
  // The position:fixed + top:-scrollY trick freezes the layout reliably
  // across desktop, Android Chrome, and iOS Safari.
  savedScrollY = window.scrollY || html.scrollTop || 0;

  // Compensate for the disappearing vertical scrollbar so content underneath
  // the modal doesn't shift horizontally when we lock. innerWidth is the
  // viewport including the scrollbar gutter; clientWidth excludes it.
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  savedStyles = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
  };

  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.width = "100%";
  if (scrollbarWidth > 0) {
    // Preserve any existing padding-right (e.g. from a layout system) by
    // adding to it rather than overwriting.
    const existing = parseInt(savedStyles.paddingRight, 10) || 0;
    body.style.paddingRight = `${existing + scrollbarWidth}px`;
  }
}

function releaseLock() {
  const body = document.body;
  if (!savedStyles) return;

  body.style.overflow = savedStyles.overflow;
  body.style.position = savedStyles.position;
  body.style.top = savedStyles.top;
  body.style.width = savedStyles.width;
  body.style.paddingRight = savedStyles.paddingRight;
  savedStyles = null;

  // Restore the user's scroll position. window.scrollTo is synchronous and
  // doesn't trigger smooth-scroll, so the user lands exactly where they were
  // even on long pages. Wrapped in try/catch because some test environments
  // (jsdom) don't implement scrollTo and would log noisy warnings.
  try {
    window.scrollTo(0, savedScrollY);
  } catch {
    /* no-op */
  }
}

/**
 * Lock background body scroll while a modal/overlay is mounted.
 *
 * - Uses a module-level ref counter so multiple concurrent locks compose
 *   safely (only the outermost lock applies/releases the styles).
 * - Preserves and restores scroll position across the lock window.
 * - Compensates for scrollbar width so background content doesn't reflow.
 * - Pass `enabled = false` to opt out (e.g. when a variant is server-rendered
 *   or the platform doesn't need it).
 */
export function useBodyScrollLock(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof document === "undefined") return;
    // Defensive: if document.body is missing or detached (pre-hydration race,
    // jsdom test harness with body removed) skip the lock entirely. The
    // alternative — letting applyLock() touch body.style — would throw and
    // crash the modal that called us.
    if (!document.body || !document.body.isConnected) return;

    lockCount += 1;
    if (lockCount === 1) {
      applyLock();
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && document.body && document.body.isConnected) {
        releaseLock();
      }
    };
  }, [enabled]);
}
