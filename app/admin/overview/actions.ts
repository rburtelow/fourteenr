"use server";

import { createAdminClient, requireAdmin } from "@/lib/supabase/admin";

export interface KpiSnapshot {
  totalUsers: number;
  newUsers24h: number;
  newUsers7d: number;
  newUsers30d: number;
  totalPosts: number;
  newPosts24h: number;
  totalEvents: number;
  totalGroups: number;
  totalTripReports: number;
  onlineLast5m: number;
}

async function countWhere(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  filter?: { column: string; interval: string }
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (admin as any).from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.gte(filter.column, `now() - interval '${filter.interval}'`);
  const { count } = await q;
  return count ?? 0;
}

export async function getKpiSnapshot(): Promise<KpiSnapshot> {
  await requireAdmin();
  const admin = createAdminClient();

  const [
    totalUsers,
    newUsers24h,
    newUsers7d,
    newUsers30d,
    totalPosts,
    newPosts24h,
    totalEvents,
    totalGroups,
    totalTripReports,
    onlineLast5m,
  ] = await Promise.all([
    countWhere(admin, "profiles"),
    countWhere(admin, "profiles", { column: "created_at", interval: "24 hours" }),
    countWhere(admin, "profiles", { column: "created_at", interval: "7 days" }),
    countWhere(admin, "profiles", { column: "created_at", interval: "30 days" }),
    countWhere(admin, "community_posts"),
    countWhere(admin, "community_posts", { column: "created_at", interval: "24 hours" }),
    countWhere(admin, "community_events"),
    countWhere(admin, "groups"),
    countWhere(admin, "trip_reports"),
    countWhere(admin, "profiles", { column: "last_seen", interval: "5 minutes" }),
  ]);

  return {
    totalUsers,
    newUsers24h,
    newUsers7d,
    newUsers30d,
    totalPosts,
    newPosts24h,
    totalEvents,
    totalGroups,
    totalTripReports,
    onlineLast5m,
  };
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface ChartData {
  signupsPerDay: DailyCount[];
  postsPerDay: DailyCount[];
  dauPerDay: DailyCount[];
}

export async function getChartData(days: 7 | 30 | 90 = 30): Promise<ChartData> {
  await requireAdmin();
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adm = admin as any;

  const interval = `${days} days`;

  const [signupsRes, postsRes, dauRes] = await Promise.all([
    adm.rpc("admin_signups_per_day", { p_days: days }),
    adm.rpc("admin_posts_per_day", { p_days: days }),
    adm.rpc("admin_dau_per_day", { p_days: days }),
  ]);

  const toSeries = (rows: { date: string; count: number }[] | null): DailyCount[] =>
    (rows ?? []).map((r) => ({ date: r.date, count: Number(r.count) }));

  return {
    signupsPerDay: toSeries(signupsRes.data),
    postsPerDay: toSeries(postsRes.data),
    dauPerDay: toSeries(dauRes.data),
  };
}
