-- Group member management RPCs (security definer — bypass RLS for admin operations)

-- Update a member's role (admin can set any role; mod can only promote to mod)
create or replace function public.update_member_role(p_member_id uuid, p_new_role text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_target_user_id uuid;
  v_target_role text;
  v_caller_role text;
begin
  if p_new_role not in ('admin', 'moderator', 'member') then
    return jsonb_build_object('error', 'Invalid role');
  end if;

  select group_id, user_id, role into v_group_id, v_target_user_id, v_target_role
  from public.group_members
  where id = p_member_id and status = 'active';

  if v_group_id is null then
    return jsonb_build_object('error', 'Member not found');
  end if;

  -- Cannot change own role via this function
  if v_target_user_id = auth.uid() then
    return jsonb_build_object('error', 'Use transfer admin to change your own role');
  end if;

  select role into v_caller_role
  from public.group_members
  where group_id = v_group_id and user_id = auth.uid() and status = 'active';

  if v_caller_role is null then
    return jsonb_build_object('error', 'Permission denied');
  end if;

  -- Moderators can only promote members to mod, not touch admins
  if v_caller_role = 'moderator' then
    if v_target_role = 'admin' or p_new_role = 'admin' then
      return jsonb_build_object('error', 'Moderators cannot manage admins');
    end if;
  end if;

  -- Admins only can assign admin role
  if p_new_role = 'admin' and v_caller_role <> 'admin' then
    return jsonb_build_object('error', 'Only admins can promote to admin');
  end if;

  -- Admins only can demote admins
  if v_target_role = 'admin' and v_caller_role <> 'admin' then
    return jsonb_build_object('error', 'Only admins can demote other admins');
  end if;

  update public.group_members
  set role = p_new_role
  where id = p_member_id;

  return jsonb_build_object('success', true);
end;
$$;

-- Remove a member from the group
create or replace function public.remove_group_member(p_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_target_user_id uuid;
  v_target_role text;
  v_caller_role text;
begin
  select group_id, user_id, role into v_group_id, v_target_user_id, v_target_role
  from public.group_members
  where id = p_member_id and status = 'active';

  if v_group_id is null then
    return jsonb_build_object('error', 'Member not found');
  end if;

  if v_target_user_id = auth.uid() then
    return jsonb_build_object('error', 'Use leave group to remove yourself');
  end if;

  select role into v_caller_role
  from public.group_members
  where group_id = v_group_id and user_id = auth.uid() and status = 'active';

  if v_caller_role is null then
    return jsonb_build_object('error', 'Permission denied');
  end if;

  -- Cannot remove an admin unless you are an admin
  if v_target_role = 'admin' then
    return jsonb_build_object('error', 'Admins cannot be removed. Transfer the admin role first.');
  end if;

  -- Moderators can only remove regular members
  if v_caller_role = 'moderator' and v_target_role <> 'member' then
    return jsonb_build_object('error', 'Moderators can only remove regular members');
  end if;

  delete from public.group_members where id = p_member_id;

  return jsonb_build_object('success', true);
end;
$$;

-- Transfer admin role to another active member
create or replace function public.transfer_group_admin(p_group_id uuid, p_target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role text;
  v_target_member_id uuid;
begin
  -- Caller must be an active admin
  select role into v_caller_role
  from public.group_members
  where group_id = p_group_id and user_id = auth.uid() and status = 'active';

  if v_caller_role <> 'admin' then
    return jsonb_build_object('error', 'Only admins can transfer the admin role');
  end if;

  if p_target_user_id = auth.uid() then
    return jsonb_build_object('error', 'Cannot transfer admin to yourself');
  end if;

  -- Target must be an active member
  select id into v_target_member_id
  from public.group_members
  where group_id = p_group_id and user_id = p_target_user_id and status = 'active';

  if v_target_member_id is null then
    return jsonb_build_object('error', 'Target user is not an active member');
  end if;

  -- Promote target to admin
  update public.group_members
  set role = 'admin'
  where id = v_target_member_id;

  -- Demote caller to member
  update public.group_members
  set role = 'member'
  where group_id = p_group_id and user_id = auth.uid();

  return jsonb_build_object('success', true);
end;
$$;
