-- Summit logs table: tracks when a user summits a peak
create table public.summit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  peak_id uuid not null references public.peaks(id) on delete cascade,
  route_id uuid references public.routes(id) on delete set null,
  summit_date date not null default current_date,
  rating integer check (rating between 1 and 5),
  weather text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  -- One summit per peak per user per date (allows re-summiting on different dates)
  unique (user_id, peak_id, summit_date)
);

-- Indexes for common queries
create index idx_summit_logs_user_id on public.summit_logs(user_id);
create index idx_summit_logs_peak_id on public.summit_logs(peak_id);
create index idx_summit_logs_summit_date on public.summit_logs(summit_date);

-- Enable Row Level Security
alter table public.summit_logs enable row level security;

-- Policy: Users can view their own summit logs
create policy "Users can view their own summit logs"
  on public.summit_logs for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own summit logs
create policy "Users can insert their own summit logs"
  on public.summit_logs for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own summit logs
create policy "Users can update their own summit logs"
  on public.summit_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own summit logs
create policy "Users can delete their own summit logs"
  on public.summit_logs for delete
  using (auth.uid() = user_id);

-- Updated_at trigger
create trigger summit_logs_updated_at
  before update on public.summit_logs
  for each row execute function update_updated_at();
