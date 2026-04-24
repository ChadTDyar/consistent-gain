-- Bypass the prevent_subscription_status_updates trigger for this seed
SET session_replication_role = replica;

-- Profiles: upsert both reviewers as Premium
INSERT INTO public.profiles (id, name, plan, is_premium, subscription_status, theme_preference, reminder_enabled)
VALUES
  ('e63d6163-4957-4bee-a64a-fdddc2a1c059', 'App Store Reviewer', 'premium', true, 'active', 'system', true),
  ('1851212a-7f5b-45be-8edb-c3b88b085040', 'App Store Reviewer', 'premium', true, 'active', 'system', true)
ON CONFLICT (id) DO UPDATE
SET plan = EXCLUDED.plan,
    is_premium = EXCLUDED.is_premium,
    subscription_status = EXCLUDED.subscription_status,
    name = COALESCE(public.profiles.name, EXCLUDED.name);

SET session_replication_role = origin;

-- Wipe any prior seed data (idempotent reseed)
DELETE FROM public.activity_logs WHERE user_id IN ('e63d6163-4957-4bee-a64a-fdddc2a1c059','1851212a-7f5b-45be-8edb-c3b88b085040');
DELETE FROM public.goals         WHERE user_id IN ('e63d6163-4957-4bee-a64a-fdddc2a1c059','1851212a-7f5b-45be-8edb-c3b88b085040');
DELETE FROM public.daily_context WHERE user_id IN ('e63d6163-4957-4bee-a64a-fdddc2a1c059','1851212a-7f5b-45be-8edb-c3b88b085040');

-- 3 goals per reviewer (deterministic IDs so re-runs are idempotent)
INSERT INTO public.goals (id, user_id, title, description, category, target_days_per_week, start_date)
VALUES
  ('11111111-1111-1111-1111-111111111111','e63d6163-4957-4bee-a64a-fdddc2a1c059','Morning run','30-min morning run','cardio',5,'2026-03-26'),
  ('22222222-2222-2222-2222-222222222222','e63d6163-4957-4bee-a64a-fdddc2a1c059','Evening walk','20-min walk after dinner','cardio',7,'2026-03-26'),
  ('33333333-3333-3333-3333-333333333333','e63d6163-4957-4bee-a64a-fdddc2a1c059','Stretch routine','10-min mobility','mobility',7,'2026-03-26'),
  ('44444444-4444-4444-4444-444444444444','1851212a-7f5b-45be-8edb-c3b88b085040','Morning run','30-min morning run','cardio',5,'2026-03-26'),
  ('55555555-5555-5555-5555-555555555555','1851212a-7f5b-45be-8edb-c3b88b085040','Evening walk','20-min walk after dinner','cardio',7,'2026-03-26'),
  ('66666666-6666-6666-6666-666666666666','1851212a-7f5b-45be-8edb-c3b88b085040','Stretch routine','10-min mobility','mobility',7,'2026-03-26');

-- 30 days × 3 habits × 2 reviewers = 180 activity_logs
INSERT INTO public.activity_logs (user_id, goal_id, completed_at, duration_minutes, intensity_level, session_type, rpe_rating, is_deleted)
SELECT u.user_id, u.goal_id, d::date, u.duration, u.intensity, 'regular', u.rpe, false
FROM (
  VALUES
    ('e63d6163-4957-4bee-a64a-fdddc2a1c059'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 30, 'medium', 6),
    ('e63d6163-4957-4bee-a64a-fdddc2a1c059'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 20, 'low',    4),
    ('e63d6163-4957-4bee-a64a-fdddc2a1c059'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 10, 'low',    3),
    ('1851212a-7f5b-45be-8edb-c3b88b085040'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 30, 'medium', 6),
    ('1851212a-7f5b-45be-8edb-c3b88b085040'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 20, 'low',    4),
    ('1851212a-7f5b-45be-8edb-c3b88b085040'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 10, 'low',    3)
) AS u(user_id, goal_id, duration, intensity, rpe)
CROSS JOIN generate_series('2026-03-26'::date, '2026-04-24'::date, interval '1 day') AS d;

-- 7 days of daily context per reviewer
INSERT INTO public.daily_context (user_id, date, sleep_quality, energy_level, sleep_notes)
SELECT u, d::date, 4, 4, 'Felt rested'
FROM (VALUES ('e63d6163-4957-4bee-a64a-fdddc2a1c059'::uuid),('1851212a-7f5b-45be-8edb-c3b88b085040'::uuid)) AS r(u)
CROSS JOIN generate_series('2026-04-18'::date, '2026-04-24'::date, interval '1 day') AS d;