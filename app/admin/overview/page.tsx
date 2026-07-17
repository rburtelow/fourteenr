import { requireAdmin } from "@/lib/supabase/admin";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import OnlineNow from "../components/OnlineNow";
import Charts from "./Charts";
import { getKpiSnapshot, getChartData } from "./actions";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  await requireAdmin();
  const [kpi, charts] = await Promise.all([getKpiSnapshot(), getChartData(30)]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Overview"
          description="Platform health at a glance."
        />
        <OnlineNow initialCount={kpi.onlineLast5m} />
      </div>

      {/* Users */}
      <section>
        <h2 className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-3">
          Users
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={kpi.totalUsers.toLocaleString()} />
          <StatCard
            label="New (24h)"
            value={kpi.newUsers24h.toLocaleString()}
            delta={`${kpi.newUsers24h} today`}
            deltaUp={kpi.newUsers24h > 0}
          />
          <StatCard
            label="New (7d)"
            value={kpi.newUsers7d.toLocaleString()}
            delta={`${kpi.newUsers7d} this week`}
            deltaUp={kpi.newUsers7d > 0}
          />
          <StatCard
            label="New (30d)"
            value={kpi.newUsers30d.toLocaleString()}
            delta={`${kpi.newUsers30d} this month`}
            deltaUp={kpi.newUsers30d > 0}
          />
        </div>
      </section>

      {/* Content */}
      <section>
        <h2 className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-3">
          Content
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Posts"
            value={kpi.totalPosts.toLocaleString()}
            delta={`${kpi.newPosts24h} today`}
            deltaUp={kpi.newPosts24h > 0}
          />
          <StatCard label="Events" value={kpi.totalEvents.toLocaleString()} />
          <StatCard label="Groups" value={kpi.totalGroups.toLocaleString()} />
          <StatCard label="Trip Reports" value={kpi.totalTripReports.toLocaleString()} />
        </div>
      </section>

      {/* Charts */}
      <Charts data={charts} />
    </div>
  );
}
