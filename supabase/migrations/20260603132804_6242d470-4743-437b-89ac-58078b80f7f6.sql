
-- 1) Testimonials: block self-approval at INSERT
DROP POLICY IF EXISTS "Users can insert own testimonials" ON public.testimonials;
CREATE POLICY "Users can insert own testimonials"
ON public.testimonials
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND is_approved = false);

-- 2) Lock down SECURITY DEFINER functions from broad execution
REVOKE EXECUTE ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_premium(uuid, text, boolean, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_subscription_status_updates() FROM PUBLIC, anon, authenticated;
-- has_role must remain executable by authenticated so RLS policies can call it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- 3) Avatars bucket: drop broad public SELECT (which allowed listing); replace with owner-scoped.
--    Public URL serving for the public bucket continues to work without RLS.
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Users can view own avatar"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
