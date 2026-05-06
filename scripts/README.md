# scripts/

One-shot operational scripts. **Nothing in this directory runs automatically.**
Anything here must be invoked manually by an operator.

## seed-apple-review-password.sql

Resets the password for the Apple review demo account
(`apple-review@momentumfit.app`) to the hardcoded demo value used by Apple
reviewers.

### When to run
- The Apple review reviewer reports the demo login is broken.
- Never on a fresh Supabase instance as part of bring-up. The Apple review
  account is provisioned by the `seed-apple-review` edge function, which
  reads the password from the `APPLE_REVIEW_SEED_PASSWORD` env var. Prefer
  that function over running this script directly.

### How to run
```bash
psql "$SUPABASE_DB_URL" -f scripts/seed-apple-review-password.sql
```

### Background
This script replaces two persistent migrations
(`20260424174852_*.sql` and `20260424175833_*.sql`) that mutated
`auth.users.encrypted_password` on every fresh Supabase instance. They were
removed under blocker 141 to stop unwanted state mutations on bring-up.

## lint-info-plist.cjs

CI-only lint for `ios/App/App/Info.plist`. Not run manually.
