-- Cache table for pre-computed trending peaks (refreshed by trend-worker cron job)
create table trending_peaks_cache (
  id serial primary key,
  peak_id uuid not null references peaks(id) on delete cascade,
  rank int not null,
  report_count int not null default 0,
  prev_report_count int not null default 0,
  trend_pct int not null default 0,
  calculated_at timestamptz not null default now()
);

create index idx_trending_peaks_cache_rank on trending_peaks_cache(rank);

-- Public read access; only the service role (via edge function) can write
alter table trending_peaks_cache enable row level security;

create policy "Anyone can read trending peaks cache"
  on trending_peaks_cache for select using (true);
