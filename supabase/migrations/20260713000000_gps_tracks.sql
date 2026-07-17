-- GPS hike tracks recorded on mobile. The id is generated on-device so a
-- track has a stable identity while offline; sync upserts on it.
create table if not exists public.gps_tracks (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  peak_id uuid references public.peaks (id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null default 0,
  distance_meters double precision not null default 0,
  elevation_gain_meters double precision not null default 0,
  max_elevation_meters double precision,
  point_count integer not null default 0,
  -- Array of [longitude, latitude, elevation_m, epoch_seconds]
  points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists gps_tracks_user_id_idx on public.gps_tracks (user_id, started_at desc);
create index if not exists gps_tracks_peak_id_idx on public.gps_tracks (peak_id);

alter table public.gps_tracks enable row level security;

create policy "Users can view own tracks"
  on public.gps_tracks for select
  using (auth.uid () = user_id);

create policy "Users can insert own tracks"
  on public.gps_tracks for insert
  with check (auth.uid () = user_id);

create policy "Users can update own tracks"
  on public.gps_tracks for update
  using (auth.uid () = user_id);

create policy "Users can delete own tracks"
  on public.gps_tracks for delete
  using (auth.uid () = user_id);
