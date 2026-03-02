-- Group Invites (Story 4.1): table, RLS, notification type extension, and RPCs

-- 1. Create group_invites table
create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (group_id, invitee_id)
);

alter table public.group_invites enable row level security;

create policy "Participants can view their invites"
  on public.group_invites for select to authenticated
  using (inviter_id = auth.uid() or invitee_id = auth.uid());

create policy "Active members can send invites"
  on public.group_invites for insert to authenticated
  with check (
    inviter_id = auth.uid()
    and exists (
      select 1 from public.group_members
      where group_id = group_invites.group_id
        and user_id = auth.uid()
        and status = 'active'
    )
  );

create policy "Invitees can update their status"
  on public.group_invites for update to authenticated
  using (invitee_id = auth.uid())
  with check (invitee_id = auth.uid());

-- 2. Extend notifications type check to include 'group_invite'
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

alter table public.notifications add constraint notifications_type_check
  check (type in (
    'like', 'comment', 'badge',
    'follow_request', 'follow_accepted',
    'group_join_approved', 'group_join_request',
    'group_invite'
  ));

-- 3. Security-definer RPC: send a group invite
create or replace function public.send_group_invite(
  p_group_id uuid,
  p_invitee_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role text;
  v_group_name text;
  v_is_member boolean;
  v_existing_id uuid;
  v_existing_status text;
begin
  -- Verify caller is an active group member
  select role into v_caller_role
  from public.group_members
  where group_id = p_group_id and user_id = auth.uid() and status = 'active';

  if v_caller_role is null then
    return jsonb_build_object('error', 'You must be a group member to invite others');
  end if;

  -- Prevent self-invite
  if p_invitee_id = auth.uid() then
    return jsonb_build_object('error', 'Cannot invite yourself');
  end if;

  -- Check invitee is not already an active member
  select exists(
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_invitee_id and status = 'active'
  ) into v_is_member;

  if v_is_member then
    return jsonb_build_object('error', 'User is already a member');
  end if;

  -- Check for existing invite
  select id, status into v_existing_id, v_existing_status
  from public.group_invites
  where group_id = p_group_id and invitee_id = p_invitee_id;

  if v_existing_id is not null then
    if v_existing_status = 'pending' then
      return jsonb_build_object('error', 'User has already been invited');
    elsif v_existing_status = 'accepted' then
      return jsonb_build_object('error', 'User is already a member');
    else
      -- dismissed — re-invite
      update public.group_invites
      set inviter_id = auth.uid(), status = 'pending', created_at = now()
      where id = v_existing_id;
    end if;
  else
    -- New invite
    insert into public.group_invites (group_id, inviter_id, invitee_id)
    values (p_group_id, auth.uid(), p_invitee_id);
  end if;

  -- Get group name for notification message
  select name into v_group_name from public.groups where id = p_group_id;

  -- Send notification to invitee
  insert into public.notifications (user_id, actor_id, type, group_id, message)
  values (
    p_invitee_id,
    auth.uid(),
    'group_invite',
    p_group_id,
    'invited you to join "' || v_group_name || '"'
  );

  return jsonb_build_object('success', true);
end;
$$;

-- 4. Security-definer RPC: accept a group invite (bypasses privacy for private groups)
create or replace function public.accept_group_invite(p_group_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite_id uuid;
begin
  -- Find pending invite for this user
  select id into v_invite_id
  from public.group_invites
  where group_id = p_group_id and invitee_id = auth.uid() and status = 'pending';

  if v_invite_id is null then
    return jsonb_build_object('error', 'No pending invite found');
  end if;

  -- Add user to group as active member (bypasses pending state for private groups)
  insert into public.group_members (group_id, user_id, role, status)
  values (p_group_id, auth.uid(), 'member', 'active')
  on conflict (group_id, user_id) do update
    set status = 'active';

  -- Mark invite as accepted
  update public.group_invites
  set status = 'accepted'
  where id = v_invite_id;

  return jsonb_build_object('success', true);
end;
$$;
