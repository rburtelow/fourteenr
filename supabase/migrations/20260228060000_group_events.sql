-- Phase 3: Group Events
-- Adds group_id to community_events so events can be scoped to a group

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'community_events' and column_name = 'group_id'
  ) then
    alter table public.community_events
      add column group_id uuid references public.groups(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_community_events_group
  on public.community_events(group_id)
  where group_id is not null;
