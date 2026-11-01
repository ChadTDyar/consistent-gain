# AGENTS.md

- Routes that are both public and in-app (currently /pricing) show the app sidebar/tab bar only once `useAuthStatus()` reports `signed_in`; signed-out visitors get `MarketingHeader` + `SiteFooter`. Why: signed-out visitors were seeing the logged-in app menu.
- Post-auth `redirect` query params must pass `safeRedirectPath()` (src/lib/safeRedirect.ts). Why: prevents open redirects.
- All third-party code stays in the single "vendor" chunk in vite.config.ts, enforced by scripts/check-manual-chunks.mjs. Why: split vendor chunks created a circular import that blanked production.
