
-- Add plan column to profiles to track Free/Plus/Pro tiers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

-- Migrate existing premium users to 'plus' (legacy default)
UPDATE public.profiles SET plan = 'plus' WHERE is_premium = true;
