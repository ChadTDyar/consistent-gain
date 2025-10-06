-- Create admin-only table for Stripe customer data
CREATE TABLE public.stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS but with no user policies (admin-only access)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role full access" ON public.stripe_customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Migrate existing data from profiles to stripe_customers
INSERT INTO public.stripe_customers (user_id, stripe_customer_id, stripe_subscription_id, current_period_end)
SELECT id, stripe_customer_id, stripe_subscription_id, current_period_end
FROM public.profiles
WHERE stripe_customer_id IS NOT NULL;

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS trg_prevent_sensitive_profile_updates ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_sensitive_profile_updates();

-- Remove sensitive Stripe columns from profiles (keep is_premium and subscription_status for app functionality)
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS current_period_end;

-- Create new trigger function to protect only subscription status fields
CREATE OR REPLACE FUNCTION public.prevent_subscription_status_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow backend service operations
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block modifications to subscription fields by regular users
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    RAISE EXCEPTION 'Updating subscription status fields is not allowed';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger with updated function
CREATE TRIGGER prevent_subscription_status_updates_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_status_updates();