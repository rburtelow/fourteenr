import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllPeaks } from "@/lib/peaks";
import { getAllBadges, getUserBadges } from "@/lib/badges";
import type { Peak } from "@/lib/database.types";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { getPublicGroupsForUser } from "@/lib/groups";
import { CATEGORY_LABELS } from "@/lib/groups.types";
import { isAcceptedFollower, getFollowStatus, getFollowerCount, getFollowingCount } from "@/lib/follows";
import { canViewSection, type PrivacySettings } from "@/lib/privacy";
import FollowButton from "./FollowButton";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BadgeGrid from "../../components/badges/BadgeGrid";
import TripReportsList from "../../profile/TripReportsList";
import type { TripReportData } from "../../profile/TripReportsList";

const TOTAL_14ERS = 58;

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile by screen_name
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, screen_name, avatar_url, full_name, location, bio, created_at, privacy_settings")
    .eq("screen_name", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Get current user for nav
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [userNavResult, navPeaksResult, unreadNotificationCount] = user
    ? await Promise.all([
        supabase.from("profiles").select("screen_name, avatar_url").eq("id", user.id).single(),
        supabase.from("peaks").select("id, name, slug, elevation").order("name"),
        getUnreadNotificationCount(user.id),
      ])
    : [{ data: null }, { data: [] }, 0];

  const userNav = user && userNavResult.data
    ? {
        email: user.email || "",
        screen_name: (userNavResult.data as { screen_name: string | null; avatar_url: string | null }).screen_name || null,
        avatar_url: (userNavResult.data as { screen_name: string | null; avatar_url: string | null }).avatar_url || null,
      }
    : null;
  const navPeaks = (navPeaksResult as { data: { id: string; name: string; slug: string; elevation: number }[] | null }).data || [];

  const isOwnProfile = user?.id === profile.id;

  // Check follower status and follow status
  const [isFollower, followStatus] = !isOwnProfile && user
    ? await Promise.all([
        isAcceptedFollower(user.id, profile.id),
        getFollowStatus(user.id, profile.id),
      ])
    : [false, "none" as const];

  const privacySettings = (profile.privacy_settings ?? {}) as Partial<PrivacySettings>;
  const canViewStats = canViewSection("show_stats", privacySettings, isOwnProfile, isFollower);
  const canViewSummitHistory = canViewSection("show_summit_history", privacySettings, isOwnProfile, isFollower);
  const canViewBadges = canViewSection("show_badges", privacySettings, isOwnProfile, isFollower);
  const canViewGroups = canViewSection("show_groups", privacySettings, isOwnProfile, isFollower);
  const canViewWishlist = canViewSection("show_wishlist", privacySettings, isOwnProfile, isFollower);
  const canViewTripReports = canViewSection("show_trip_reports", privacySettings, isOwnProfile, isFollower);
  const canViewEvents = canViewSection("show_events", privacySettings, isOwnProfile, isFollower);

  // Fetch summit logs
  const { data: summitLogs } = await supabase
    .from("summit_logs")
    .select("id, peak_id, route_id, summit_date, rating, weather, notes")
    .eq("user_id", profile.id)
    .order("summit_date", { ascending: false });

  // Fetch routes for summit logs
  const routeIds = (summitLogs || [])
    .map((log) => log.route_id)
    .filter((id): id is string => id !== null);

  const { data: summitRoutes } =
    routeIds.length > 0
      ? await supabase
          .from("routes")
          .select("id, distance, elevation_gain")
          .in("id", routeIds)
      : { data: null };

  const routeMap = new Map((summitRoutes || []).map((r) => [r.id, r]));

  // Fetch all peaks
  const allPeaks = await getAllPeaks();
  const peakMap = new Map<string, Peak>(allPeaks.map((p) => [p.id, p]));

  // Fetch trip reports (for stats + section)
  const { data: tripReports } = await supabase
    .from("trip_reports")
    .select("id, peak_id, route_id, hike_date, start_time, end_time, total_time_minutes, summary, narrative, difficulty_rating, condition_severity_score, objective_risk_score, trailhead_access_rating, overall_recommendation, snow_present, sections_json, created_at")
    .eq("user_id", profile.id)
    .order("hike_date", { ascending: false });

  // Fetch watchlist
  const { data: watchlistRows } = await supabase
    .from("peak_watchlist")
    .select("id, peak_id, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Fetch events
  type RawEvent = { id: string; title: string; event_date: string; location: string; status: string; peaks: { name: string } | null };
  type UserEvent = { id: string; title: string; event_date: string; location: string; status: string; peak_name: string | null; role: "hosting" | "going" };

  const [{ data: createdEvents }, { data: rsvpdRows }] = await Promise.all([
    supabase
      .from("community_events")
      .select("id, title, event_date, location, status, peaks:peak_id(name)")
      .eq("created_by", profile.id)
      .order("event_date", { ascending: false }),
    supabase
      .from("event_attendees")
      .select("event_id")
      .eq("user_id", profile.id),
  ]);

  const createdIds = new Set((createdEvents || []).map((e) => e.id));
  const nonCreatedIds = (rsvpdRows || [])
    .map((r) => r.event_id)
    .filter((id) => !createdIds.has(id));

  const { data: rsvpdEvents } =
    nonCreatedIds.length > 0
      ? await supabase
          .from("community_events")
          .select("id, title, event_date, location, status, peaks:peak_id(name)")
          .in("id", nonCreatedIds)
          .order("event_date", { ascending: false })
      : { data: [] };

  const mapEvent = (e: RawEvent, role: "hosting" | "going"): UserEvent => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    location: e.location,
    status: e.status,
    peak_name: e.peaks?.name ?? null,
    role,
  });

  const userEvents: UserEvent[] = [
    ...(createdEvents || []).map((e) => mapEvent(e as RawEvent, "hosting")),
    ...(rsvpdEvents || []).map((e) => mapEvent(e as RawEvent, "going")),
  ].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const now = new Date();
  const upcomingUserEvents = userEvents.filter((e) => new Date(e.event_date) >= now && e.status !== "cancelled");
  const pastUserEvents = userEvents.filter((e) => new Date(e.event_date) < now || e.status === "cancelled");

  // Fetch badges and groups
  const [allBadges, userBadges, userGroups] = await Promise.all([
    getAllBadges(),
    getUserBadges(profile.id),
    getPublicGroupsForUser(profile.id, user?.id),
  ]);

  // Fetch follower/following counts
  const [followerCount, followingCount] = await Promise.all([
    getFollowerCount(profile.id),
    getFollowingCount(profile.id),
  ]);

  // Build completed peaks
  const completedPeaks = (summitLogs || []).flatMap((log) => {
    const peak = peakMap.get(log.peak_id);
    if (!peak) return [];
    return [
      {
        id: log.id,
        slug: peak.slug,
        name: peak.name,
        elevation: peak.elevation.toLocaleString() + "'",
        region: peak.range || "",
        completedDate: new Date(log.summit_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        weather: log.weather || "Unknown",
        rating: log.rating ?? 0,
      },
    ];
  });

  // Build watchlist display
  const watchlistPeaks = (watchlistRows || []).flatMap((row) => {
    const peak = peakMap.get(row.peak_id);
    if (!peak) return [];
    return [{
      id: row.id,
      slug: peak.slug,
      name: peak.name,
      elevation: peak.elevation.toLocaleString() + "'",
      region: peak.range || "",
      difficulty: peak.difficulty || "",
      addedDate: new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }];
  });

  // Build trip report display
  const tripReportDisplay: TripReportData[] = (tripReports || []).flatMap((report) => {
    const peak = peakMap.get(report.peak_id);
    if (!peak) return [];
    return [{
      id: report.id,
      peakSlug: peak.slug,
      peakName: peak.name,
      peakElevation: peak.elevation.toLocaleString() + "'",
      hikeDate: new Date(report.hike_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      hikeDateRaw: report.hike_date,
      startTime: report.start_time,
      endTime: report.end_time,
      totalTimeMinutes: report.total_time_minutes,
      summary: report.summary,
      narrative: report.narrative,
      difficultyRating: report.difficulty_rating,
      conditionSeverity: report.condition_severity_score,
      objectiveRisk: report.objective_risk_score,
      trailheadAccess: report.trailhead_access_rating,
      recommended: report.overall_recommendation,
      snowPresent: report.snow_present,
      sections: report.sections_json,
    }];
  });

  // Compute profile stats
  const logs = summitLogs || [];
  const uniquePeakIds = new Set(logs.map((l) => l.peak_id));
  const summitCount = uniquePeakIds.size;

  const totalElevation = logs.reduce((sum, log) => {
    const route = log.route_id ? routeMap.get(log.route_id) : null;
    return sum + (route?.elevation_gain ?? 0);
  }, 0);

  const totalMiles = logs.reduce((sum, log) => {
    const route = log.route_id ? routeMap.get(log.route_id) : null;
    return sum + (route?.distance ?? 0);
  }, 0);

  const uniqueDates = new Set(logs.map((l) => l.summit_date));
  const daysOnTrail = uniqueDates.size;
  const peaksRemaining = TOTAL_14ERS - summitCount;
  const percentComplete = Math.round((summitCount / TOTAL_14ERS) * 1000) / 10;
  const tripReportCount = (tripReports || []).length;

  const profileStats = {
    summits: summitCount,
    totalElevation: totalElevation.toLocaleString(),
    totalMiles: totalMiles % 1 === 0 ? totalMiles.toString() : totalMiles.toFixed(1),
    daysOnTrail,
    peaksRemaining,
    percentComplete,
    tripReports: tripReportCount,
    followers: followerCount,
    following: followingCount,
  };

  // Display values
  const displayName = profile.full_name || profile.screen_name || "Hiker";
  const screenName = profile.screen_name ? `@${profile.screen_name}` : "";
  const userLocation = profile.location || null;
  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount as number}
        peaks={navPeaks}
      />

      {/* Profile Header */}
      <div className="pt-24">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <Image src="/hero.png" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-page)] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[var(--color-brand-primary)]/20" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-16 relative z-10">
          <div className="bg-white rounded-3xl border border-[var(--color-border-app)] shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 md:gap-6">
                {/* Avatar and user info row */}
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 flex-1 w-full sm:w-auto min-w-0">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] border-4 border-white flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
                      {initials}
                    </div>
                    {summitCount >= 5 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-brand-highlight)] rounded-full flex items-center justify-center border-2 border-white">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Username and details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h1
                      className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {displayName}
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {screenName}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)] flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {userLocation && (
                        <>
                          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                          <span>{userLocation}</span>
                          {joinDate && (
                            <span className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)]/40 hidden sm:block" />
                          )}
                        </>
                      )}
                      {joinDate && (
                        <>
                          <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                          <span>Joined {joinDate}</span>
                        </>
                      )}
                    </p>
                    {profile.bio && (
                      <p className="mt-3 text-sm text-[var(--color-text-primary)] max-w-xl">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
                  {isOwnProfile ? (
                    <Link
                      href="/profile"
                      className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-[var(--color-brand-primary)] border-2 border-[var(--color-border-app-strong)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-all flex items-center justify-center gap-2"
                    >
                      <EditIcon className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  ) : (
                    <FollowButton
                      targetUserId={profile.id}
                      targetUsername={username}
                      initialStatus={followStatus}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            {canViewStats && (
              <div className="mt-4 pt-4 px-6 md:px-8 pb-6 md:pb-8 border-t border-[var(--color-border-app)]">
                <div className="grid grid-cols-2 md:grid-cols-8 gap-6">
                  <StatItem label="Summits" value={profileStats.summits.toString()} suffix="/58" />
                  <StatItem label="Elevation Gained" value={profileStats.totalElevation} suffix=" ft" />
                  <StatItem label="Miles Hiked" value={profileStats.totalMiles} suffix=" mi" />
                  <StatItem label="Days on Trail" value={profileStats.daysOnTrail.toString()} />
                  <StatItem label="Trip Reports" value={profileStats.tripReports.toString()} />
                  <StatItem label="Followers" value={profileStats.followers.toString()} />
                  <StatItem label="Following" value={profileStats.following.toString()} />
                  <div className="col-span-2 md:col-span-1 text-center md:text-left">
                    <p className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-1">
                      Progress
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-highlight)] rounded-full transition-all duration-500"
                          style={{ width: `${profileStats.percentComplete}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[var(--color-brand-primary)]">
                        {profileStats.percentComplete}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Badges Section */}
        {canViewBadges && userBadges.length > 0 && (
          <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border-app)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-xl font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Achievements
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {userBadges.length} badge{userBadges.length !== 1 ? "s" : ""} earned
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <BadgeGrid
                allBadges={allBadges}
                earnedBadges={userBadges}
                size="md"
                columns={6}
                maxDisplay={12}
              />
            </div>
          </section>
        )}

        {/* Groups Section */}
        {canViewGroups && userGroups.length > 0 && (
          <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border-app)]">
              <h2
                className="text-xl font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Groups
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {userGroups.length} group{userGroups.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {userGroups.map((group) => {
                  const label = CATEGORY_LABELS[group.category] ?? group.category;
                  return (
                    <Link
                      key={group.id}
                      href={`/groups/${group.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-app)] hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-surface-subtle)] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {group.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                          {group.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {label} · {group.member_count} {group.member_count === 1 ? "member" : "members"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Wishlist Section */}
        {canViewWishlist && watchlistPeaks.length > 0 && (
          <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border-app)]">
              <h2
                className="text-xl font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Peak Wishlist
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {watchlistPeaks.length} peak{watchlistPeaks.length !== 1 ? "s" : ""} on the list
              </p>
            </div>
            <div className="divide-y divide-[var(--color-border-app)]">
              {watchlistPeaks.map((peak) => (
                <div
                  key={peak.id}
                  className="p-4 sm:p-5 hover:bg-[var(--color-surface-subtle)]/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-surface-subtle)] to-[var(--color-border-app-strong)] flex items-center justify-center flex-shrink-0">
                      <MountainIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/peaks/${peak.slug}`}
                          className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors hover:underline"
                        >
                          {peak.name}
                        </Link>
                        {peak.difficulty && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                            {peak.difficulty}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[var(--color-text-secondary)]">
                        <span className="font-mono text-[var(--color-brand-primary)]">{peak.elevation}</span>
                        <span>{peak.region}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">
                      Added {peak.addedDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Summit History Section */}
        {canViewSummitHistory && (
          <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border-app)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-xl font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Summit History
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {completedPeaks.length} peak{completedPeaks.length !== 1 ? "s" : ""} conquered
                  </p>
                </div>
              </div>
            </div>

            {completedPeaks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-surface-subtle)] flex items-center justify-center mb-4">
                  <MountainIcon className="w-8 h-8 text-[var(--color-text-secondary)]" />
                </div>
                <p className="text-[var(--color-text-secondary)]">No summits logged yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {completedPeaks.map((peak, index) => (
                  <article
                    key={peak.id}
                    className="group card-hover bg-[var(--color-surface-subtle)]/30 rounded-2xl overflow-hidden border border-[var(--color-border-app)] animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-36 overflow-hidden">
                      <Image
                        src="/hero.png"
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < peak.rating
                                  ? "text-[var(--color-amber-glow)]"
                                  : "text-white/30"
                              }`}
                              filled={i < peak.rating}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-medium text-white flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Summited
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <Link
                        href={`/peaks/${peak.slug}`}
                        className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors hover:underline"
                      >
                        {peak.name}
                      </Link>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        <span className="font-mono text-[var(--color-brand-primary)]">
                          {peak.elevation}
                        </span>
                        <span className="mx-2">•</span>
                        {peak.region}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-app)]">
                        <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {peak.completedDate}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                          <CloudIcon className="w-3.5 h-3.5" />
                          {peak.weather}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {completedPeaks.length > 0 && (
              <div className="p-4 bg-[var(--color-surface-subtle)]/30 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Showing all{" "}
                  <span className="font-semibold">{completedPeaks.length}</span>{" "}
                  summit{completedPeaks.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Trip Reports Section */}
        {canViewTripReports && tripReportDisplay.length > 0 && (
          <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border-app)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-xl font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Trip Reports
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {tripReportDisplay.length} report{tripReportDisplay.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
            <TripReportsList reports={tripReportDisplay} />
          </section>
        )}

        {/* Events Section */}
        {canViewEvents && userEvents.length > 0 && (
          <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border-app)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-xl font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Events
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {userEvents.length} event{userEvents.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href="/events"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-brand-primary)]/20"
                >
                  Browse Events
                </Link>
              </div>
            </div>
            <div className="divide-y divide-[var(--color-border-app)]">
              {upcomingUserEvents.length > 0 && (
                <>
                  <div className="px-4 sm:px-6 py-2.5 bg-[var(--color-surface-subtle)]/60">
                    <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">
                      Upcoming · {upcomingUserEvents.length}
                    </span>
                  </div>
                  {upcomingUserEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </>
              )}
              {pastUserEvents.length > 0 && (
                <>
                  <div className="px-4 sm:px-6 py-2.5 bg-[var(--color-surface-subtle)]/60">
                    <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">
                      Past · {pastUserEvents.length}
                    </span>
                  </div>
                  {pastUserEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </>
              )}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Components
function StatItem({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="text-center md:text-left">
      <p className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
        {value}
        {suffix && (
          <span className="text-sm font-normal text-[var(--color-text-secondary)]">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

function EventRow({
  event,
}: {
  event: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    status: string;
    peak_name: string | null;
    role: "hosting" | "going";
  };
}) {
  const date = new Date(event.event_date);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = String(date.getDate());
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const isCancelled = event.status === "cancelled";
  const isPast = date < new Date() && !isCancelled;

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-4 p-4 sm:p-5 hover:bg-[var(--color-surface-subtle)]/50 transition-colors group"
    >
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isCancelled ? "bg-red-50" : isPast ? "bg-[var(--color-surface-subtle)]" : "bg-[var(--color-brand-primary)]/10"}`}>
        <span className={`text-xs font-bold ${isCancelled ? "text-red-500" : isPast ? "text-[var(--color-text-secondary)]" : "text-[var(--color-brand-primary)]"}`}>
          {month}
        </span>
        <span className={`text-sm font-bold ${isCancelled ? "text-red-500" : isPast ? "text-[var(--color-text-secondary)]" : "text-[var(--color-brand-primary)]"}`}>
          {day}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-semibold text-sm group-hover:text-[var(--color-brand-primary)] transition-colors truncate ${isCancelled ? "line-through text-[var(--color-text-secondary)]" : "text-[var(--color-text-primary)]"}`}>
            {event.title}
          </p>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
            event.role === "hosting"
              ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]"
              : "bg-[var(--color-brand-highlight)]/10 text-[var(--color-brand-highlight)]"
          }`}>
            {event.role === "hosting" ? "Hosting" : "Going"}
          </span>
          {isCancelled && (
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
              Cancelled
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
          {time} · {event.location}
          {event.peak_name && <span> · {event.peak_name}</span>}
        </p>
      </div>
      <ArrowRightIcon className="w-4 h-4 text-[var(--color-text-muted-green)] group-hover:translate-x-1 transition-transform flex-shrink-0" />
    </Link>
  );
}

// Icons
function MountainIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-4 h-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}


function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function StarIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
