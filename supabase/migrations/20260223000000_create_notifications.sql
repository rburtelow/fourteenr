-- Create notifications table
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('like', 'comment', 'badge')),
  post_id uuid references public.community_posts(id) on delete cascade,
  comment_id uuid references public.post_comments(id) on delete cascade,
  badge_id uuid references public.badge_definitions(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for unread count & feed query
create index idx_notifications_user_unread on public.notifications (user_id, is_read, created_at desc);

-- RLS
alter table public.notifications enable row level security;

-- Users can only read their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can only update their own notifications (mark as read)
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No direct inserts from clients — triggers only
-- (no INSERT policy means RLS blocks client inserts)

-- Trigger function: on post like
create or replace function public.handle_new_post_like()
returns trigger
language plpgsql
security definer
as $$
declare
  post_owner_id uuid;
  actor_name text;
begin
  -- Get the post owner
  select user_id into post_owner_id
  from public.community_posts
  where id = NEW.post_id;

  -- Skip if actor is the post owner
  if NEW.user_id = post_owner_id then
    return NEW;
  end if;

  -- Get actor display name
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = NEW.user_id;

  insert into public.notifications (user_id, actor_id, type, post_id, message)
  values (
    post_owner_id,
    NEW.user_id,
    'like',
    NEW.post_id,
    actor_name || ' liked your post'
  );

  return NEW;
end;
$$;

create trigger on_post_like
  after insert on public.post_likes
  for each row
  execute function public.handle_new_post_like();

-- Trigger function: on post comment
create or replace function public.handle_new_post_comment()
returns trigger
language plpgsql
security definer
as $$
declare
  post_owner_id uuid;
  actor_name text;
begin
  -- Get the post owner
  select user_id into post_owner_id
  from public.community_posts
  where id = NEW.post_id;

  -- Skip if actor is the post owner
  if NEW.user_id = post_owner_id then
    return NEW;
  end if;

  -- Get actor display name
  select coalesce(screen_name, split_part(email, '@', 1))
  into actor_name
  from public.profiles
  where id = NEW.user_id;

  insert into public.notifications (user_id, actor_id, type, post_id, comment_id, message)
  values (
    post_owner_id,
    NEW.user_id,
    'comment',
    NEW.post_id,
    NEW.id,
    actor_name || ' commented on your post'
  );

  return NEW;
end;
$$;

create trigger on_post_comment
  after insert on public.post_comments
  for each row
  execute function public.handle_new_post_comment();

-- Trigger function: on badge earned
create or replace function public.handle_new_badge_earned()
returns trigger
language plpgsql
security definer
as $$
declare
  badge_name text;
begin
  -- Get badge name
  select name into badge_name
  from public.badge_definitions
  where id = NEW.badge_id;

  insert into public.notifications (user_id, type, badge_id, message)
  values (
    NEW.user_id,
    'badge',
    NEW.badge_id,
    'You earned the "' || badge_name || '" badge!'
  );

  return NEW;
end;
$$;

create trigger on_badge_earned
  after insert on public.user_badges
  for each row
  execute function public.handle_new_badge_earned();

-- Enable realtime
alter publication supabase_realtime add table notifications;
