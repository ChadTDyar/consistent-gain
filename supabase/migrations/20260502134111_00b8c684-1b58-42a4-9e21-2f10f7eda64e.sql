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

  -- Allow when an internal seed helper sets this session-local flag
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
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.bypass_sub_trigger', 'on', true);

  INSERT INTO public.profiles (id, plan, is_premium, subscription_status)
  VALUES (_user_id, _plan, true, 'active')
  ON CONFLICT (id) DO UPDATE
    SET plan = EXCLUDED.plan,
        is_premium = EXCLUDED.is_premium,
        subscription_status = EXCLUDED.subscription_status;

  PERFORM set_config('app.bypass_sub_trigger', 'off', true);
END;
$$;

REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.grant_premium_unsafe(uuid, text) TO service_role;