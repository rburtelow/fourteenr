-- @-mention notifications: notify users tagged in posts, comments, trip reports, and events.
-- Mentions are stored inline in text columns as tokens: @[Label](user:screen_name).

-- 1. Add report_id so trip-report mentions are navigable
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notifications'
      and column_name = 'report_id'
  ) then
    alter table public.notifications
      add column report_id uuid references public.trip_reports(id) on delete cascade;
  end if;
end $$;

-- 2. Drop existing type CHECK constraint(s) and re-add with 'mention' included
do $$
declare
  _con text;
begin
  for _con in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'notifications'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%type%'
  loop
    execute format('alter table public.notifications drop constraint %I', _con);
  end loop;
end $$;

alter table public.notifications add constraint notifications_type_check
  check (type in (
    'like', 'comment', 'badge',
    'follow_request', 'follow_accepted',
    'group_join_approved', 'group_join_request', 'group_invite',
    'event_updated', 'mention'
  ));

-- 3. Shared helper: insert a 'mention' notification for each distinct mentioned
--    screen_name found in the given texts, excluding the actor themselves.
create or replace function public.notify_mentions(
  p_actor uuid,
  p_texts text[],
  p_post_id uuid,
  p_comment_id uuid,
  p_event_id uuid,
  p_report_id uuid,
  p_context text -- e.g. 'a post', 'a comment', 'a trip report', 'an event'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  mentioned record;
begin
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = p_actor;

  for mentioned in
    select distinct p.id as user_id
    from unnest(p_texts) as t(txt)
    cross join lateral regexp_matches(coalesce(t.txt, ''), '@\[[^\]]+\]\(user:([^)]+)\)', 'g') as m(captures)
    join public.profiles p on p.screen_name = m.captures[1]
    where p.id <> p_actor
  loop
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id, event_id, report_id, message)
    values (
      mentioned.user_id,
      p_actor,
      'mention',
      p_post_id,
      p_comment_id,
      p_event_id,
      p_report_id,
      actor_name || ' mentioned you in ' || p_context
    );
  end loop;
end;
$$;

-- 4. Per-table trigger functions

create or replace function public.handle_post_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_mentions(NEW.user_id, array[NEW.content], NEW.id, null, null, null, 'a post');
  return NEW;
end;
$$;

create or replace function public.handle_comment_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_mentions(NEW.user_id, array[NEW.content], NEW.post_id, NEW.id, null, null, 'a comment');
  return NEW;
end;
$$;

create or replace function public.handle_trip_report_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_mentions(NEW.user_id, array[NEW.summary, NEW.narrative], null, null, null, NEW.id, 'a trip report');
  return NEW;
end;
$$;

create or replace function public.handle_event_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_mentions(NEW.created_by, array[NEW.description], null, null, NEW.id, null, 'an event');
  return NEW;
end;
$$;

-- 5. Triggers (insert only)
drop trigger if exists on_post_mentions on public.community_posts;
create trigger on_post_mentions
  after insert on public.community_posts
  for each row execute function public.handle_post_mentions();

drop trigger if exists on_comment_mentions on public.post_comments;
create trigger on_comment_mentions
  after insert on public.post_comments
  for each row execute function public.handle_comment_mentions();

drop trigger if exists on_trip_report_mentions on public.trip_reports;
create trigger on_trip_report_mentions
  after insert on public.trip_reports
  for each row execute function public.handle_trip_report_mentions();

drop trigger if exists on_event_mentions on public.community_events;
create trigger on_event_mentions
  after insert on public.community_events
  for each row execute function public.handle_event_mentions();
