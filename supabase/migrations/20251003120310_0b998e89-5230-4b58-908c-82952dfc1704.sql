-- Create chat_messages table for rate limiting and history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own messages
CREATE POLICY "Users can create own messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
  ON public.chat_messages(user_id, created_at DESC);

-- Create table for tracking trigger messages sent
CREATE TABLE IF NOT EXISTS public.coach_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('welcome', 'streak_7', 'missed_3_days', 'premium_welcome')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, trigger_type)
);

-- Enable RLS
ALTER TABLE public.coach_triggers ENABLE ROW LEVEL SECURITY;

-- Users can view their own triggers
CREATE POLICY "Users can view own triggers"
  ON public.coach_triggers
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert triggers (handled by edge function)
CREATE POLICY "Service role can insert triggers"
  ON public.coach_triggers
  FOR INSERT
  WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_coach_triggers_user 
  ON public.coach_triggers(user_id, trigger_type);