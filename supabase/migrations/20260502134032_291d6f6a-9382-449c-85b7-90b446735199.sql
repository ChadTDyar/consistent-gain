CREATE OR REPLACE FUNCTION public.grant_premium_unsafe(_user_id uuid, _plan text DEFAULT 'pro')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Bypass the prevent_subscription_status_updates trigger for this op only
  PERFORM set_config('session_replication_role', 'replica', true);

  INSERT INTO public.profiles (id, plan, is_premium, subscription_status)
  VALUES (_user_id, _plan, true, 'active')
  ON CONFLICT (id) DO UPDATE
    SET plan = EXCLUDED.plan,
        is_premium = EXCLUDED.is_premium,
        subscription_status = EXCLUDED.subscription_status;

  PERFORM set_config('session_replication_role', 'origin', true);
END;
$$;

REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.grant_premium_unsafe(uuid, text) TO service_role;