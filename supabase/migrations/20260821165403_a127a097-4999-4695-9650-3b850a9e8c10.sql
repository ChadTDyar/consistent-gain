select cron.schedule(
  'daily-activation-rescue',
  '0 14 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url' limit 1) || '/functions/v1/activation-rescue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_service_role_key' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);