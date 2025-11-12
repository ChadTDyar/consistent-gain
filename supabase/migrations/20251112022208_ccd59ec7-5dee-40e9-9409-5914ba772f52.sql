-- Pain tracking table for body map reports
CREATE TABLE public.pain_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  body_area TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pain_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pain reports"
  ON public.pain_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pain reports"
  ON public.pain_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pain reports"
  ON public.pain_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pain reports"
  ON public.pain_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Exercise alternatives table
CREATE TABLE public.exercise_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_exercise TEXT NOT NULL,
  body_area TEXT NOT NULL,
  alternative_exercise TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make exercise alternatives public (everyone can read)
ALTER TABLE public.exercise_alternatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise alternatives"
  ON public.exercise_alternatives FOR SELECT
  USING (true);

-- Cost tracking table
CREATE TABLE public.cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.cost_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own costs"
  ON public.cost_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own costs"
  ON public.cost_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own costs"
  ON public.cost_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own costs"
  ON public.cost_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- Workout buddies table for social accountability
CREATE TABLE public.workout_buddies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, buddy_id)
);

ALTER TABLE public.workout_buddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own buddy relationships"
  ON public.workout_buddies FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

CREATE POLICY "Users can create buddy requests"
  ON public.workout_buddies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update buddy status"
  ON public.workout_buddies FOR UPDATE
  USING (auth.uid() = buddy_id);

-- Add photo support to activity logs
ALTER TABLE public.activity_logs
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add theme preference to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system'));