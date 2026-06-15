
-- Defense-in-depth: add RESTRICTIVE RLS policy preventing authenticated users
-- from writing subscription fields on profiles, even if the trigger is ever
-- dropped/disabled. service_role is unaffected (RLS doesn't apply).
CREATE POLICY "Block subscription field writes"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM public.profiles WHERE id = profiles.id)
  AND is_premium IS NOT DISTINCT FROM (SELECT is_premium FROM public.profiles WHERE id = profiles.id)
  AND plan IS NOT DISTINCT FROM (SELECT plan FROM public.profiles WHERE id = profiles.id)
);

-- Lock workout_buddies updates so the buddy can change status but cannot
-- reassign user_id / buddy_id ownership of the row.
DROP POLICY IF EXISTS "Users can update buddy status" ON public.workout_buddies;
CREATE POLICY "Users can update buddy status"
ON public.workout_buddies
FOR UPDATE
TO authenticated
USING (auth.uid() = buddy_id)
WITH CHECK (
  auth.uid() = buddy_id
  AND user_id = (SELECT user_id FROM public.workout_buddies wb WHERE wb.id = workout_buddies.id)
  AND buddy_id = (SELECT buddy_id FROM public.workout_buddies wb WHERE wb.id = workout_buddies.id)
);
