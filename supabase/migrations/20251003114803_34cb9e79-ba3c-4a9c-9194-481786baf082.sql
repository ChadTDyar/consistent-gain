-- Add category and start_date to goals table
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_goals_category ON public.goals(category);