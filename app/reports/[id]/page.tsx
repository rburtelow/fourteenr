import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TripReportSections } from "@/lib/database.types";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Navbar from "../../components/Navbar";

const TRAILHEAD_LABELS: Record<string, string> = {
  clear_2wd: "Clear (2WD)",
  rough_2wd: "Rough (2WD)",
  "4wd_required": "4WD Required",
  snow_blocked: "Snow Blocked",
};

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  trailhead_conditions: { label: "Trailhead Conditions", icon: "P" },
  weather: { label: "Weather", icon: "W" },
  snow_conditions: { label: "Snow Conditions", icon: "S" },
  route_conditions: { label: "Route Conditions", icon: "R" },
  water_crossings: { label: "Water Crossings", icon: "~" },
  navigation_notes: { label: "Navigation Notes", icon: "N" },
  time_breakdown: { label: "Time Breakdown", icon: "T" },
  gear: { label: "Gear", icon: "G" },
  camping: { label: "Camping", icon: "C" },
  training_prep: { label: "Training & Prep", icon: "F" },
  wildlife: { label: "Wildlife", icon: "A" },
  lessons_learned: { label: "Lessons Learned", icon: "L" },
  mistakes_made: { label: "Mistakes Made", icon: "M" },
};

const SECTION_ORDER = [
  "trailhead_conditions",
  "weather",
  "snow_conditions",
  "route_conditions",
  "water_crossings",
  "navigation_notes",
  "time_breakdown",
  "gear",
  "camping",
  "training_prep",
  "wildlife",
  "lessons_learned",
  "mistakes_made",
];

function formatTime(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function RatingDots({ value, max = 5, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${i < value ? color : "bg-[var(--color-border-app)]"}`}
        />
      ))}
    </div>
  );
}

function SectionDetail({
  sectionKey,
  section,
}: {
  sectionKey: string;
  section: { enabled: boolean; data?: Record<string, unknown>; notes?: string };
}) {
  const meta = SECTION_LABELS[sectionKey];
  if (!meta || !section.enabled) return null;

  const data = section.data || {};
  const notes = section.notes;
  const dataEntries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  );

  if (dataEntries.length === 0 && !notes) return null;

  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)]">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] text-white flex items-center justify-center text-xs font-bold">
          {meta.icon}
        </span>
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{meta.label}</h4>
      </div>
      {dataEntries.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2 text-sm">
          {dataEntries.map(([key, val]) => {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            let display: string;
            if (typeof val === "boolean") display = val ? "Yes" : "No";
            else if (Array.isArray(val)) display = val.join(", ");
            else if (typeof val === "number" && key.includes("minutes")) display = formatDuration(val);
            else display = String(val);
            return (
              <span key={key} className="text-[var(--color-text-secondary)]">
                <span className="font-medium text-[var(--color-text-primary)]">{label}:</span>{" "}
                {display}
              </span>
            );
          })}
        </div>
      )}
      {notes && (
        <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{notes}</p>
      )}
    </div>
  );
}

export default async function TripReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the trip report with peak and profile joins
  const { data: report } = await supabase
    .from("trip_reports")
    .select(`
      id,
      hike_date,
      start_time,
      end_time,
      total_time_minutes,
      difficulty_rating,
      condition_severity_score,
      objective_risk_score,
      trailhead_access_rating,
      overall_recommendation,
      snow_present,
      summary,
      narrative,
      sections_json,
      created_at,
      peaks (id, name, slug, elevation),
      profiles (screen_name, full_name, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (!report) {
    notFound();
  }

  const peak = report.peaks as { id: string; name: string; slug: string; elevation: number } | null;
  const profile = report.profiles as { screen_name: string | null; full_name: string | null; avatar_url: string | null } | null;

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let navPeaks: { id: string; name: string; slug: string; elevation: number }[] = [];
  let unreadNotificationCount = 0;

  if (user) {
    const [{ data: userProfile }, { data: peaksData }, notifCount] = await Promise.all([
      supabase.from("profiles").select("screen_name, avatar_url").eq("id", user.id).single(),
      supabase.from("peaks").select("id, name, slug, elevation").order("name"),
      getUnreadNotificationCount(user.id),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: userProfile?.screen_name || null,
      avatar_url: userProfile?.avatar_url || null,
    };
    navPeaks = peaksData || [];
    unreadNotificationCount = notifCount;
  }

  const sections = (report.sections_json as TripReportSections) || {};
  const enabledSections = SECTION_ORDER.filter((key) => {
    const s = (sections as Record<string, { enabled: boolean } | null>)[key];
    return s && s.enabled;
  });

  const hikeDate = new Date(report.hike_date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const displayName = profile?.full_name || profile?.screen_name || "A hiker";
  const screenName = profile?.screen_name;

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={navPeaks}
      />

      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-8">
            <Link href="/" className="hover:text-[var(--color-brand-primary)] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            {peak && (
              <>
                <Link href={`/peaks/${peak.slug}`} className="hover:text-[var(--color-brand-primary)] transition-colors">{peak.name}</Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-[var(--color-text-primary)] font-medium">Trip Report</span>
          </nav>

          <div className="bg-white rounded-3xl border border-[var(--color-border-app)] shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] px-8 py-10 text-white">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <MountainIcon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {peak && (
                    <Link
                      href={`/peaks/${peak.slug}`}
                      className="inline-block text-2xl font-bold text-white hover:text-white/80 transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {peak.name}
                    </Link>
                  )}
                  <p className="text-white/70 text-sm mt-1">
                    {peak ? `${peak.elevation.toLocaleString()}'` : ""} · {hikeDate}
                  </p>
                  {(report.start_time && report.end_time) && (
                    <p className="text-white/60 text-sm mt-0.5">
                      {formatTime(report.start_time)} – {formatTime(report.end_time)}
                      {report.total_time_minutes ? ` · ${formatDuration(report.total_time_minutes)}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/20">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  {screenName && (
                    <Link href={`/u/${screenName}`} className="text-xs text-white/60 hover:text-white/80 transition-colors">
                      @{screenName}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {report.overall_recommendation ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Recommended
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Not Recommended
                  </span>
                )}
                {report.snow_present && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    Snow Present
                  </span>
                )}
                {report.trailhead_access_rating && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border-app)]">
                    {TRAILHEAD_LABELS[report.trailhead_access_rating] || report.trailhead_access_rating}
                  </span>
                )}
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-center">
                  <p className="text-xs font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-2">Difficulty</p>
                  <div className="flex justify-center mb-1.5">
                    <RatingDots value={report.difficulty_rating} color="bg-[var(--color-brand-primary)]" />
                  </div>
                  <p className="text-xl font-bold text-[var(--color-brand-primary)]">{report.difficulty_rating}/5</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-center">
                  <p className="text-xs font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-2">Conditions</p>
                  <div className="flex justify-center mb-1.5">
                    <RatingDots value={report.condition_severity_score} color="bg-amber-500" />
                  </div>
                  <p className="text-xl font-bold text-amber-600">{report.condition_severity_score}/5</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-center">
                  <p className="text-xs font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-2">Risk</p>
                  <div className="flex justify-center mb-1.5">
                    <RatingDots value={report.objective_risk_score} color="bg-rose-500" />
                  </div>
                  <p className="text-xl font-bold text-rose-600">{report.objective_risk_score}/5</p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-3">Summary</h2>
                <p className="text-[var(--color-text-primary)] leading-relaxed">{report.summary}</p>
              </div>

              {/* Narrative */}
              {report.narrative && (
                <div>
                  <h2 className="text-sm font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-3">Full Report</h2>
                  <div className="text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {report.narrative}
                  </div>
                </div>
              )}

              {/* Sections */}
              {enabledSections.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-[var(--color-text-muted-green)] uppercase tracking-wider mb-3">Details</h2>
                  <div className="space-y-3">
                    {enabledSections.map((key) => (
                      <SectionDetail
                        key={key}
                        sectionKey={key}
                        section={(sections as Record<string, { enabled: boolean; data?: Record<string, unknown>; notes?: string }>)[key]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              {peak && (
                <div className="pt-4 border-t border-[var(--color-border-app)]">
                  <Link
                    href={`/peaks/${peak.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-primary)] hover:underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to {peak.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l5-10 4 5 3-6 4 11H4z" />
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

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
