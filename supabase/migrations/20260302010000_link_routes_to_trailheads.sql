-- Add trailhead_id FK to routes table.
-- The existing routes.trailhead text column is kept as a display-name fallback
-- until all consumers are updated to use the FK relationship.

alter table routes
  add column trailhead_id uuid references trailheads(id) on delete set null;

create index idx_routes_trailhead_id on routes(trailhead_id);
