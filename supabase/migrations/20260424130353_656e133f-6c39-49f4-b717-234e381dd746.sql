CREATE OR REPLACE FUNCTION public.admin_set_premium(
  _user_id uuid,
  _plan text,
  _is_premium boolean,
  _subscription_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can call admin_set_premium';
  END IF;

  -- Bypass the prevent_subscription_status_updates trigger for this op only
  PERFORM set_config('session_replication_role', 'replica', true);

  INSERT INTO public.profiles (id, plan, is_premium, subscription_status)
  VALUES (_user_id, _plan, _is_premium, _subscription_status)
  ON CONFLICT (id) DO UPDATE
    SET plan = EXCLUDED.plan,
        is_premium = EXCLUDED.is_premium,
        subscription_status = EXCLUDED.subscription_status;

  PERFORM set_config('session_replication_role', 'origin', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_premium(uuid, text, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_premium(uuid, text, boolean, text) TO authenticated, service_role;