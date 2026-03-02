import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrailheadBySlug, getTrailheadConditions, type TrailheadRoute, type TrailheadConditionReport } from "@/lib/trailheads";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Navbar from "../../components/Navbar";

export const revalidate = 3600;

export default async function TrailheadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trailhead = await getTrailheadBySlug(slug);

  if (!trailhead) {
    notFound();
  }

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    conditions,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getTrailheadConditions(trailhead.id),
  ]);

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let navPeaks: { id: string; name: string; slug: string; elevation: number }[] = [];
  let unreadNotificationCount = 0;

  if (user) {
    const [{ data: profile }, { data: peaksData }, notifCount] = await Promise.all([
      supabase.from("profiles").select("screen_name, avatar_url").eq("id", user.id).single(),
      supabase.from("peaks").select("id, name, slug, elevation").order("name"),
      getUnreadNotificationCount(user.id),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    navPeaks = peaksData || [];
    unreadNotificationCount = notifCount;
  }

  const googleMapsUrl =
    trailhead.latitude && trailhead.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${trailhead.latitude},${trailhead.longitude}`
      : null;

  // Deduplicate peaks accessible from this trailhead
  const accessiblePeaks = [
    ...new Map(
      trailhead.routes
        .filter((r) => r.peaks)
        .map((r) => [r.peaks!.id, r.peaks!])
    ).values(),
  ];

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={navPeaks}
      />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-end pb-16 pt-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary)] via-[var(--color-brand-primary)]/85 to-[var(--color-brand-accent)]" />
            <div className="absolute inset-0 topo-pattern opacity-10" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
            {/* Breadcrumb */}
            <div className="animate-fade-up mb-6">
              <div className="inline-flex items-center gap-2 text-sm bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Link href="/" className="text-white/90 hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-4 h-4 text-white/60" />
                <Link href="/trailheads" className="text-white/90 hover:text-white transition-colors">
                  Trailheads
                </Link>
                <ChevronRight className="w-4 h-4 text-white/60" />
                <span className="text-white font-medium">{trailhead.name}</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-end">
              <div>
                <div className="animate-fade-up flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-[var(--color-brand-primary)] tracking-wider uppercase">
                    Trailhead
                  </span>
                  {trailhead.road_type && (
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white ${getRoadTypeBadgeClass(trailhead.road_type)}`}
                    >
                      {formatRoadType(trailhead.road_type)}
                    </span>
                  )}
                </div>

                <h1 className="animate-fade-up delay-100">
                  <span
                    className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
                    style={{
                      fontFamily: "var(--font-display)",
                      textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    {trailhead.name}
                  </span>
                </h1>

                {trailhead.nearest_town && (
                  <div
                    className="animate-fade-up delay-200 mt-4 flex items-center gap-2 text-white/80"
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
                  >
                    <MapPinIcon className="w-5 h-5" />
                    <span>Near {trailhead.nearest_town}, Colorado</span>
                  </div>
                )}
              </div>

              {/* Elevation Card */}
              <div className="animate-fade-up delay-300">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-2xl">
                  <div className="text-center">
                    <p className="text-sm text-[var(--color-text-muted-green)] font-medium tracking-wider uppercase mb-2">
                      Trailhead Elevation
                    </p>
                    <p
                      className="text-6xl font-bold text-[var(--color-brand-primary)] tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {trailhead.elevation_ft ? trailhead.elevation_ft.toLocaleString() : "—"}
                      <span className="text-3xl text-[var(--color-text-secondary)]">&apos;</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--color-border-app)]">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
                        {trailhead.routes.length}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted-green)] mt-1">Routes</p>
                    </div>
                    <div className="text-center border-l border-[var(--color-border-app)]">
                      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
                        {accessiblePeaks.length}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted-green)] mt-1">Peaks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-white border-b border-[var(--color-border-app)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
            <div className="flex flex-wrap gap-6 items-center justify-center sm:justify-start">
              {trailhead.road_type && (
                <StatBadge
                  icon={<RoadIcon className="w-4 h-4" />}
                  label="Road"
                  value={formatRoadType(trailhead.road_type)}
                />
              )}
              {trailhead.parking_type && (
                <StatBadge
                  icon={<ParkingIcon className="w-4 h-4" />}
                  label="Parking"
                  value={formatParkingType(trailhead.parking_type)}
                />
              )}
              <StatBadge
                icon={<RestroomIcon className="w-4 h-4" />}
                label="Restrooms"
                value={trailhead.restrooms ? "Available" : "None"}
              />
              <StatBadge
                icon={<FeeIcon className="w-4 h-4" />}
                label="Fee"
                value={trailhead.fee_required ? "Required" : "Free"}
              />
              <StatBadge
                icon={<SnowflakeIcon className="w-4 h-4" />}
                label="Winter Access"
                value={trailhead.winter_accessible ? "Open" : "Seasonal"}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <section className="py-12 relative">
          <div className="absolute inset-0 topo-pattern opacity-30" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                {trailhead.description && (
                  <div className="animate-fade-up bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
                    <h2
                      className="text-2xl font-bold text-[var(--color-brand-primary)] mb-4"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      About this Trailhead
                    </h2>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {trailhead.description}
                    </p>
                  </div>
                )}

                {/* Driving Notes */}
                {trailhead.driving_notes && (
                  <div className="animate-fade-up delay-100 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-subtle)] flex items-center justify-center text-[var(--color-brand-primary)]">
                        <CarIcon className="w-5 h-5" />
                      </div>
                      <h2
                        className="text-2xl font-bold text-[var(--color-brand-primary)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Driving Directions
                      </h2>
                    </div>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {trailhead.driving_notes}
                    </p>
                  </div>
                )}

                {/* Routes */}
                {trailhead.routes.length > 0 && (
                  <div className="animate-fade-up delay-200 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2
                        className="text-2xl font-bold text-[var(--color-brand-primary)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Routes from this Trailhead
                      </h2>
                      <span className="text-sm text-[var(--color-text-muted-green)]">
                        {trailhead.routes.length} route{trailhead.routes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {trailhead.routes.map((route, i) => (
                        <TrailheadRouteCard key={route.id} route={route} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Conditions */}
                <RecentConditions conditions={conditions} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Map Placeholder */}
                <div className="animate-fade-up delay-100 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)]">
                    <div className="absolute inset-0 topo-pattern opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPinIcon className="w-10 h-10 text-white/80 mx-auto mb-2" />
                        <p className="text-white/70 text-sm font-medium">Trailhead Location</p>
                        {trailhead.latitude && trailhead.longitude && (
                          <p className="text-white/50 text-xs mt-1">
                            {Number(trailhead.latitude).toFixed(4)}°N,{" "}
                            {Math.abs(Number(trailhead.longitude)).toFixed(4)}°W
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">
                      Coordinates
                    </h3>
                    <div className="space-y-3 mb-5">
                      {trailhead.latitude && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-text-secondary)]">Latitude</span>
                          <span className="font-mono text-sm font-medium text-[var(--color-brand-primary)]">
                            {Number(trailhead.latitude).toFixed(4)}° N
                          </span>
                        </div>
                      )}
                      {trailhead.longitude && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-text-secondary)]">Longitude</span>
                          <span className="font-mono text-sm font-medium text-[var(--color-brand-primary)]">
                            {Math.abs(Number(trailhead.longitude)).toFixed(4)}° W
                          </span>
                        </div>
                      )}
                    </div>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>

                {/* Trailhead Details */}
                <div className="animate-fade-up delay-200 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-6">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">
                    Trailhead Details
                  </h3>
                  <div className="space-y-4">
                    {trailhead.nearest_town && (
                      <div>
                        <p className="text-xs text-[var(--color-text-muted-green)] mb-1">Nearest Town</p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {trailhead.nearest_town}, CO
                        </p>
                      </div>
                    )}
                    {trailhead.parking_type && (
                      <div>
                        <p className="text-xs text-[var(--color-text-muted-green)] mb-1">Parking Type</p>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {formatParkingType(trailhead.parking_type)}
                          {trailhead.parking_capacity &&
                            ` — ${formatCapacity(trailhead.parking_capacity)}`}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div
                        className={`flex flex-col items-center p-3 rounded-xl text-center ${
                          trailhead.restrooms
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        <RestroomIcon className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">Restrooms</span>
                        <span className="text-xs">{trailhead.restrooms ? "Yes" : "No"}</span>
                      </div>
                      <div
                        className={`flex flex-col items-center p-3 rounded-xl text-center ${
                          trailhead.fee_required
                            ? "bg-amber-50 text-amber-700"
                            : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        <FeeIcon className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">Fee</span>
                        <span className="text-xs">{trailhead.fee_required ? "Yes" : "No"}</span>
                      </div>
                      <div
                        className={`flex flex-col items-center p-3 rounded-xl text-center ${
                          trailhead.winter_accessible
                            ? "bg-sky-50 text-sky-700"
                            : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        <SnowflakeIcon className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">Winter</span>
                        <span className="text-xs">{trailhead.winter_accessible ? "Open" : "Closed"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Peaks Accessible */}
                {accessiblePeaks.length > 0 && (
                  <div className="animate-fade-up delay-300 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">
                      Peaks Accessible
                    </h3>
                    <div className="space-y-2">
                      {accessiblePeaks.map((peak) => (
                        <Link
                          key={peak.id}
                          href={`/peaks/${peak.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-surface-subtle)] transition-colors group"
                        >
                          <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                            {peak.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--color-text-muted-green)]">
                              {peak.elevation.toLocaleString()}&apos;
                            </span>
                            <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-app)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-brand-primary)] rounded-xl flex items-center justify-center">
                <MountainLogo className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--color-brand-primary)]">
                My14er
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)]/60">
              © 2026 My14er. Hike responsibly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const ACCESS_RATING_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; borderClass: string }> = {
  clear_2wd:    { label: "Clear (2WD)",    bgClass: "bg-emerald-50",  textClass: "text-emerald-700",  borderClass: "border-emerald-200" },
  rough_2wd:    { label: "Rough (2WD)",    bgClass: "bg-amber-50",    textClass: "text-amber-700",    borderClass: "border-amber-200" },
  "4wd_required": { label: "4WD Required", bgClass: "bg-orange-50",   textClass: "text-orange-700",   borderClass: "border-orange-200" },
  snow_blocked: { label: "Snow Blocked",   bgClass: "bg-rose-50",     textClass: "text-rose-700",     borderClass: "border-rose-200" },
};

function AccessRatingBadge({ rating }: { rating: string }) {
  const cfg = ACCESS_RATING_CONFIG[rating];
  if (!cfg) return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{rating}</span>;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}`}>
      {cfg.label}
    </span>
  );
}

function RecentConditions({ conditions }: { conditions: TrailheadConditionReport[] }) {
  if (conditions.length === 0) return null;

  const mostRecent = conditions[0];
  const trailheadConditionsText =
    mostRecent.sections_json &&
    typeof mostRecent.sections_json === "object" &&
    "trailhead_conditions" in (mostRecent.sections_json as Record<string, unknown>)
      ? ((mostRecent.sections_json as Record<string, { enabled?: boolean; notes?: string }>).trailhead_conditions?.notes ?? null)
      : null;

  return (
    <div className="animate-fade-up delay-300 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recent Conditions
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            From hiker trip reports
          </p>
        </div>

        {/* Current Access indicator */}
        {mostRecent.trailhead_access_rating && (
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted-green)] mb-1.5 font-medium uppercase tracking-wide">
              Current Access
            </p>
            <AccessRatingBadge rating={mostRecent.trailhead_access_rating} />
          </div>
        )}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--color-border-app)]" />

        <div className="space-y-5">
          {conditions.map((report, i) => {
            const profile = report.profiles;
            const displayName = profile?.full_name || profile?.screen_name || "A hiker";
            const date = new Date(report.hike_date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const conditionsText =
              report.sections_json &&
              typeof report.sections_json === "object" &&
              "trailhead_conditions" in (report.sections_json as Record<string, unknown>)
                ? ((report.sections_json as Record<string, { enabled?: boolean; notes?: string }>).trailhead_conditions?.notes ?? null)
                : null;

            return (
              <div key={report.id} className="flex gap-4 pl-1">
                {/* Timeline dot */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 ${
                  i === 0
                    ? "bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)]"
                    : "bg-white border-[var(--color-border-app)]"
                }`}>
                  <span className={`text-xs font-bold ${i === 0 ? "text-white" : "text-[var(--color-text-secondary)]"}`}>
                    {i + 1}
                  </span>
                </div>

                <div className="flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{displayName}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{date}</span>
                    {report.trailhead_access_rating && (
                      <AccessRatingBadge rating={report.trailhead_access_rating} />
                    )}
                  </div>
                  {conditionsText && (
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {conditionsText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Most recent conditions notes inline below the indicator */}
        {trailheadConditionsText && conditions.length === 1 && (
          <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed pl-11">
            {trailheadConditionsText}
          </p>
        )}
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[var(--color-text-muted-green)]">{icon}</span>
      <div>
        <span className="text-xs text-[var(--color-text-muted-green)] block">{label}</span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">{value}</span>
      </div>
    </div>
  );
}

function TrailheadRouteCard({ route, index }: { route: TrailheadRoute; index: number }) {
  const difficultyColors: Record<string, string> = {
    "Class 1": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Class 2": "bg-sky-100 text-sky-700 border-sky-200",
    "Class 3": "bg-amber-100 text-amber-700 border-amber-200",
    "Class 4": "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div className="group p-5 rounded-2xl border border-[var(--color-border-app)] hover:border-[var(--color-brand-primary)]/30 hover:bg-[var(--color-surface-subtle)]/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center text-sm font-bold text-[var(--color-brand-primary)]">
            {index + 1}
          </span>
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)]">{route.name}</h4>
            {route.peaks && (
              <Link
                href={`/peaks/${route.peaks.slug}`}
                className="text-xs text-[var(--color-brand-primary)] hover:underline"
              >
                {route.peaks.name} — {route.peaks.elevation.toLocaleString()}&apos;
              </Link>
            )}
          </div>
        </div>
        {route.difficulty && (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              difficultyColors[route.difficulty] ?? "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            {route.difficulty}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {route.distance && (
          <span className="text-[var(--color-text-secondary)]">{route.distance} mi</span>
        )}
        {route.elevation_gain && (
          <span className="text-[var(--color-text-secondary)]">
            {route.elevation_gain.toLocaleString()}&apos; gain
          </span>
        )}
        {route.estimated_time && (
          <span className="text-[var(--color-text-secondary)]">{route.estimated_time}</span>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRoadTypeBadgeClass(roadType: string): string {
  const classes: Record<string, string> = {
    paved: "bg-emerald-500",
    gravel: "bg-sky-500",
    rough_2wd: "bg-amber-500",
    "4wd_required": "bg-rose-500",
    "4wd_high_clearance": "bg-rose-700",
  };
  return classes[roadType] || "bg-gray-500";
}

function formatRoadType(roadType: string): string {
  const labels: Record<string, string> = {
    paved: "Paved",
    gravel: "Gravel",
    rough_2wd: "Rough 2WD",
    "4wd_required": "4WD Required",
    "4wd_high_clearance": "4WD High Clearance",
  };
  return labels[roadType] || roadType;
}

function formatParkingType(parkingType: string): string {
  const labels: Record<string, string> = {
    lot: "Parking Lot",
    pulloff: "Pull-off",
    dispersed: "Dispersed",
    none: "No Parking",
  };
  return labels[parkingType] || parkingType;
}

function formatCapacity(capacity: string): string {
  const labels: Record<string, string> = {
    small: "small (<10 cars)",
    medium: "medium (10–30 cars)",
    large: "large (30+ cars)",
  };
  return labels[capacity] || capacity;
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function MountainLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function RoadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21l4-18 4 18M3 7l9 14 9-14" />
    </svg>
  );
}

function ParkingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M9 17V7h4a3 3 0 010 6H9" />
    </svg>
  );
}

function RestroomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2a1 1 0 100 2 1 1 0 000-2zm12 0a1 1 0 100 2 1 1 0 000-2zM4 8h4v8H4V8zm12 0h4v8h-4V8zM9 8l3 8 3-8" />
    </svg>
  );
}

function FeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v2m0 8v2m-3-7h6m-6 2h6" />
    </svg>
  );
}

function SnowflakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 01-2-2v-4a2 2 0 012-2l3-5h12l3 5a2 2 0 012 2v4a2 2 0 01-2 2h-2m-7 0H5m7 0a2 2 0 100 4 2 2 0 000-4zm-7 0a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}
