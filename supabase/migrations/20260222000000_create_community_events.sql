-- Community events table
create table public.community_events (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text check (description is null or char_length(description) <= 2000),
  event_date timestamptz not null,
  end_date timestamptz,
  location text not null,
  peak_id uuid references public.peaks(id) on delete set null,
  max_attendees int check (max_attendees is null or max_attendees > 0),
  status text not null default 'active' check (status in ('active', 'cancelled', 'completed')),
  community_post_id uuid references public.community_posts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_community_events_date on public.community_events(event_date) where status = 'active';
create index idx_community_events_created_by on public.community_events(created_by);
create index idx_community_events_peak on public.community_events(peak_id) where peak_id is not null;

-- RLS
alter table public.community_events enable row level security;

create policy "Anyone can view events"
  on public.community_events for select
  using (true);

create policy "Authenticated users can create events"
  on public.community_events for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own events"
  on public.community_events for update
  using (auth.uid() = created_by);

create policy "Users can delete their own events"
  on public.community_events for delete
  using (auth.uid() = created_by);

-- Updated_at trigger
create trigger community_events_updated_at
  before update on public.community_events
  for each row execute function update_updated_at();

-- Event attendees table
create table public.event_attendees (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index idx_event_attendees_event on public.event_attendees(event_id);
create index idx_event_attendees_user on public.event_attendees(user_id);

-- RLS
alter table public.event_attendees enable row level security;

create policy "Anyone can view attendees"
  on public.event_attendees for select
  using (true);

create policy "Users can RSVP themselves"
  on public.event_attendees for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own RSVP"
  on public.event_attendees for delete
  using (auth.uid() = user_id);

-- Realtime for event_attendees (optimistic RSVP updates)
alter table public.event_attendees replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_events'
  ) then
    alter publication supabase_realtime add table public.community_events;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'event_attendees'
  ) then
    alter publication supabase_realtime add table public.event_attendees;
  end if;
end
$$;
