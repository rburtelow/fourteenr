-- Groups feature: social communities for hikers

-- Enums
create type public.group_category as enum (
  'general',
  'route',
  'range',
  'skill_level',
  'local_chapter',
  'trip_planning',
  'gear',
  'conditions'
);

create type public.group_privacy as enum ('public', 'private');
create type public.group_role as enum ('admin', 'moderator', 'member');
create type public.member_status as enum ('active', 'pending', 'banned');

-- Groups table
create table public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null check (char_length(name) between 1 and 100),
  slug text unique not null,
  description text check (description is null or char_length(description) <= 500),
  cover_image_url text,
  privacy public.group_privacy not null default 'public',
  peak_id uuid references public.peaks(id) on delete set null,
  category public.group_category not null default 'general',
  created_by uuid not null references public.profiles(id) on delete cascade,
  member_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_groups_slug on public.groups(slug);
create index idx_groups_created_by on public.groups(created_by);
create index idx_groups_category on public.groups(category);
create index idx_groups_peak on public.groups(peak_id) where peak_id is not null;
create index idx_groups_member_count on public.groups(member_count desc);
create index idx_groups_created on public.groups(created_at desc);
create index idx_groups_updated on public.groups(updated_at desc);

alter table public.groups enable row level security;

create policy "Anyone can view groups"
  on public.groups for select
  using (true);

create policy "Auth users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create trigger groups_updated_at
  before update on public.groups
  for each row execute function update_updated_at();

-- Group members table
create table public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.group_role not null default 'member',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index idx_group_members_group on public.group_members(group_id);
create index idx_group_members_user on public.group_members(user_id);
create index idx_group_members_active on public.group_members(group_id, user_id) where status = 'active';

alter table public.group_members enable row level security;

create policy "Anyone can view group members"
  on public.group_members for select
  using (true);

create policy "Users can insert their own membership"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own membership"
  on public.group_members for update
  using (auth.uid() = user_id);

create policy "Users can delete their own membership"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- Now that group_members exists, add admin policies on groups
create policy "Admins can update groups"
  on public.groups for update
  using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id
        and user_id = auth.uid()
        and role = 'admin'
        and status = 'active'
    )
  );

create policy "Admins can delete groups"
  on public.groups for delete
  using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id
        and user_id = auth.uid()
        and role = 'admin'
        and status = 'active'
    )
  );

-- Trigger to keep member_count denormalized
create or replace function public.update_group_member_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' and NEW.status = 'active' then
    update public.groups
    set member_count = member_count + 1, updated_at = now()
    where id = NEW.group_id;
  elsif TG_OP = 'DELETE' and OLD.status = 'active' then
    update public.groups
    set member_count = greatest(0, member_count - 1), updated_at = now()
    where id = OLD.group_id;
  elsif TG_OP = 'UPDATE' then
    if OLD.status != 'active' and NEW.status = 'active' then
      update public.groups
      set member_count = member_count + 1, updated_at = now()
      where id = NEW.group_id;
    elsif OLD.status = 'active' and NEW.status != 'active' then
      update public.groups
      set member_count = greatest(0, member_count - 1), updated_at = now()
      where id = OLD.group_id;
    end if;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

create trigger group_member_count_trigger
  after insert or update or delete on public.group_members
  for each row execute function public.update_group_member_count();
