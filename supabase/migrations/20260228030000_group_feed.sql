-- Phase 2: Group feed
-- Adds group_id to community_posts and creates group_pinned_posts table

-- 1. Add group_id FK to community_posts (nullable; NULL = public feed post)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'community_posts' and column_name = 'group_id'
  ) then
    alter table public.community_posts
      add column group_id uuid references public.groups(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_community_posts_group
  on public.community_posts(group_id)
  where group_id is not null;

-- 2. group_pinned_posts — up to 3 pinned posts per group (enforced in app logic)
create table if not exists public.group_pinned_posts (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  pinned_by uuid not null references public.profiles(id) on delete cascade,
  pinned_at timestamptz not null default now(),
  unique (group_id, post_id)
);

create index if not exists idx_group_pinned_posts_group
  on public.group_pinned_posts(group_id, pinned_at desc);

alter table public.group_pinned_posts enable row level security;

create policy "Anyone can view pinned posts"
  on public.group_pinned_posts for select
  using (true);

create policy "Admins and mods can pin posts"
  on public.group_pinned_posts for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_id = group_pinned_posts.group_id
        and user_id = auth.uid()
        and role in ('admin', 'moderator')
        and status = 'active'
    )
  );

create policy "Admins and mods can unpin posts"
  on public.group_pinned_posts for delete
  using (
    exists (
      select 1 from public.group_members
      where group_id = group_pinned_posts.group_id
        and user_id = auth.uid()
        and role in ('admin', 'moderator')
        and status = 'active'
    )
  );
