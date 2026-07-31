import { lazy, type ComponentType } from "react";

/**
 * React.lazy with retry + hard-reload fallback.
 *
 * Dynamic imports fail when the browser holds a stale index chunk after a new
 * deploy (the hashed chunk URL no longer exists). Retrying once handles flaky
 * networks; a one-time reload handles the stale-bundle case.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 400,
) {
  return lazy(async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await factory();
      } catch (err) {
        if (attempt === retries) {
          const key = "lazy-chunk-reloaded";
          if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            window.location.reload();
            // Give the reload a chance before React surfaces the error.
            return await new Promise<{ default: T }>(() => {});
          }
          throw err;
        }
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
    throw new Error("unreachable");
  });
}
