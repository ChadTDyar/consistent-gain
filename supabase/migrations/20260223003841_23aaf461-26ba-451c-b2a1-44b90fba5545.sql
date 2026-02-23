CREATE POLICY "Users can delete own daily context"
  ON public.daily_context FOR DELETE
  USING (auth.uid() = user_id);