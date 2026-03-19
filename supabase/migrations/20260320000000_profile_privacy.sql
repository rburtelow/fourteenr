-- Profile privacy controls migration
-- Adds privacy columns, helper function, and updates RLS policies

-- ============================================================
-- 1a. Add privacy columns to profiles
-- ============================================================
alter table public.profiles
  add column if not exists is_private boolean not null default false,
  add column if not exists privacy_settings jsonb not null default '{}'::jsonb;

-- ============================================================
-- 1b. Helper function: is_accepted_follower
-- ============================================================
create or replace function public.is_accepted_follower(viewer_id uuid, profile_owner_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.follows
    where follower_id = viewer_id
      and following_id = profile_owner_id
      and status = 'accepted'
  );
$$;

-- ============================================================
-- 1c. Update summit_logs RLS to support public visibility
-- ============================================================
drop policy if exists "Users can view their own summit logs" on public.summit_logs;

create policy "Summit logs viewable based on privacy settings"
  on public.summit_logs for select
  using (
    -- Owner always sees own logs
    auth.uid() = user_id
    or (
      -- Others: check show_summit_history setting
      exists (
        select 1 from public.profiles p
        where p.id = summit_logs.user_id
          and (
            case coalesce(p.privacy_settings->>'show_summit_history', 'followers')
              when 'everyone'   then true
              when 'followers'  then public.is_accepted_follower(auth.uid(), p.id)
              when 'nobody'     then false
              else public.is_accepted_follower(auth.uid(), p.id)  -- unknown value defaults to followers
            end
          )
      )
    )
  );

-- ============================================================
-- 1d. Update follow request trigger: AFTER INSERT → BEFORE INSERT
--     Auto-accept for public profiles; keep pending for private
-- ============================================================
drop trigger if exists on_follow_request on public.follows;

create or replace function public.handle_new_follow_request()
returns trigger
language plpgsql
security definer
as $$
declare
  actor_name    text;
  target_private boolean;
begin
  -- Get actor display name
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = NEW.follower_id;

  -- Check if the target profile is private
  select is_private
  into target_private
  from public.profiles
  where id = NEW.following_id;

  if coalesce(target_private, false) = false then
    -- Public profile: auto-accept
    NEW.status := 'accepted';

    insert into public.notifications (user_id, actor_id, type, follow_id, message)
    values (
      NEW.following_id,
      NEW.follower_id,
      'follow_accepted',
      NEW.id,
      actor_name || ' started following you'
    );
  else
    -- Private profile: keep pending, send follow request notification
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

create trigger on_follow_request
  before insert on public.follows
  for each row
  execute function public.handle_new_follow_request();

-- ============================================================
-- 1e. Update user_badges RLS to respect show_badges setting
-- ============================================================
drop policy if exists "User badges are viewable by everyone" on public.user_badges;

create policy "User badges viewable based on privacy settings"
  on public.user_badges for select
  using (
    -- Owner always sees own badges
    auth.uid() = user_id
    or (
      exists (
        select 1 from public.profiles p
        where p.id = user_badges.user_id
          and (
            case coalesce(p.privacy_settings->>'show_badges', 'followers')
              when 'everyone'   then true
              when 'followers'  then public.is_accepted_follower(auth.uid(), p.id)
              when 'nobody'     then false
              else public.is_accepted_follower(auth.uid(), p.id)
            end
          )
      )
    )
  );
