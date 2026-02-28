import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRecentBadges } from "@/lib/badges";
import { getPosts, getUpcomingEvents, getTrendingPeaks } from "@/lib/community";
import { getUserGroupsForSidebar } from "@/lib/groups";
import { CATEGORY_COLORS } from "@/lib/groups.types";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { getBulkFollowStatuses, getFollowerCount, getFollowingCount } from "@/lib/follows";
import type { FollowStatus } from "@/lib/follows";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import CommunityFeed from "./CommunityFeed";
import PeaksWatchedPanel from "./PeaksWatchedPanel";
import SavedQuickLink from "./SavedQuickLink";
import BadgeIcon from "../components/badges/BadgeIcon";

export default async function CommunityPage() {
  // Get auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let userProfile: { full_name: string | null; screen_name: string | null; avatar_url: string | null } | null = null;
  let summitCount = 0;

  if (user) {
    const [{ data: profile }, { count }] = await Promise.all([
      supabase
        .from("profiles")
        .select("screen_name, full_name, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("summit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    userProfile = {
      full_name: profile?.full_name || null,
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    summitCount = count ?? 0;
  }

  // Fetch community posts from the database
  const feedPosts = await getPosts({ limit: 20 });

  // Fetch follow statuses for all post authors
  let followStatuses: Record<string, FollowStatus> = {};
  if (user) {
    const authorIds = [...new Set(feedPosts.map((p) => p.user_id))];
    const statusMap = await getBulkFollowStatuses(user.id, authorIds);
    followStatuses = Object.fromEntries(statusMap);
  }

  // Fetch user's peak watchlist
  let watchedPeakIds: string[] = [];
  let watchedPeaks: { peak_id: string; name: string; elevation: number; slug: string }[] = [];
  if (user) {
    const { data: watchlist } = await supabase
      .from("peak_watchlist")
      .select("peak_id, peaks(name, elevation, slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    watchedPeakIds = watchlist?.map((w) => w.peak_id) || [];
    watchedPeaks = (watchlist || []).map((w) => ({
      peak_id: w.peak_id,
      name: (w.peaks as unknown as { name: string; elevation: number; slug: string }).name,
      elevation: (w.peaks as unknown as { name: string; elevation: number; slug: string }).elevation,
      slug: (w.peaks as unknown as { name: string; elevation: number; slug: string }).slug,
    }));
  }

  // Get all peaks for the post composer dropdown
  const { data: allPeaks } = await supabase
    .from("peaks")
    .select("id, name, slug, elevation")
    .order("name");

  // Fetch saved post count for current user
  let savedPostCount = 0;
  if (user) {
    const { count } = await supabase
      .from("post_saves")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    savedPostCount = count ?? 0;
  }

  // Fetch recent badges for the community sidebar
  const recentBadges = await getRecentBadges(5);

  // Fetch upcoming events for sidebar
  const upcomingEvents = await getUpcomingEvents({ limit: 3 });

  // Fetch trending peaks from cache
  const trendingPeaks = await getTrendingPeaks(5);

  // Fetch unread notification count and friends count
  let unreadNotificationCount = 0;
  let friendsCount = 0;
  if (user) {
    const [notifCount, followers, following] = await Promise.all([
      getUnreadNotificationCount(user.id),
      getFollowerCount(user.id),
      getFollowingCount(user.id),
    ]);
    unreadNotificationCount = notifCount;
    friendsCount = followers + following;
  }

  // Fetch "My Groups" sidebar data
  let sidebarGroups: Awaited<ReturnType<typeof getUserGroupsForSidebar>> = [];
  if (user) {
    sidebarGroups = await getUserGroupsForSidebar(user.id, 5);
  }

  // Get count of events the user is attending
  let userEventCount = 0;
  if (user) {
    const { count } = await supabase
      .from("event_attendees")
      .select("*, community_events!inner(status, event_date)", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("community_events.status", "active")
      .gte("community_events.event_date", new Date().toISOString());
    userEventCount = count ?? 0;
  }

  // Derive display values for profile card
  const displayName = userProfile?.full_name || userProfile?.screen_name || user?.email?.split("@")[0] || "Hiker";
  const displayHandle = userProfile?.screen_name ? `@${userProfile.screen_name}` : user?.email ? `@${user.email.split("@")[0]}` : null;
  const avatarInitials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={(allPeaks || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, elevation: p.elevation }))}
      />

      {/* Page Header */}
      <div className="pt-28 pb-8 border-b border-[var(--color-border-app)] bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-widest uppercase">
                The Community
              </span>
              <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-[var(--color-brand-primary)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Trail Talk
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors rounded-full hover:bg-[var(--color-surface-subtle)]">
                Latest
              </button>
              <button className="px-4 py-2 text-sm font-medium text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)] rounded-full">
                Following
              </button>
              <button className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors rounded-full hover:bg-[var(--color-surface-subtle)]">
                Conditions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              {/* Profile Card */}
              {user ? (
                <div className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
                  <div className="h-20 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] relative">
                    <div className="absolute -bottom-8 left-5">
                      {userProfile?.avatar_url ? (
                        <Image
                          src={userProfile.avatar_url}
                          alt={displayName}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-2xl border-4 border-white object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] border-4 border-white flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {avatarInitials}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-12 pb-5 px-5">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">{displayName}</h3>
                    {displayHandle && (
                      <p className="text-sm text-[var(--color-text-secondary)]">{displayHandle}</p>
                    )}
                    <div className="mt-4 flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xl font-bold text-[var(--color-brand-primary)]">{summitCount}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Summits</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-[var(--color-brand-primary)]">
                          {Math.round((summitCount / 58) * 100)}%
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Complete</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-[var(--color-brand-primary)]">
                          {58 - summitCount}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Remaining</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
                  <div className="h-20 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] relative" />
                  <div className="pt-6 pb-5 px-5 text-center">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Join the Community</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      Sign in to track your summits and connect with hikers.
                    </p>
                    <Link
                      href="/auth/login"
                      className="mt-4 inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-1">
                  <SidebarLink icon={<CompassIcon />} label="Peaks Watched" count={watchedPeakIds.length} />
                  <SidebarLink icon={<UsersIcon />} label="Friends" count={friendsCount} href="/friends" />
                  <SidebarLink icon={<CalendarIcon />} label="Events" count={userEventCount} href="/events" />
                  <SidebarLink icon={<GroupsIcon />} label="Groups" href="/groups" />
                  {user ? (
                    <SavedQuickLink initialCount={savedPostCount} userId={user.id} />
                  ) : (
                    <SidebarLink icon={<BookmarkIcon />} label="Saved" count={savedPostCount} href="/community/saved" />
                  )}
                </nav>
              </div>

              {/* My Groups */}
              {user && sidebarGroups.length > 0 && (
                <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">
                      My Groups
                    </h3>
                    <Link
                      href="/groups?tab=my-groups"
                      className="text-xs font-medium text-[var(--color-brand-primary)] hover:underline"
                    >
                      See All
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {sidebarGroups.map((group) => {
                      const gradient = CATEGORY_COLORS[group.category] ?? "from-slate-500 to-slate-700";
                      const initial = group.name[0].toUpperCase();
                      return (
                        <Link
                          key={group.id}
                          href={`/groups/${group.slug}`}
                          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--color-surface-subtle)] transition-colors group"
                        >
                          {/* Avatar */}
                          <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex-shrink-0 overflow-hidden`}>
                            {group.cover_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={group.cover_image_url}
                                alt={group.name}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                {initial}
                              </span>
                            )}
                          </div>
                          {/* Name + unread dot */}
                          <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-brand-primary)] transition-colors">
                            {group.name}
                          </span>
                          {group.hasUnread && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Peaks */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Trending This Week
                </h3>
                {trendingPeaks.length > 0 ? (
                  <div className="space-y-3">
                    {trendingPeaks.map((peak) => {
                      const trendLabel = peak.trend_pct >= 0
                        ? `+${peak.trend_pct}%`
                        : `${peak.trend_pct}%`;
                      return (
                        <Link
                          key={peak.peak_id}
                          href={`/peaks/${peak.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          <span className="text-sm font-mono text-[var(--color-text-muted-green)] w-5">
                            {String(peak.rank).padStart(2, "0")}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {peak.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {peak.report_count} {peak.report_count === 1 ? "report" : "reports"}
                            </p>
                          </div>
                          <span className={`text-xs font-medium ${peak.trend_pct >= 0 ? "text-[var(--color-brand-highlight)]" : "text-[var(--color-text-secondary)]"}`}>
                            {trendLabel}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    No trip reports yet this week.
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <CommunityFeed
            posts={feedPosts}
            avatarInitials={avatarInitials}
            isLoggedIn={!!user}
            currentUserId={user?.id}
            initialWatchedPeakIds={watchedPeakIds}
            allPeaks={allPeaks || []}
            followStatuses={followStatuses}
          />

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              {/* Peaks Watched */}
              <PeaksWatchedPanel peaks={watchedPeaks} isLoggedIn={!!user} />

              {/* Recent Badges */}
              {recentBadges.length > 0 && (
                <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                    Recent Achievements
                  </h3>
                  <div className="space-y-3">
                    {recentBadges.map((badge) => {
                      const displayName =
                        badge.profiles?.screen_name || "Anonymous";
                      const earnedDate = new Date(badge.earned_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      );
                      return (
                        <div
                          key={badge.id}
                          className="flex items-center gap-3 group"
                        >
                          <BadgeIcon
                            badge={badge.badge_definitions}
                            earned={true}
                            size="sm"
                            showTooltip={false}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                              {badge.badge_definitions.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              <Link
                                href={`/u/${badge.profiles?.screen_name}`}
                                className="hover:text-[var(--color-brand-primary)] hover:underline"
                              >
                                @{displayName}
                              </Link>
                              {" "}• {earnedDate}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Upcoming Events
                </h3>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => {
                      const eventDate = new Date(event.event_date);
                      const month = eventDate.toLocaleDateString("en-US", { month: "short" });
                      const day = String(eventDate.getDate());
                      return (
                        <Link key={event.id} href={`/events/${event.id}`} className="group block">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)]/10 flex flex-col items-center justify-center">
                              <span className="text-xs font-bold text-[var(--color-brand-primary)]">
                                {month}
                              </span>
                              <span className="text-sm font-bold text-[var(--color-brand-primary)]">
                                {day}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                                {event.title}
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)]">
                                {event.location} • {event.attendee_count} going
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    No upcoming events yet.
                  </p>
                )}
                <Link
                  href="/events"
                  className="mt-4 block w-full text-center text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
                >
                  View All Events
                </Link>
              </div>

              {/* Weather Widget */}
              <div className="bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-sm font-semibold text-white/70 tracking-wider uppercase mb-3">
                  Summit Weather
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">28°</div>
                  <div className="text-sm text-white/80">
                    <p>Winds 25-35 mph</p>
                    <p>Clear skies</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/60">
                  Mt. Elbert summit forecast
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}


function SidebarLink({ icon, label, count, href }: { icon: React.ReactNode; label: string; count?: number; href?: string }) {
  const content = (
    <>
      <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
      {count !== undefined && (
        <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--color-surface-subtle)] transition-all group">
        {content}
      </Link>
    );
  }

  return (
    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--color-surface-subtle)] transition-all group">
      {content}
    </button>
  );
}

function CompassIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polygon fill="currentColor" stroke="none" points="12,6 14,12 12,18 10,12" opacity="0.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function GroupsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}


