-- Fix-up migration: repair the notifications CHECK constraint for follow types.
-- The original follows migration may have failed to drop the auto-named inline
-- CHECK constraint, preventing follow_request/follow_accepted notification inserts.

-- 1. Drop ALL check constraints on notifications.type (finds the auto-named one)
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

-- 2. Re-add with the full set of allowed types
alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'comment', 'badge', 'follow_request', 'follow_accepted'));

-- 3. Ensure follow_id column exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'follow_id'
  ) then
    alter table public.notifications add column follow_id uuid references public.follows(id) on delete cascade;
  end if;
end $$;

-- 4. Ensure follows table has full replica identity for realtime
alter table public.follows replica identity full;

-- 5. Re-create triggers (idempotent with CREATE OR REPLACE)
create or replace function public.handle_new_follow_request()
returns trigger
language plpgsql
security definer
as $$
declare
  actor_name text;
begin
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = NEW.follower_id;

  insert into public.notifications (user_id, actor_id, type, follow_id, message)
  values (
    NEW.following_id,
    NEW.follower_id,
    'follow_request',
    NEW.id,
    actor_name || ' wants to follow you'
  );

  return NEW;
end;
$$;

-- Drop and recreate trigger to ensure it exists
drop trigger if exists on_follow_request on public.follows;
create trigger on_follow_request
  after insert on public.follows
  for each row
  execute function public.handle_new_follow_request();

create or replace function public.handle_follow_accepted()
returns trigger
language plpgsql
security definer
as $$
declare
  actor_name text;
begin
  if OLD.status <> 'accepted' and NEW.status = 'accepted' then
    select coalesce(screen_name, split_part(email, '@', 1))
    into actor_name
    from public.profiles
    where id = NEW.following_id;

    insert into public.notifications (user_id, actor_id, type, follow_id, message)
    values (
      NEW.follower_id,
      NEW.following_id,
      'follow_accepted',
      NEW.id,
      actor_name || ' accepted your follow request'
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists on_follow_accepted on public.follows;
create trigger on_follow_accepted
  after update on public.follows
  for each row
  execute function public.handle_follow_accepted();
