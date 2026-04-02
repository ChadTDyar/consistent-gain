
-- Fix 1: Replace overly permissive coach_triggers INSERT policy
DROP POLICY IF EXISTS "Service role can insert triggers" ON public.coach_triggers;
CREATE POLICY "Users can insert own triggers" ON public.coach_triggers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix 2: Replace testimonials UPDATE policy to prevent self-approval
DROP POLICY IF EXISTS "Users can update own testimonials" ON public.testimonials;
CREATE POLICY "Users can update own testimonials" ON public.testimonials
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_approved = false);
