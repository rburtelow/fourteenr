alter table profiles add column if not exists last_seen timestamptz;
create index if not exists profiles_last_seen_idx on profiles (last_seen desc);

-- Chart aggregate helpers (called by admin overview actions)
create or replace function admin_signups_per_day(p_days int default 30)
returns table(date text, count bigint)
language sql stable security definer set search_path = public as $$
  select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
         count(*) as count
  from profiles
  where created_at >= now() - (p_days || ' days')::interval
  group by 1
  order by 1;
$$;

create or replace function admin_posts_per_day(p_days int default 30)
returns table(date text, count bigint)
language sql stable security definer set search_path = public as $$
  select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
         count(*) as count
  from community_posts
  where created_at >= now() - (p_days || ' days')::interval
  group by 1
  order by 1;
$$;

create or replace function admin_dau_per_day(p_days int default 30)
returns table(date text, count bigint)
language sql stable security definer set search_path = public as $$
  select to_char(date_trunc('day', last_seen), 'YYYY-MM-DD') as date,
         count(distinct id) as count
  from profiles
  where last_seen >= now() - (p_days || ' days')::interval
  group by 1
  order by 1;
$$;
