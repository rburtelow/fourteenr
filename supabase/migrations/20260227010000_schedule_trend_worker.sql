-- Schedule trend worker daily at midnight
-- Computes trending peaks based on trip report activity this week vs last week
select cron.schedule(
  'trend-worker',          -- job name
  '0 0 * * *',             -- daily at midnight
  $$
  select net.http_post(
    url    := 'http://supabase_kong_my14er:8000/functions/v1/trend-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);
