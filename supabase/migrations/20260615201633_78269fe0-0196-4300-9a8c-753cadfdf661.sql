
DROP POLICY IF EXISTS "Block subscription field writes" ON public.profiles;
CREATE POLICY "Block subscription field writes"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
WITH CHECK (
  subscription_status IS NOT DISTINCT FROM (SELECT p.subscription_status FROM public.profiles p WHERE p.id = auth.uid())
  AND is_premium IS NOT DISTINCT FROM (SELECT p.is_premium FROM public.profiles p WHERE p.id = auth.uid())
  AND plan IS NOT DISTINCT FROM (SELECT p.plan FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update buddy status" ON public.workout_buddies;
CREATE POLICY "Users can update buddy status"
ON public.workout_buddies
FOR UPDATE
TO authenticated
USING (auth.uid() = buddy_id)
WITH CHECK (
  auth.uid() = buddy_id
  AND user_id = (SELECT wb.user_id FROM public.workout_buddies wb WHERE wb.id = workout_buddies.id)
  AND buddy_id = (SELECT wb.buddy_id FROM public.workout_buddies wb WHERE wb.id = workout_buddies.id)
);
