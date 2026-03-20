-- Fix FK violation caused by inserting a notification with follow_id = NEW.id
-- inside a BEFORE INSERT trigger (the follows row doesn't exist yet at that point).
--
-- Solution: split into two triggers.
--   1. BEFORE INSERT — only mutates NEW.status for auto-accept (public profiles).
--      No notification here.
--   2. AFTER INSERT  — sends the correct notification now that the row is committed
--      and follow_id is a valid FK reference.

-- ── 1. BEFORE INSERT: auto-accept for public profiles ──────────────────────────
drop trigger if exists on_follow_request on public.follows;

create or replace function public.handle_follow_request_before()
returns trigger
language plpgsql
security definer
as $$
declare
  target_private boolean;
begin
  select is_private
  into target_private
  from public.profiles
  where id = NEW.following_id;

  if coalesce(target_private, false) = false then
    -- Public profile: auto-accept the follow immediately
    NEW.status := 'accepted';
  end if;

  return NEW;
end;
$$;

create trigger on_follow_request_before
  before insert on public.follows
  for each row
  execute function public.handle_follow_request_before();

-- ── 2. AFTER INSERT: send notification (follow row now exists, FK is valid) ────
drop trigger if exists on_follow_request_after on public.follows;

create or replace function public.handle_follow_request_after()
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

  if NEW.status = 'accepted' then
    -- Auto-accepted (public profile): informational notification, no action buttons.
    -- follow_id = null so no accept/decline buttons appear.
    insert into public.notifications (user_id, actor_id, type, follow_id, message)
    values (
      NEW.following_id,
      NEW.follower_id,
      'follow_accepted',
      null,
      actor_name || ' started following you'
    );
  else
    -- Pending (private profile): include follow_id so accept/decline buttons appear.
    insert into public.notifications (user_id, actor_id, type, follow_id, message)
    values (
      NEW.following_id,
      NEW.follower_id,
      'follow_request',
      NEW.id,
      actor_name || ' wants to follow you'
    );
  end if;

  return NEW;
end;
$$;

create trigger on_follow_request_after
  after insert on public.follows
  for each row
  execute function public.handle_follow_request_after();
