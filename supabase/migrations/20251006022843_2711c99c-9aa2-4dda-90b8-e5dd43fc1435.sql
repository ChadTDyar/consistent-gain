-- Add RPE and intensity tracking to activity logs
ALTER TABLE activity_logs
ADD COLUMN rpe_rating integer CHECK (rpe_rating >= 1 AND rpe_rating <= 10),
ADD COLUMN intensity_level text CHECK (intensity_level IN ('low', 'medium', 'high')),
ADD COLUMN session_type text DEFAULT 'regular' CHECK (session_type IN ('microblock', 'regular')),
ADD COLUMN duration_minutes integer;

-- Create daily context table for sleep and other daily notes
CREATE TABLE daily_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  sleep_notes text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on daily_context
ALTER TABLE daily_context ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_context
CREATE POLICY "Users can view own daily context"
  ON daily_context FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily context"
  ON daily_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily context"
  ON daily_context FOR UPDATE
  USING (auth.uid() = user_id);

-- Create microblock templates table
CREATE TABLE microblock_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 10,
  intensity_level text CHECK (intensity_level IN ('low', 'medium', 'high')),
  joint_friendly boolean DEFAULT true,
  exercises jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on microblock_templates (public read)
ALTER TABLE microblock_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view microblock templates"
  ON microblock_templates FOR SELECT
  USING (true);

-- Insert some default knee-friendly microblock templates
INSERT INTO microblock_templates (title, description, duration_minutes, intensity_level, joint_friendly, exercises) VALUES
  ('Gentle Mobility Flow', 'Low-impact movements to wake up your body between meetings', 10, 'low', true, 
   '["Seated cat-cow stretches", "Ankle circles", "Gentle hip hinges", "Wall push-ups", "Standing march in place"]'::jsonb),
  ('Desk Reset', 'Quick strength maintenance without leaving your workspace', 12, 'medium', true,
   '["Chair squats (5 reps)", "Counter push-ups (8 reps)", "Standing knee raises", "Wall sits (20 sec)", "Calf raises"]'::jsonb),
  ('Recovery Rebuild', 'Ultra-gentle session for rebuilding after a break', 10, 'low', true,
   '["Breathing exercises", "Gentle seated twists", "Ankle pumps", "Arm circles", "Progressive muscle relaxation"]'::jsonb);

-- Create streak repair table to track compassionate check-ins
CREATE TABLE streak_repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  repair_date date NOT NULL DEFAULT CURRENT_DATE,
  days_missed integer,
  repair_message text,
  user_response text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on streak_repairs
ALTER TABLE streak_repairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak repairs"
  ON streak_repairs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak repairs"
  ON streak_repairs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX idx_daily_context_user_date ON daily_context(user_id, date);
CREATE INDEX idx_streak_repairs_user_date ON streak_repairs(user_id, repair_date);