# Eliminate the Recharts production chunk cycle

## Changes
- Update only `vite.config.ts` so the existing Recharts dependency matcher returns `vendor` instead of `charts`.
- Correct the nearby comment to describe the React/vendor initialization cycle.
- Leave the `ui` and `landing-below-fold` chunk rules unchanged.

## Verification
- Create a production build and confirm no separate `charts-*.js` file exists.
- Inspect the built `vendor-*.js` to confirm React `forwardRef` and Recharts code are co-located.
- Serve the built output independently from the development server.
- Open the landing page in Chromium and verify it mounts with zero uncaught errors.
- Sign in if needed, open the Progress page, and verify a Recharts chart renders with zero uncaught errors.
- Do not publish; report the production verification results for independent review.

## Technical detail
The matcher list remains intact, but matched chart modules return `vendor`. This removes the `vendor` ↔ `charts` ESM boundary that allowed Recharts to evaluate before its React binding initialized.
