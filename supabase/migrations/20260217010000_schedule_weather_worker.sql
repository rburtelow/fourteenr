-- Enable required extensions
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Grant usage so cron can make HTTP calls
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Schedule weather worker every 3 hours
-- Uses pg_net to call the edge function via the internal Docker network
select cron.schedule(
  'weather-worker',        -- job name
  '0 */3 * * *',           -- every 3 hours
  $$
  select net.http_post(
    url    := 'http://supabase_kong_my14er:8000/functions/v1/weather-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);
