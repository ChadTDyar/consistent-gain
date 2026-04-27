import { useEffect, useState } from "react";

/**
 * Reads the user's `prefers-reduced-motion` setting and subscribes to changes.
 *
 * Why a hook (vs. relying on the global CSS guard in index.css):
 * - The CSS rule (`@media (prefers-reduced-motion: reduce)`) only neutralizes
 *   animation/transition *durations*. It cannot stop us from *applying* an
 *   animation class in the first place. Some screen readers + browsers still
 *   announce the existence of an `animation-name` on a newly-mounted dialog,
 *   and elements with active transforms can still interfere with focus
 *   restoration when the modal unmounts.
 * - For modals specifically (WCAG 2.3.3 — Animation from Interactions) we
 *   want to *opt out of the entry/exit animation entirely* — render the
 *   modal in its final visual state immediately — rather than just shorten
 *   it. This hook lets components branch on the user preference at render
 *   time so they can omit the animation class altogether.
 *
 * SSR-safe: returns `false` during initial render (no `window`), then
 * synchronizes after mount. UpgradeWall is portal-rendered after client
 * hydration so this is fine in practice.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    // Older Safari uses addListener/removeListener; modern browsers use
    // addEventListener. Cover both so we don't silently skip updates on
    // iOS Safari < 14.
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  return prefersReduced;
}
