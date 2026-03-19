-- Create group_pinned_posts table for pinning posts in groups
create table if not exists public.group_pinned_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  pinned_by uuid not null references public.profiles(id) on delete cascade,
  pinned_at timestamptz not null default now(),
  unique(group_id, post_id)
);

-- RLS
alter table public.group_pinned_posts enable row level security;

-- Anyone can read pinned posts
create policy "group_pinned_posts_select"
  on public.group_pinned_posts for select
  using (true);

-- Only group admins/mods can insert
create policy "group_pinned_posts_insert"
  on public.group_pinned_posts for insert
  with check (
    exists (
      select 1 from public.group_members
      where group_id = group_pinned_posts.group_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'moderator')
    )
  );

-- Only group admins/mods can delete
create policy "group_pinned_posts_delete"
  on public.group_pinned_posts for delete
  using (
    exists (
      select 1 from public.group_members
      where group_id = group_pinned_posts.group_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('admin', 'moderator')
    )
  );
