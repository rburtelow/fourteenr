-- Extend notifications for groups feature

-- 1. Drop existing type CHECK on notifications
do $$
declare
  _con text;
begin
  for _con in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'notifications'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%type%'
  loop
    execute format('alter table public.notifications drop constraint %I', _con);
  end loop;
end $$;

-- 2. Re-add with group types included
alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'comment', 'badge', 'follow_request', 'follow_accepted', 'group_join_approved', 'group_join_request'));

-- 3. Add group_id column (nullable FK)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'group_id'
  ) then
    alter table public.notifications add column group_id uuid references public.groups(id) on delete cascade;
  end if;
end $$;

-- 4. Security-definer RPC: approve a pending group member
--    Verifies caller is admin/mod, updates status, sends notification.
create or replace function public.approve_group_member(p_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_user_id uuid;
  v_caller_role text;
  v_group_name text;
begin
  -- Get pending member details
  select group_id, user_id into v_group_id, v_user_id
  from public.group_members
  where id = p_member_id and status = 'pending';

  if v_group_id is null then
    return jsonb_build_object('error', 'Request not found');
  end if;

  -- Verify caller is admin or moderator
  select role into v_caller_role
  from public.group_members
  where group_id = v_group_id and user_id = auth.uid() and status = 'active';

  if v_caller_role is null or v_caller_role not in ('admin', 'moderator') then
    return jsonb_build_object('error', 'Permission denied');
  end if;

  -- Get group name for notification message
  select name into v_group_name from public.groups where id = v_group_id;

  -- Approve the member
  update public.group_members
  set status = 'active'
  where id = p_member_id;

  -- Send notification (security definer bypasses RLS)
  insert into public.notifications (user_id, actor_id, type, group_id, message)
  values (
    v_user_id,
    auth.uid(),
    'group_join_approved',
    v_group_id,
    'Your request to join "' || v_group_name || '" was approved'
  );

  return jsonb_build_object('success', true);
end;
$$;

-- 5. Security-definer RPC: deny a pending group member
create or replace function public.deny_group_member(p_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_caller_role text;
begin
  select group_id into v_group_id
  from public.group_members
  where id = p_member_id and status = 'pending';

  if v_group_id is null then
    return jsonb_build_object('error', 'Request not found');
  end if;

  select role into v_caller_role
  from public.group_members
  where group_id = v_group_id and user_id = auth.uid() and status = 'active';

  if v_caller_role is null or v_caller_role not in ('admin', 'moderator') then
    return jsonb_build_object('error', 'Permission denied');
  end if;

  delete from public.group_members where id = p_member_id;

  return jsonb_build_object('success', true);
end;
$$;
