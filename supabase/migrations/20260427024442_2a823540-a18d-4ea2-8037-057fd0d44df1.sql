-- Analytics events: append-only telemetry sink for product events (starting with UpgradeWall).
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_name text NOT NULL,
  gate text,
  tier text,
  variant text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index optimized for the dashboard query: filter by event_name + recent window, group by gate/tier.
CREATE INDEX idx_analytics_events_event_created
  ON public.analytics_events (event_name, created_at DESC);

CREATE INDEX idx_analytics_events_gate_tier
  ON public.analytics_events (gate, tier);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone signed in can record their own events. user_id may be null for anonymous events,
-- but if provided it must match the caller.
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Allow anonymous inserts too (e.g. landing-page events before signup), but only with user_id null.
CREATE POLICY "Anon can insert anonymous analytics events"
  ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Users can read their own rows; admins can read everything.
CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Events are immutable. No UPDATE / DELETE policies are created, so RLS denies them by default.
