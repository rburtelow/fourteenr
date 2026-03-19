-- Update cron jobs to point to cloud Supabase instance instead of local Docker network
select cron.unschedule('weather-worker');
select cron.unschedule('badge-worker');
select cron.unschedule('trend-worker');

select cron.schedule(
  'weather-worker',
  '0 */3 * * *',
  $$
  select net.http_post(
    url    := 'https://azrtzjiqqsglwcftwvgn.supabase.co/functions/v1/weather-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'badge-worker',
  '30 */2 * * *',
  $$
  select net.http_post(
    url    := 'https://azrtzjiqqsglwcftwvgn.supabase.co/functions/v1/badge-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'trend-worker',
  '0 0 * * *',
  $$
  select net.http_post(
    url    := 'https://azrtzjiqqsglwcftwvgn.supabase.co/functions/v1/trend-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);
