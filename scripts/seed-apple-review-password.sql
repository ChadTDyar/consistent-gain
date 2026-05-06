-- One-shot manual seed: reset the Apple review demo account password.
--
-- Origin: previously shipped as migrations 20260424174852 and 20260424175833,
-- both of which mutated auth.users.encrypted_password on every fresh Supabase
-- instance. That is unwanted behavior for a persistent migration, so the
-- mutations were extracted here as a manual one-shot script (blocker 141).
--
-- HOW TO RUN
--   psql "$SUPABASE_DB_URL" -f scripts/seed-apple-review-password.sql
--
-- WHEN TO RUN
--   - Only when the Apple review reviewer reports the demo login is broken.
--   - Only against an environment where 'apple-review@momentumfit.app' exists.
--   - Prefer the seed-apple-review edge function (which now reads the password
--     from APPLE_REVIEW_SEED_PASSWORD) over running this script directly.
--
-- DO NOT add this file to supabase/migrations/. It is intentionally outside
-- the migrations directory so it never auto-applies on a fresh Supabase
-- instance.

UPDATE auth.users
SET
  encrypted_password = crypt('MomentumDemo2025!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'apple-review@momentumfit.app';
