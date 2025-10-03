-- Add explicit DENY UPDATE policy for activity_logs to prevent any updates
-- This ensures activity logs remain immutable after creation for data integrity

CREATE POLICY "Deny all updates to activity logs"
ON public.activity_logs
FOR UPDATE
USING (false);