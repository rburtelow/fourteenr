-- Create follows table
create table public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint follows_unique unique (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

-- Indexes
create index idx_follows_follower on public.follows (follower_id, status);
create index idx_follows_following on public.follows (following_id, status);

-- RLS
alter table public.follows enable row level security;

-- Users can see follows where they are follower or following
create policy "Users can view own follows"
  on public.follows for select
  using (auth.uid() = follower_id or auth.uid() = following_id);

-- Authenticated users can insert where they are the follower
create policy "Users can send follow requests"
  on public.follows for insert
  with check (auth.uid() = follower_id);

-- Following user can update (accept/reject)
create policy "Users can respond to follow requests"
  on public.follows for update
  using (auth.uid() = following_id)
  with check (auth.uid() = following_id);

-- Follower can cancel request, or following can remove follower
create policy "Users can delete follows"
  on public.follows for delete
  using (auth.uid() = follower_id or auth.uid() = following_id);

-- Update notifications type CHECK to include follow types.
-- The original inline CHECK gets an auto-generated name; find and drop it dynamically.
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
      and con.contype = 'c'  -- check constraint
      and pg_get_constraintdef(con.oid) like '%type%'
  loop
    execute format('alter table public.notifications drop constraint %I', _con);
  end loop;
end $$;

alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'comment', 'badge', 'follow_request', 'follow_accepted'));

-- Add follow_id column to notifications (skip if already exists from a prior partial run)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'follow_id'
  ) then
    alter table public.notifications add column follow_id uuid references public.follows(id) on delete cascade;
  end if;
end $$;

-- Trigger: notify on new follow request
create or replace function public.handle_new_follow_request()
returns trigger
language plpgsql
security definer
as $$
declare
  actor_name text;
begin
  -- Get actor display name
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

create trigger on_follow_request
  after insert on public.follows
  for each row
  execute function public.handle_new_follow_request();

-- Trigger: notify on follow accepted
create or replace function public.handle_follow_accepted()
returns trigger
language plpgsql
security definer
as $$
declare
  actor_name text;
begin
  -- Only fire when status changes to 'accepted'
  if OLD.status <> 'accepted' and NEW.status = 'accepted' then
    -- Get the accepting user's display name
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

create trigger on_follow_accepted
  after update on public.follows
  for each row
  execute function public.handle_follow_accepted();

-- Enable realtime with full replica identity so UPDATE/DELETE payloads include old row
alter table public.follows replica identity full;
alter publication supabase_realtime add table follows;
