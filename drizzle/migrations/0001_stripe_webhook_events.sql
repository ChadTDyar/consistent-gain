-- Once-only processing for the stripe-webhook edge function, keyed on Stripe's event.id.
-- Holds no personal data. Only the service role (the webhook) reads or writes it.
create table if not exists public.stripe_webhook_events (
  event_id     text primary key,
  event_type   text not null,
  livemode     boolean not null,
  status       text not null default 'processing'
               check (status in ('processing', 'processed', 'failed')),
  outcome      text,
  received_at  timestamptz not null default now(),
  processed_at timestamptz
);

GRANT ALL ON public.stripe_webhook_events TO service_role;

alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from anon, authenticated;

create index if not exists stripe_webhook_events_received_at_idx
  on public.stripe_webhook_events (received_at desc);
