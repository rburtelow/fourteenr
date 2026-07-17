create table admin_audit_log (
  id          bigserial primary key,
  actor_id    uuid not null references profiles(id),
  action      text not null,            -- e.g. 'user.ban', 'post.remove', 'role.grant'
  target_type text,                     -- 'user' | 'post' | 'comment' | 'group' | ...
  target_id   text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);
create index on admin_audit_log (created_at desc);
create index on admin_audit_log (target_type, target_id);

alter table admin_audit_log enable row level security;
create policy "admins read audit" on admin_audit_log
  for select using (is_admin(auth.uid()));
-- writes are service-role only (no insert policy)
