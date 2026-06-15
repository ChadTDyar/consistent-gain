REVOKE ALL ON FUNCTION public.grant_premium_unsafe(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_premium_unsafe(uuid, text) TO service_role;

REVOKE ALL ON FUNCTION public.admin_set_premium(uuid, text, boolean, text) FROM PUBLIC, anon;
-- admin_set_premium enforces has_role(auth.uid(),'admin') internally, so authenticated may call it
GRANT EXECUTE ON FUNCTION public.admin_set_premium(uuid, text, boolean, text) TO authenticated, service_role;