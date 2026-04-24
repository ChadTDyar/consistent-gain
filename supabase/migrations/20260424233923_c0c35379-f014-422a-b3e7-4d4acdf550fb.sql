ALTER TABLE public.profiles DISABLE TRIGGER USER;
UPDATE public.profiles
   SET plan = 'premium',
       is_premium = true,
       subscription_status = 'active'
 WHERE id = '3eca7f93-4dce-41f9-a035-e0d9ca3d116d';
ALTER TABLE public.profiles ENABLE TRIGGER USER;