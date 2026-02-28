-- Story 3.3: "My Groups" Sidebar
-- 1. Track when users last visited each group (for unread indicators)
-- 2. Bump groups.updated_at when a new post is added to the group

alter table public.group_members
  add column if not exists last_visited_at timestamptz;

-- Trigger: bump groups.updated_at when a group post is inserted
create or replace function public.update_group_on_new_post()
returns trigger language plpgsql security definer as $$
begin
  if NEW.group_id is not null then
    update public.groups
    set updated_at = now()
    where id = NEW.group_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists group_updated_on_new_post on public.community_posts;
create trigger group_updated_on_new_post
  after insert on public.community_posts
  for each row execute function public.update_group_on_new_post();
