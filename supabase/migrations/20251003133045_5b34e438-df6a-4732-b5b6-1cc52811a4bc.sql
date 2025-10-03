-- 1) Restrict column-level UPDATE privileges to safe fields only for authenticated users
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (name, reminder_enabled) ON TABLE public.profiles TO authenticated;

-- 2) Replace the existing UPDATE policy with a clear owner-scoped one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE 'DROP POLICY "Users can update own profile" ON public.profiles';
  END IF;
END $$;

CREATE POLICY "Users can update own profile (owner)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- 3) Add a trigger to block sensitive field updates from non-service role sessions
CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow backend service operations (Stripe webhooks, etc.)
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block modifications to sensitive billing/subscription fields by regular users
  IF NEW.stripe_customer_id    IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.is_premium          IS DISTINCT FROM OLD.is_premium
     OR NEW.current_period_end  IS DISTINCT FROM OLD.current_period_end THEN
    RAISE EXCEPTION 'Updating billing/subscription fields is not allowed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_sensitive_profile_updates ON public.profiles;
CREATE TRIGGER trg_prevent_sensitive_profile_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_sensitive_profile_updates();
