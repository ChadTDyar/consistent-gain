ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_goals_user_active
  ON public.goals (user_id)
  WHERE deleted_at IS NULL AND is_archived = false;