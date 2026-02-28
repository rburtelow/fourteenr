-- Story 2.4: Pin & Remove posts
-- Security-definer RPC: remove_group_post
-- Allows group admins/mods to delete any post in their group,
-- bypassing the community_posts RLS policy that only allows post owners to delete.

create or replace function public.remove_group_post(p_post_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_caller_role text;
begin
  -- Get the post's group_id
  select group_id into v_group_id
  from public.community_posts
  where id = p_post_id;

  if v_group_id is null then
    return jsonb_build_object('error', 'Post not found or not a group post');
  end if;

  -- Verify caller is admin or moderator in this group
  select role into v_caller_role
  from public.group_members
  where group_id = v_group_id
    and user_id = auth.uid()
    and status = 'active';

  if v_caller_role is null or v_caller_role not in ('admin', 'moderator') then
    return jsonb_build_object('error', 'Permission denied');
  end if;

  delete from public.community_posts where id = p_post_id;

  return jsonb_build_object('success', true);
end;
$$;
