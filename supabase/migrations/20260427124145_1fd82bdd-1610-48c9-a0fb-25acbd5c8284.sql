-- ITEM 2: Reset the Apple Review demo account password back to the documented value
-- (AppleRev2026!MOM) after two earlier migrations set it to MomentumDemo2025!
update auth.users
set encrypted_password = crypt('AppleRev2026!MOM', gen_salt('bf')),
    updated_at = now()
where email = 'apple-review@momentumfit.app';

-- ITEM 3: Composite partial index to accelerate the per-user activity-logs progress
-- query (ProgressTab) which filters on user_id, sorts by completed_at DESC,
-- and excludes soft-deleted rows.
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_completed
  ON public.activity_logs(user_id, completed_at DESC)
  WHERE is_deleted = false;