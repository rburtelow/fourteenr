create type admin_role as enum ('super_admin', 'moderator', 'support');

create table admin_roles (
  user_id    uuid primary key references profiles(id) on delete cascade,
  role       admin_role not null,
  granted_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies can call it without recursive RLS on admin_roles
create or replace function is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_roles where user_id = uid);
$$;

create or replace function has_admin_role(uid uuid, want admin_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_roles
    where user_id = uid
      and (role = want or role = 'super_admin')  -- super_admin implies all
  );
$$;

alter table admin_roles enable row level security;

create policy "super_admin reads roles" on admin_roles
  for select using (has_admin_role(auth.uid(), 'super_admin'));
create policy "super_admin writes roles" on admin_roles
  for all using (has_admin_role(auth.uid(), 'super_admin'))
  with check (has_admin_role(auth.uid(), 'super_admin'));

-- Seed the first super_admin (run once, replace UUID with your auth.uid()):
-- insert into admin_roles (user_id, role) values ('<your-auth-uid>', 'super_admin');
