-- Peak watchlist table: lets users save/unsave peaks to their watchlist
create table public.peak_watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  peak_id uuid not null references public.peaks(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, peak_id)
);

-- Indexes for common queries
create index idx_peak_watchlist_user_id on public.peak_watchlist(user_id);
create index idx_peak_watchlist_peak_id on public.peak_watchlist(peak_id);

-- Enable Row Level Security
alter table public.peak_watchlist enable row level security;

-- Policy: Users can view their own watchlist
create policy "Users can view their own watchlist"
  on public.peak_watchlist for select
  using (auth.uid() = user_id);

-- Policy: Users can insert into their own watchlist
create policy "Users can insert into their own watchlist"
  on public.peak_watchlist for insert
  with check (auth.uid() = user_id);

-- Policy: Users can delete from their own watchlist
create policy "Users can delete from their own watchlist"
  on public.peak_watchlist for delete
  using (auth.uid() = user_id);

-- Updated_at trigger (reuses existing function from profiles migration)
create trigger peak_watchlist_updated_at
  before update on public.peak_watchlist
  for each row execute function update_updated_at();
