-- Schedule badge worker every 2 hours
-- Uses pg_net to call the edge function via the internal Docker network
select cron.schedule(
  'badge-worker',          -- job name
  '30 */2 * * *',          -- every 2 hours at :30 past the hour (offset from weather worker)
  $$
  select net.http_post(
    url    := 'http://supabase_kong_my14er:8000/functions/v1/badge-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);
