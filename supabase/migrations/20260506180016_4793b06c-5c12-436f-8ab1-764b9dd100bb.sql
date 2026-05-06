-- blocker 161: document scope of grant_premium_unsafe and the trigger GUC bypass.
-- No behavior changes. Bodies are reproduced verbatim from prior migrations.

CREATE OR REPLACE FUNCTION public.prevent_subscription_status_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow backend service operations
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- DO NOT set app.bypass_sub_trigger from any webhook (Stripe, RevenueCat, etc.).
  -- This GUC bypass exists ONLY for disposable seeding helpers
  -- (see public.grant_premium_unsafe). Production subscription writes must go
  -- through the normal trigger-enforced path so this branch never matches.
  IF current_setting('app.bypass_sub_trigger', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    RAISE EXCEPTION 'Updating subscription status fields is not allowed';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.grant_premium_unsafe(_user_id uuid, _plan text DEFAULT 'pro')
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- DO NOT call this from any webhook (Stripe, RevenueCat, etc.).
  -- Disposable seeding only (e.g. seed-vera-test). This function flips the
  -- session-local app.bypass_sub_trigger GUC to skip the
  -- prevent_subscription_status_updates trigger so the seed can mark a test
  -- profile premium. EXECUTE is granted to service_role only.
  PERFORM set_config('app.bypass_sub_trigger', 'on', true);

  INSERT INTO public.profiles (id, plan, is_premium, subscription_status)
  VALUES (_user_id, _plan, true, 'active')
  ON CONFLICT (id) DO UPDATE
    SET plan = EXCLUDED.plan,
        is_premium = EXCLUDED.is_premium,
        subscription_status = EXCLUDED.subscription_status;

  PERFORM set_config('app.bypass_sub_trigger', 'off', true);
END;
$function$;

REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.grant_premium_unsafe(uuid, text) TO service_role;