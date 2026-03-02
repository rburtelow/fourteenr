-- Create trailheads table
-- Trailheads are first-class entities representing the starting points for 14er routes.

create table trailheads (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  latitude numeric(9,6),
  longitude numeric(10,6),
  elevation_ft integer,               -- trailhead elevation in feet
  road_type text,                     -- paved | gravel | rough_2wd | 4wd_required | 4wd_high_clearance
  parking_type text,                  -- lot | pulloff | dispersed
  parking_capacity text,              -- small | medium | large
  restrooms boolean default false,
  fee_required boolean default false,
  winter_accessible boolean default true,
  nearest_town text,
  driving_notes text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_trailheads_slug on trailheads(slug);

-- Updated_at trigger
create trigger trailheads_updated_at
  before update on trailheads
  for each row execute function update_updated_at();

-- RLS: public read, service-role write
alter table trailheads enable row level security;

create policy "Trailheads are viewable by everyone"
  on trailheads for select using (true);
