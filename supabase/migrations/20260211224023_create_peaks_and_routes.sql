-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Peaks table
create table peaks (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  elevation integer not null, -- feet
  rank integer,
  range text,
  difficulty text,
  prominence integer, -- feet
  latitude numeric(9,6),
  longitude numeric(10,6),
  county text,
  forest text,
  nearby_towns text[], -- array of town names
  completions integer default 0,
  recent_trip_reports integer default 0,
  cell_reception text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Routes table (one peak can have many routes)
create table routes (
  id uuid primary key default uuid_generate_v4(),
  peak_id uuid not null references peaks(id) on delete cascade,
  name text not null,
  distance numeric(4,1), -- miles
  elevation_gain integer, -- feet
  difficulty text,
  estimated_time text, -- e.g., "6-8 hours"
  trailhead text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for common queries
create index idx_peaks_slug on peaks(slug);
create index idx_peaks_rank on peaks(rank);
create index idx_peaks_range on peaks(range);
create index idx_routes_peak_id on routes(peak_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to both tables
create trigger peaks_updated_at
  before update on peaks
  for each row execute function update_updated_at();

create trigger routes_updated_at
  before update on routes
  for each row execute function update_updated_at();

-- Enable RLS (Row Level Security)
alter table peaks enable row level security;
alter table routes enable row level security;

-- Public read access policies
create policy "Peaks are viewable by everyone"
  on peaks for select using (true);

create policy "Routes are viewable by everyone"
  on routes for select using (true);
