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

  -- Disposable seeding bypass (see public.grant_premium_unsafe). Never set
  -- this GUC from production webhooks.
  IF current_setting('app.bypass_sub_trigger', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.is_premium IS DISTINCT FROM OLD.is_premium
     OR NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'Updating subscription status fields is not allowed';
  END IF;

  RETURN NEW;
END;
$function$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'prevent_subscription_status_updates_trigger'
      AND tgrelid = 'public.profiles'::regclass
  ) THEN
    CREATE TRIGGER prevent_subscription_status_updates_trigger
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_subscription_status_updates();
  END IF;
END $$;