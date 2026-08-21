CREATE TABLE IF NOT EXISTS public.email_sequence_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_day integer NOT NULL DEFAULT 0,
  email_type text NOT NULL,
  user_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_sequence_log_unique UNIQUE (user_id, sequence_day, email_type)
);

GRANT SELECT ON public.email_sequence_log TO authenticated;
GRANT ALL ON public.email_sequence_log TO service_role;

ALTER TABLE public.email_sequence_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email sequence log"
ON public.email_sequence_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));