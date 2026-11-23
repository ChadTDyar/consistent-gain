# Stripe cancellation does not remove Premium: findings and smallest fix

## 1. Where the app calls check-subscription
Only two places. Neither runs on a timer or on page changes.
- `src/pages/Dashboard.tsx:98` runs once when the page opens (`useEffect([])`, lines 91-104). Function at 120-130. Route `/dashboard` (`src/App.tsx:103`).
- `src/pages/Success.tsx:17`, then 36: up to 3 tries, 2s apart, on `/success` only (`src/App.tsx:110`).
- `/` (`src/App.tsx:100`, Index) and `/settings` (`src/App.tsx:106`) never call it. That is why reloading them changed nothing.
- `src/lib/purchases.ts:82` does not call it on purpose (Apple restore).

## 2. Does anything else remove Premium for a user with no stripe_customers row?
No.
- `stripe-webhook/index.ts:147-183` (`customer.subscription.deleted`) finds the user only through `stripe_customers.stripe_subscription_id` (151-155). With no row, `.single()` errors, it logs "Error finding customer" and `break`s (157-160), then returns 200 (192). Stripe sees success and does not retry.
- The same lookup blocks `checkout.session.completed` (63-72) and `customer.subscription.updated` (108-117). The profile became pro through check-subscription on /success, not through the webhook.
- The stripe_customers row is only written by `create-checkout/index.ts:70-94`. A purchase through the shared checkout skips that, so no row exists.
- `check-subscription/index.ts:44-81` (the earlier no-customer change) does not apply here. The email has a Stripe customer, so it takes the full path (85-113). `resolveEntitlement` returns free when nothing is active or trialing. So **opening /dashboard once should already make the account free.** Worth trying before any change.
- `revenuecat-webhook` only handles Apple. No timed job revokes Stripe access.

## 3. Smallest fix (Apple accounts untouched)
In `supabase/functions/stripe-webhook/index.ts` only, add a fallback for when the stripe_customers lookup finds nothing:
1. Get the customer's email from Stripe (`stripe.customers.retrieve(subscription.customer)`).
2. Find the account with that email.
3. Apply the same profile update the branch already uses. Also add the missing stripe_customers row so later events find the user directly.
Use it in the `deleted` and `updated` branches (also in `checkout.session.completed` for consistency). If no account matches, keep today's log-and-200.

Why Apple accounts stay safe: this only runs on a real Stripe subscription event for a Stripe customer. Apple buyers do not create those events. An account that has both Apple and Stripe can only lose Premium when its own Stripe subscription ends. That is the same open question as before.

Another option (smaller code, weaker): make `/settings` also call check-subscription. It only fixes things when the user visits that page, so the webhook fix is better.

No edits or deploys in this step.
