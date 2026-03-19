-- Event updated notifications: notify all attendees when an event organizer changes event details

-- 1. Add event_id column to notifications
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notifications'
      and column_name = 'event_id'
  ) then
    alter table public.notifications
      add column event_id uuid references public.community_events(id) on delete cascade;
  end if;
end $$;

-- 2. Drop existing type CHECK constraint and re-add with event_updated included
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
    'event_updated'
  ));

-- 3. Trigger function: notify attendees when event details change
create or replace function public.handle_event_updated()
returns trigger
language plpgsql
security definer
as $$
declare
  organizer_name text;
  attendee record;
begin
  -- Only fire if meaningful fields changed (not just updated_at or status)
  if (
    NEW.title        is distinct from OLD.title or
    NEW.description  is distinct from OLD.description or
    NEW.event_date   is distinct from OLD.event_date or
    NEW.end_date     is distinct from OLD.end_date or
    NEW.location     is distinct from OLD.location or
    NEW.peak_id      is distinct from OLD.peak_id or
    NEW.max_attendees is distinct from OLD.max_attendees
  ) then
    -- Get organizer display name
    select coalesce(screen_name, split_part(email, '@', 1))
    into organizer_name
    from public.profiles
    where id = NEW.created_by;

    -- Notify each attendee except the organizer themselves
    for attendee in
      select user_id
      from public.event_attendees
      where event_id = NEW.id
        and user_id <> NEW.created_by
    loop
      insert into public.notifications (user_id, actor_id, type, event_id, message)
      values (
        attendee.user_id,
        NEW.created_by,
        'event_updated',
        NEW.id,
        organizer_name || ' updated the event "' || NEW.title || '"'
      );
    end loop;
  end if;

  return NEW;
end;
$$;

create trigger on_event_updated
  after update on public.community_events
  for each row
  execute function public.handle_event_updated();
