CREATE OR REPLACE FUNCTION public.prevent_subscription_status_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow backend service operations
  IF COALESCE(auth.role(), current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
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