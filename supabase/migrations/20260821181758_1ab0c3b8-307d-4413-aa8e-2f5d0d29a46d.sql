CREATE TABLE public.app_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name text NOT NULL,
  event_type text NOT NULL,
  distinct_id text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.app_events TO authenticated;
GRANT ALL ON public.app_events TO service_role;

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert app events"
ON public.app_events FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read app events"
ON public.app_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_app_events_app_event ON public.app_events (app_name, event_type, created_at DESC);