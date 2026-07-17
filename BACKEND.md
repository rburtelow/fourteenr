# BACKEND.md — My14er Admin Backend

This document specifies the **admin backend dashboard** for My14er (the `hiking-dashboard` / fourteenr platform). It is broken into **epics → stories** so it can be implemented incrementally. Each story is detailed enough to hand straight to implementation.

> **Status:** Specification. No admin code exists yet. Build in order — **Epic 0 unblocks everything else**, after which later stories are independently shippable.

---

## 1. Overview

My14er is a social hiking platform for Colorado 14ers with a real social graph (posts, comments, events, groups, trip reports, follows, badges). Today there is **no operator tooling**: no way to see how many users exist or are online, no content moderation, and no abuse handling. The "online now" figure on the landing page is hardcoded marketing copy; there is no reporting, flagging, or ban system in the schema.

The admin backend is a modern, clean SaaS-style dashboard that lets operators:

- See platform health at a glance — users (total / online), posts, events, groups, trip reports, growth.
- Moderate users and content — ban/suspend, review reports, remove content, audit everything.
- Manage domain data — events, groups, peaks/trailheads.
- Operate the platform — announcements, feature flags, exports, search.

### Design principles

1. **Match the main app.** The dashboard lives under `app/admin/` so it inherits the existing design system from `app/globals.css` — forest-green brand (`--color-brand-primary` `#064E3B`), warm off-white page (`--color-page` `#F6F8F6`), white rounded cards, soft shadows, DM Sans body / Playfair Display headlines. No separate theme.
2. **Reuse before building.** Reuse `app/components/Modal.tsx`, `app/components/Select.tsx`, the card pattern `bg-white rounded-xl shadow-sm border border-[var(--color-border-app)]`, the primary button `bg-[var(--color-brand-primary)] text-white rounded-full hover:bg-[var(--color-brand-accent)]`, and the stat/progress markup from `app/profile/page.tsx` (~line 430). Follow the existing **server-actions-per-feature** pattern (`app/<feature>/actions.ts`).
3. **RLS-first, audited escalation.** The public app runs entirely on Supabase RLS with the anon key (owner-scoped writes). Admin mutations bypass RLS via a **service-role client**, used **only** after a verified admin-role check, and **every** privileged write is recorded in an audit log.
4. **Soft over hard.** Prefer status flags and soft-deletes (`deleted_at`, `status`) over destructive deletes so actions are reversible and the public surface stays protected by RLS.

### Net-new dependencies / infrastructure

| Addition | Why |
|---|---|
| **Recharts** (`pnpm add recharts`) | No chart library is installed; needed for growth/activity graphs. `react-icons` ^5.6.0 is already available for icons. |
| **`lib/supabase/admin.ts`** | No service-role client exists in app code today (`lib/supabase/server.ts` uses anon key only). Required for RLS-bypassing admin actions. |
| **Shared `Table` primitive** (`app/admin/components/Table.tsx`) | No table component or library exists; admin views are table-heavy. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Already present in `.env.local` (used only by edge functions today). Will be consumed by `lib/supabase/admin.ts`. Server-only — never import into a client component. |

### Conventions referenced throughout

- **Migrations:** `supabase/migrations/YYYYMMDDHHMMSS_<name>.sql`, applied with **`pnpm migrate`** (`supabase db push`). Do **not** use the Supabase MCP server — it points at the local/empty stack. Latest existing migration is `20260630000000_mention_notifications.sql`; new files must use later timestamps.
- **Auth helpers:** `getServerUser()` (validates JWT, ~90ms) and `getSessionUser()` (reads validated cookie, no network) in `lib/supabase/server.ts`.
- **Route protection:** `lib/supabase/middleware.ts` — `protectedPaths` at line 39.
- **Notification `type` CHECK** currently allows: `like, comment, badge, follow_request, follow_accepted, group_join_approved, group_join_request, group_invite, event_updated, mention`. Extending it requires a migration that drops & re-adds the constraint.

### Story template

Each story below uses: **Goal · Acceptance criteria · Schema/migration · Files · Reuse · Notes.**

---

## 2. Epic index

| Epic | Theme | Unlocks |
|---|---|---|
| **0** | Admin Foundation & Authorization | Everything |
| **1** | Overview Dashboard & Live Presence | Operator visibility |
| **2** | User Management & Moderation | Abuse handling |
| **3** | Content Moderation & Reporting | Community safety |
| **4** | Events, Groups & Domain Management | Content curation |
| **5** | Analytics & Growth | Product insight |
| **6** | Platform Operations (killer features) | Scale & control |

---

## Epic 0 — Admin Foundation & Authorization

Establishes who is an admin, how privileged code runs, where the dashboard lives, and how actions are audited. **Required before any other epic.**

### Story 0.1 — Admin roles table + authorization helpers

**Goal:** Introduce a granular, site-wide admin role system (none exists today — only per-group `group_members.role`).

**Acceptance criteria**
- An `admin_roles` table maps a user to one of `super_admin | moderator | support`.
- SQL helpers `is_admin(uuid)` and `has_admin_role(uuid, admin_role)` exist and are usable from RLS policies.
- RLS: only `super_admin` can read/write `admin_roles`; the table is otherwise invisible.
- Seeding a first super_admin is documented (manual SQL insert, since no admin exists to grant it).

**Schema/migration** — `supabase/migrations/20260701000000_admin_roles.sql`
```sql
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

-- Seed (run once, replace UUID):
-- insert into admin_roles (user_id, role) values ('<your-auth-uid>', 'super_admin');
```

**Files:** migration above. **Reuse:** profiles FK pattern, `security definer` style already used by `is_accepted_follower` in `20260320000000_profile_privacy.sql`.

**Notes:** `super_admin` implies all roles in `has_admin_role` so policies need only name the minimum role required.

---

### Story 0.2 — Service-role Supabase client + guards

**Goal:** A server-only client that bypasses RLS for admin work, and reusable guards that enforce role before it's ever used.

**Acceptance criteria**
- `createAdminClient()` builds a service-role client (`SUPABASE_SERVICE_ROLE_KEY`), no cookie/session, never bundled to the browser.
- `requireAdmin()` returns the current admin user or throws/redirects; `requireRole(role)` enforces a specific minimum role.
- Guards reuse `getServerUser()` and query `admin_roles`.

**Files** — `lib/supabase/admin.ts`
```ts
import "server-only";
import { createClient as createSb } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getServerUser } from "./server";
import type { Database } from "../database.types";

export function createAdminClient() {
  return createSb<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

type AdminRole = "super_admin" | "moderator" | "support";

export async function requireRole(min: AdminRole = "support") {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?redirectTo=/admin");
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_roles").select("role").eq("user_id", user.id).single();
  const role = data?.role as AdminRole | undefined;
  const ok = role === "super_admin" || role === min ||
    (min === "support" && !!role) || (min === "moderator" && role === "moderator");
  if (!ok) redirect("/");
  return { user, role: role! };
}

export const requireAdmin = () => requireRole("support");
```

**Reuse:** `getServerUser()` from `lib/supabase/server.ts`. **Notes:** the `import "server-only"` guard is critical — leaking the service key to the client is a full DB compromise. Every admin server action calls `requireRole(...)` as its first line.

---

### Story 0.3 — Route guard + nav entry

**Goal:** Gate `/admin` at the edge and expose an Admin link only to admins.

**Acceptance criteria**
- Visiting `/admin/*` while not authenticated → redirect to login; while authenticated-but-not-admin → redirect to `/`.
- The layout (Story 0.4) still calls `requireRole()` as defense-in-depth (middleware avoids the per-request `admin_roles` read where possible via a short-lived cookie, mirroring the `_pp_ok` pattern).
- An "Admin" link appears in `app/components/Navbar.tsx` only when the current user has a role.

**Files/modify**
- `lib/supabase/middleware.ts` — add `/admin` to the gate near line 39; for `/admin` paths, after `getUser()`, check an `_adm` cookie or query `admin_roles`, redirect non-admins, and cache the positive result in a short-lived `httpOnly` cookie (reuse the `_pp_ok` caching pattern at lines 56–76).
- `app/components/Navbar.tsx` — pass an `isAdmin` prop (resolved server-side) and conditionally render the link in `LOGGED_IN_LINKS`.

**Reuse:** existing `protectedPaths` logic and `_pp_ok` cookie caching in `lib/supabase/middleware.ts`.

**Notes:** middleware is a UX gate, not the security boundary — the security boundary is `requireRole()` + RLS in each action.

---

### Story 0.4 — Admin shell + shared primitives

**Goal:** The dashboard chrome (sidebar, topbar, breadcrumbs) and the reusable building blocks every page uses.

**Acceptance criteria**
- `app/admin/layout.tsx` renders a persistent left sidebar (Overview, Users, Moderation, Content, Events, Groups, Analytics, Operations), a topbar (global search slot, current admin + role badge), and a content area. Calls `requireRole()` at the top.
- Shared primitives exist and visually match the app: `Table` (sortable headers, pagination, empty/loading states, row actions), `StatCard` (label + value + delta), `PageHeader` (title + actions), `Pill`/`Badge` (status colors), `FilterBar` (search + selects), `Drawer` (side panel; can wrap `Modal`).
- Sidebar items are role-aware (support sees read-only sections; moderator sees moderation; super_admin sees Operations/roles).

**Files**
- `app/admin/layout.tsx`, `app/admin/page.tsx` (redirects to `/admin/overview`)
- `app/admin/components/{Table,StatCard,PageHeader,Pill,FilterBar,Drawer}.tsx`

**Reuse:** `app/components/Modal.tsx` (Drawer/dialogs), `app/components/Select.tsx` (FilterBar), card/button class patterns, profile stat markup at `app/profile/page.tsx:430` for `StatCard`. **Notes:** keep primitives generic — Epics 1–6 are mostly composition over these.

---

### Story 0.5 — Audit log

**Goal:** A tamper-evident record of every privileged admin action. Cross-cutting — referenced by Stories 2.3, 2.4, 2.5, 3.x, 4.x, 6.x.

**Acceptance criteria**
- `admin_audit_log` records actor, action, target type/id, optional before/after JSON, and timestamp.
- `logAdminAction()` helper writes an entry via the service-role client; every admin mutation calls it.
- An audit view (`app/admin/operations/audit/page.tsx`) lists entries with filters (actor, action, date).

**Schema/migration** — `supabase/migrations/20260701010000_admin_audit_log.sql`
```sql
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
```

**Files:** migration above; `lib/admin/audit.ts` (`logAdminAction({...})`); `app/admin/operations/audit/page.tsx`. **Notes:** no INSERT policy — writes go only through the service-role client, mirroring how `notifications` is trigger/worker-only today.

---

## Epic 1 — Overview Dashboard & Live Presence

The landing screen: platform vitals at a glance, live presence, trends, and worker health.

### Story 1.1 — KPI cards

**Goal:** Headline counts with deltas.

**Acceptance criteria**
- Cards for: total users, new signups (24h / 7d / 30d), total posts, events, groups, trip reports — each with a period-over-period delta arrow.
- Counts come from server-side aggregate queries (service-role, read-only) in `app/admin/overview/actions.ts`.

**Files:** `app/admin/overview/page.tsx`, `app/admin/overview/actions.ts`. **Reuse:** `StatCard` (0.4). **Notes:** use `count: "exact", head: true` Supabase queries for cheap totals; compute deltas with `created_at >= now() - interval`.

---

### Story 1.2 — Realtime presence ("online now")

**Goal:** A live, accurate online-user count and a durable "last active" signal.

**Acceptance criteria**
- A global Supabase Realtime **presence** channel tracks connected authenticated users; the dashboard shows a live-updating "online now" count and can list who.
- A `last_seen timestamptz` column on `profiles` is updated (throttled, e.g. ≤ once/5 min per user) so "last active" survives disconnects and powers offline filtering.
- The hardcoded marketing number on `app/page.tsx` (~line 205) can later read a real value.

**Schema/migration** — `supabase/migrations/20260701020000_last_seen.sql`
```sql
alter table profiles add column last_seen timestamptz;
create index on profiles (last_seen desc);
```

**Files:** `lib/presence.ts` (presence channel join/track + subscribe helper, client-side), `app/admin/components/OnlineNow.tsx` (client), middleware throttle to bump `last_seen`. **Reuse:** existing Realtime setup (publication `supabase_realtime` already active for notifications/follows/likes). **Notes:** presence = live concurrent count; `last_seen` = durable fallback shown as "active 3m ago". Update `last_seen` from a lightweight server action or middleware guarded by a `_seen` cookie to avoid write amplification.

---

### Story 1.3 — Activity charts (Recharts)

**Goal:** Trends over time.

**Acceptance criteria**
- Line/area charts for signups/day, posts/day, and DAU/WAU/MAU over a selectable window (7/30/90d).
- Data via server aggregates grouped by day; charts styled with brand colors.

**Files:** `app/admin/overview/Charts.tsx` (client), aggregate queries in `app/admin/overview/actions.ts`. **Reuse:** Recharts (new dep), brand tokens. **Notes:** DAU from distinct `last_seen`/activity per day; consider a SQL view or `date_trunc('day', ...)` grouping. For larger data, add a nightly rollup table later.

---

### Story 1.4 — Worker health panel

**Goal:** Surface the cron edge functions' status.

**Acceptance criteria**
- Panel shows last run time and ok/error state for `badge-worker`, `weather-worker`, `trend-worker`, `refresh-coverage`.
- Stale (no recent run) or failing workers are visually flagged.

**Files:** `app/admin/overview/WorkerHealth.tsx`; a `worker_runs` table (id, worker, status, message, ran_at) that each function writes on completion (small change to `supabase/functions/*`), OR derive freshness from each worker's output table (`peak_forecasts.created_at`, `trending_peaks_cache`, `user_badges`). **Notes:** prefer the explicit `worker_runs` table for true error visibility; deriving from output tables is a zero-touch fallback.

---

### Story 1.5 — Live activity feed

**Goal:** A streaming feed of what's happening now.

**Acceptance criteria**
- Newest signups, posts, trip reports, and reports appear in a live list (Realtime subscriptions), newest first, each linking to its admin detail view.

**Files:** `app/admin/overview/LiveFeed.tsx` (client). **Reuse:** Realtime subscription pattern from the community feed/notifications. **Notes:** subscribe to `INSERT` on `community_posts`, `profiles`, `trip_reports`, `content_reports`.

---

## Epic 2 — User Management & Moderation

### Story 2.1 — Users table

**Goal:** Find and triage any user.

**Acceptance criteria**
- Paginated, sortable table of users (avatar, screen_name, email, joined, last_seen, status, role).
- Search by screen_name/email; filters: new (last 7/30d), private, banned/suspended, has admin role.

**Files:** `app/admin/users/page.tsx`, `app/admin/users/actions.ts`. **Reuse:** `Table`, `FilterBar`, `Pill` (0.4). **Notes:** read via service-role for full visibility (email lives on `profiles`); always paginate (`range()`).

---

### Story 2.2 — User detail drawer

**Goal:** A 360° view of one user.

**Acceptance criteria**
- Drawer shows profile, stats (posts, summits, badges, follows), recent content, group memberships, and moderation history (audit entries + reports targeting them).

**Files:** `app/admin/users/[id]/` or a drawer in `users/page.tsx`. **Reuse:** `Drawer`/`Modal`, `StatCard`. **Notes:** pull moderation history from `admin_audit_log` (target_type='user') and `content_reports`.

---

### Story 2.3 — Ban / suspend / shadow-ban

**Goal:** Stop abusive users, reversibly and auditably.

**Acceptance criteria**
- `profiles` gains `status (active|suspended|banned)`, `status_reason`, `suspended_until`, `shadow_banned bool`.
- RLS prevents `banned`/`suspended` users from writing posts/comments/etc.; shadow-banned users' new content is hidden from others but visible to themselves.
- Actions are confirmed via dialog, audited (0.5), and can notify the user (3.5).

**Schema/migration** — `supabase/migrations/20260701030000_user_status.sql`
```sql
create type user_status as enum ('active', 'suspended', 'banned');
alter table profiles
  add column status user_status not null default 'active',
  add column status_reason text,
  add column suspended_until timestamptz,
  add column shadow_banned boolean not null default false;

create or replace function is_user_active(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select status = 'active'
       and (suspended_until is null or suspended_until < now())
     from profiles where id = uid), false);
$$;
```
Then update write policies on `community_posts`, `post_comments`, `community_events`, `trip_reports`, etc. to add `and is_user_active(auth.uid())` to their `with check`. Shadow-ban filtering is added to public SELECT policies (`and (not shadow_banned or id = auth.uid())` joined via author).

**Files:** migration above; `app/admin/users/actions.ts` (`banUser`, `suspendUser`, `unbanUser`, `shadowBan`). **Reuse:** confirm dialog via `Modal`, `requireRole("moderator")`, `logAdminAction`. **Notes:** this migration touches many policies — change them in one file and test each content-write path after `pnpm migrate`.

---

### Story 2.4 — Role management

**Goal:** Grant/revoke admin roles.

**Acceptance criteria**
- Only `super_admin` can grant/revoke roles via the UI; changes write `admin_roles` and are audited.

**Files:** `app/admin/operations/roles/page.tsx`, actions. **Reuse:** `requireRole("super_admin")`, Story 0.1 table. **Notes:** prevent a super_admin from demoting the last remaining super_admin.

---

### Story 2.5 — Impersonate / "view as user" (killer feature)

**Goal:** Let support reproduce a user's experience safely.

**Acceptance criteria**
- An admin can enter a **read-only** impersonation context for a user (see their feed/profile as they would), clearly banner-flagged, with no write capability.
- Start/stop is audited; impersonation never mints the target's real session/JWT.

**Files:** `app/admin/users/actions.ts` (`startImpersonation` setting a signed, short-lived `_imp` cookie with target id + admin id), an impersonation banner component, and read-paths that honor the context server-side. **Reuse:** `logAdminAction`. **Notes:** read-only by construction — render the target's data via service-role reads scoped to that user id; do **not** swap the auth session. Strictly time-boxed.

---

## Epic 3 — Content Moderation & Reporting

### Story 3.1 — Reporting schema + user "Report" affordance

**Goal:** Let users flag content; create the queue's data source. None exists today.

**Acceptance criteria**
- `content_reports` stores reporter, target type/id, reason, optional details, status, resolver, resolution notes, timestamps.
- Public users can INSERT a report (RLS) but only read their own; admins read all.
- A reusable "Report" affordance is wired into post/comment/trip-report UIs (hooks only; full UI rollout can follow).

**Schema/migration** — `supabase/migrations/20260701040000_content_reports.sql`
```sql
create type report_target as enum ('post', 'comment', 'trip_report', 'user', 'event', 'group');
create type report_reason as enum ('spam','harassment','misinformation','safety','nsfw','other');
create type report_status as enum ('open','reviewing','resolved','dismissed');

create table content_reports (
  id           bigserial primary key,
  reporter_id  uuid not null references profiles(id) on delete cascade,
  target_type  report_target not null,
  target_id    text not null,
  reason       report_reason not null,
  details      text,
  status       report_status not null default 'open',
  resolved_by  uuid references profiles(id),
  resolution   text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create index on content_reports (status, created_at desc);
create index on content_reports (target_type, target_id);

alter table content_reports enable row level security;
create policy "users create reports" on content_reports
  for insert with check (auth.uid() = reporter_id);
create policy "users read own reports" on content_reports
  for select using (auth.uid() = reporter_id or is_admin(auth.uid()));
create policy "admins update reports" on content_reports
  for update using (has_admin_role(auth.uid(),'moderator'));
```

**Files:** migration above; `app/components/ReportButton.tsx` + `reportContent` action. **Reuse:** `Modal` for the report dialog, `Select` for reason. **Notes:** rate-limit report creation to deter abuse of the report system itself.

---

### Story 3.2 — Moderation queue

**Goal:** One inbox to triage all reports.

**Acceptance criteria**
- Unified, filterable queue (by status/reason/target type) with the reported content inline.
- Bulk and per-item actions: dismiss, mark reviewing, remove content (3.3), warn user (3.5), ban user (2.3) — all audited.

**Files:** `app/admin/moderation/page.tsx`, `app/admin/moderation/actions.ts`. **Reuse:** `Table`, `FilterBar`, `requireRole("moderator")`, `logAdminAction`. **Notes:** resolving a report records `resolved_by`/`resolution` and links to the resulting audit entry.

---

### Story 3.3 — Content browser + soft-delete

**Goal:** Browse/search all content and remove reversibly.

**Acceptance criteria**
- Searchable lists of posts, comments, trip reports with author and timestamps.
- "Remove" sets `deleted_at`/`removed_by` (soft delete) and hides content from the public via RLS; "Restore" clears it. No hard deletes from the UI.

**Schema/migration** — `supabase/migrations/20260701050000_soft_delete.sql`
```sql
alter table community_posts add column deleted_at timestamptz, add column removed_by uuid references profiles(id);
alter table post_comments  add column deleted_at timestamptz, add column removed_by uuid references profiles(id);
alter table trip_reports   add column deleted_at timestamptz, add column removed_by uuid references profiles(id);
```
Update each table's public SELECT policy with `and deleted_at is null` (admins still see all via service-role).

**Files:** migration above; `app/admin/content/page.tsx`, actions (`removeContent`, `restoreContent`). **Reuse:** `Table`, `logAdminAction`. **Notes:** keep removed rows for audit/appeal; a separate retention job can purge later.

---

### Story 3.4 — Automated moderation rules (killer feature)

**Goal:** Catch obvious abuse before a human does.

**Acceptance criteria**
- A configurable keyword/regex blocklist and rate-limit signals auto-create `content_reports` (reason `spam`/`nsfw`) and optionally auto-shadow-ban repeat offenders.
- Rules are editable in the UI (super_admin) and every auto-action is audited.

**Files:** `moderation_rules` table; a DB trigger or a server-action check on content creation that evaluates rules and inserts a report; `app/admin/moderation/rules/page.tsx`. **Reuse:** Story 3.1 reports, 2.3 shadow-ban, audit. **Notes:** start with keyword + posting-rate heuristics; keep thresholds in the table, not in code.

---

### Story 3.5 — Moderation notifications

**Goal:** Tell users when action affects them.

**Acceptance criteria**
- Notification `type` CHECK is extended with `content_removed` and `account_action`; affected users receive a notification with a reason.

**Schema/migration** — `supabase/migrations/20260701060000_mod_notification_types.sql`
```sql
alter table notifications drop constraint notifications_type_check;
alter table notifications add constraint notifications_type_check check (type in (
  'like','comment','badge','follow_request','follow_accepted',
  'group_join_approved','group_join_request','group_invite',
  'event_updated','mention','content_removed','account_action'
));
```

**Files:** migration above; notification insert in moderation actions (via service-role, since `notifications` is insert-restricted). **Notes:** reuse the existing notification rendering; add copy for the two new types.

---

## Epic 4 — Events, Groups & Domain Management

### Story 4.1 — Events admin
**Goal:** Curate events. **Acceptance criteria:** list/filter by `status` (active/cancelled/completed), see attendee counts, cancel or feature an event; audited. **Files:** `app/admin/events/page.tsx`, actions. **Reuse:** `Table`, `community_events`/`event_attendees`. **Notes:** "feature" needs a `featured bool` column on `community_events`.

### Story 4.2 — Groups admin
**Goal:** Oversee groups. **Acceptance criteria:** list with member counts/privacy/category; transfer ownership, archive, and surface group-level bans (`group_members.status='banned'`); audited. **Files:** `app/admin/groups/page.tsx`, actions. **Reuse:** `groups`/`group_members`, `Table`. **Notes:** "archive" needs an `archived_at` column on `groups`; respect existing group-admin RLS by acting via service-role.

### Story 4.3 — Peaks / trailheads content editing
**Goal:** Maintain canonical domain data. **Acceptance criteria:** admin edit of `peaks`, `trailheads`, `routes` fields (descriptions, metadata, cell reception, difficulty); changes audited with before/after. **Files:** `app/admin/content/peaks/...`, actions. **Reuse:** `Modal` forms, `logAdminAction`. **Notes:** these tables are public-read with no owner; gate writes behind `requireRole("moderator")` + service-role.

---

## Epic 5 — Analytics & Growth

### Story 5.1 — Growth dashboard
**Goal:** Understand acquisition & retention. **Acceptance criteria:** retention cohorts (weekly), signup→profile→first-post/first-summit funnel, churn estimate. **Files:** `app/admin/analytics/page.tsx`, SQL views/aggregates. **Reuse:** Recharts. **Notes:** back heavy cohort math with SQL views (`supabase/migrations`) rather than per-request computation.

### Story 5.2 — Engagement leaderboards
**Goal:** Spot top users/peaks/groups. **Acceptance criteria:** ranked tables of most active users, trending peaks (reuse `trending_peaks_cache`), top groups by activity. **Files:** `app/admin/analytics/leaderboards/page.tsx`. **Reuse:** `Table`, existing trend cache.

### Story 5.3 — Content health
**Goal:** Keep condition data fresh. **Acceptance criteria:** trip-report volume/quality trends and condition-report freshness per peak (stale-data flags). **Files:** `app/admin/analytics/content-health/page.tsx`. **Reuse:** `trip_reports`, `peak_forecasts`.

### Story 5.4 — CSV / data export
**Goal:** Get data out. **Acceptance criteria:** any admin table view can export its current (filtered) result set to CSV; exports are audited. **Files:** shared `exportCsv` util + an Export button on `Table`. **Notes:** stream server-side; cap rows and log the export action.

---

## Epic 6 — Platform Operations (killer features)

### Story 6.1 — Broadcast announcements
**Goal:** Message users at scale. **Acceptance criteria:** compose a system-wide or segmented announcement (all users / a saved segment) delivered as in-app notifications and/or a dismissible banner; scheduled or immediate; audited. **Schema:** `announcements` table (title, body, audience, starts_at, ends_at, created_by) + fan-out via the notifications insert path. **Files:** `app/admin/operations/announcements/page.tsx`, actions; a banner reader on the public app. **Reuse:** notifications + Realtime delivery. **Notes:** add an `announcement` notification type (same migration pattern as 3.5) if delivered via notifications.

### Story 6.2 — Feature flags / kill switches
**Goal:** Toggle features and disable abuse vectors without a deploy. **Acceptance criteria:** `feature_flags` table (key, enabled, audience, payload); `lib/flags.ts` reads flags server-side (cached); super_admin toggles in UI; changes audited. **Files:** migration, `lib/flags.ts`, `app/admin/operations/flags/page.tsx`. **Notes:** gate risky features (new posting flows, third-party calls) behind flags so they can be killed instantly during an incident.

### Story 6.3 — Saved segments / filters
**Goal:** Reuse common queries. **Acceptance criteria:** save a named filter set (users or content) and re-apply it; usable as an announcement audience (6.1). **Files:** `saved_segments` table + UI in `FilterBar`. **Reuse:** `FilterBar` (0.4).

### Story 6.4 — Global admin search
**Goal:** Jump to anything fast. **Acceptance criteria:** a top-bar command palette searches users, posts, groups, events, peaks and deep-links to their admin views. **Files:** `app/admin/components/AdminSearch.tsx`, a search action. **Reuse:** the topbar slot from 0.4; pattern after `app/components/GlobalSearch.tsx`. **Notes:** debounce; cap results per type.

---

## Appendix — Implementation order & guardrails

1. **Epic 0 first, in order** (0.1 → 0.5). Nothing else works without roles, the admin client, the shell, and the audit log.
2. Then build outward by value: **Epic 1** (visibility) → **Epic 2/3** (safety) → **4/5/6** as needed. Each story after Epic 0 is independently shippable.
3. **Every privileged write**: `requireRole(...)` as the first line → service-role client → `logAdminAction(...)`. No exceptions.
4. **Prefer soft state** (`status`, `deleted_at`, `shadow_banned`) over destructive operations; RLS keeps the public surface safe.
5. **Migrations** via `pnpm migrate` with timestamps after `20260630000000`; never the MCP server. After any RLS-touching migration (2.3, 3.3), manually verify each affected public write/read path.
6. **Verify a story** with `pnpm lint`, `pnpm build`, and by loading the relevant `/admin/*` route as a seeded super_admin.
