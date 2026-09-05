alter table public.daily_context
  add column if not exists recovery smallint check (recovery between 1 and 5),
  add column if not exists soreness smallint check (soreness between 1 and 5),
  add column if not exists pain smallint check (pain between 1 and 5),
  add column if not exists desire smallint check (desire between 1 and 5),
  add column if not exists readiness_score numeric,
  add column if not exists recommendation text check (recommendation in ('full','reduced','mobility','rest'));