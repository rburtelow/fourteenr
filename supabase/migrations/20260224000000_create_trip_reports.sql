-- Enums
create type avalanche_risk_level as enum (
  'none', 'low', 'moderate', 'considerable', 'high', 'extreme'
);

create type trailhead_access as enum (
  'clear_2wd', 'rough_2wd', '4wd_required', 'snow_blocked'
);

-- Trip reports table
create table trip_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  peak_id uuid not null references peaks(id) on delete cascade,
  route_id uuid references routes(id) on delete set null,
  hike_date date not null,
  start_time time,
  end_time time,
  total_time_minutes int,
  difficulty_rating int not null check (difficulty_rating between 1 and 5),
  condition_severity_score int not null check (condition_severity_score between 1 and 5),
  objective_risk_score int not null check (objective_risk_score between 1 and 5),
  trailhead_access_rating trailhead_access,
  snow_present boolean not null default false,
  avalanche_risk_level avalanche_risk_level,
  overall_recommendation boolean not null default true,
  summary text not null,
  narrative text,
  sections_json jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_trip_reports_peak_id on trip_reports(peak_id);
create index idx_trip_reports_route_id on trip_reports(route_id);
create index idx_trip_reports_hike_date on trip_reports(hike_date);
create index idx_trip_reports_difficulty on trip_reports(difficulty_rating);
create index idx_trip_reports_sections on trip_reports using gin (sections_json);

-- RLS
alter table trip_reports enable row level security;

create policy "Anyone can read trip reports"
  on trip_reports for select using (true);

create policy "Users can insert own trip reports"
  on trip_reports for insert with check (auth.uid() = user_id);

create policy "Users can update own trip reports"
  on trip_reports for update using (auth.uid() = user_id);

create policy "Users can delete own trip reports"
  on trip_reports for delete using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function set_trip_reports_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trip_reports_updated_at
  before update on trip_reports
  for each row execute function set_trip_reports_updated_at();
