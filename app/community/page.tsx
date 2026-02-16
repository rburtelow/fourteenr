import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserNav from "../components/UserNav";
import CommunityFeed from "./CommunityFeed";
import PeaksWatchedPanel from "./PeaksWatchedPanel";

const feedPosts = [
  {
    id: 1,
    author: "Sarah Chen",
    handle: "@sarahsummits",
    avatar: "SC",
    timeAgo: "2h",
    content: "Just summited Mount Bierstadt this morning. The sunrise painted the entire Front Range in shades of gold and pink. Already planning my next 14er adventure.",
    image: "/hero.png",
    peak: "Mt. Bierstadt",
    peakSlug: "mt-bierstadt",
    elevation: "14,065'",
    likes: 124,
    comments: 18,
    saves: 7,
  },
  {
    id: 2,
    author: "Marcus Reid",
    handle: "@highaltitude_marcus",
    avatar: "MR",
    timeAgo: "5h",
    content: "Looking for hiking partners for Quandary Peak this Saturday. Planning an alpine start around 4am to catch sunrise from the summit. Intermediate pace, all skill levels welcome.",
    likes: 42,
    comments: 23,
    saves: 2,
  },
  {
    id: 3,
    author: "Elena Voss",
    handle: "@trail_elena",
    avatar: "EV",
    timeAgo: "1d",
    content: "Trail conditions update for Grays & Torreys: Main trail is clear to the saddle. Still some snow patches near the Torreys summit—microspikes recommended. Winds were brutal above treeline yesterday.",
    image: "/hero.png",
    peak: "Grays Peak",
    peakSlug: "grays-peak",
    elevation: "14,270'",
    likes: 89,
    comments: 31,
    saves: 15,
    isConditionReport: true,
  },
];

const trendingPeaks = [
  { name: "Quandary Peak", reports: 23, trend: "+12%" },
  { name: "Mt. Bierstadt", reports: 18, trend: "+8%" },
  { name: "Grays Peak", reports: 15, trend: "+5%" },
];

const upcomingEvents = [
  { title: "14er Sunrise Hike", date: "Feb 15", location: "Mt. Evans", attendees: 24 },
  { title: "Trail Maintenance Day", date: "Feb 22", location: "Quandary", attendees: 12 },
];


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

  // Resolve peak slugs from mock data to peak IDs, and fetch user's watchlist
  const postSlugs = feedPosts.map((p) => p.peakSlug).filter(Boolean) as string[];
  const { data: peakRows } = await supabase
    .from("peaks")
    .select("id, slug")
    .in("slug", postSlugs);
  const slugToId: Record<string, string> = {};
  for (const row of peakRows || []) {
    slugToId[row.slug] = row.id;
  }

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
      {/* Navigation - matching landing page */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="mx-4 mt-4 md:mx-8 md:mt-6">
          <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-[var(--color-border-app)]">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-[var(--color-brand-primary)] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
                  <MountainLogo className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[var(--color-brand-primary)]">
                  My14er
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/community" active>Community</NavLink>
                <NavLink href="#">Peaks</NavLink>
                <NavLink href="#">Gear</NavLink>
              </div>

              <UserNav user={userNav} />
            </div>
          </div>
        </nav>
      </header>

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
                  <SidebarLink icon={<UsersIcon />} label="Groups" count={4} />
                  <SidebarLink icon={<CalendarIcon />} label="Events" count={2} />
                  <SidebarLink icon={<BookmarkIcon />} label="Saved" count={18} />
                </nav>
              </div>

              {/* Trending Peaks */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Trending This Week
                </h3>
                <div className="space-y-3">
                  {trendingPeaks.map((peak, i) => (
                    <div key={peak.name} className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-sm font-mono text-[var(--color-text-muted-green)] w-5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                          {peak.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {peak.reports} reports
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[var(--color-brand-highlight)]">
                        {peak.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <CommunityFeed
            posts={feedPosts}
            avatarInitials={avatarInitials}
            isLoggedIn={!!user}
            slugToId={slugToId}
            initialWatchedPeakIds={watchedPeakIds}
          />

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              {/* Peaks Watched */}
              <PeaksWatchedPanel peaks={watchedPeaks} isLoggedIn={!!user} />

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Upcoming Events
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.title} className="group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)]/10 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-[var(--color-brand-primary)]">
                            {event.date.split(' ')[0]}
                          </span>
                          <span className="text-sm font-bold text-[var(--color-brand-primary)]">
                            {event.date.split(' ')[1]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {event.location} • {event.attendees} going
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full text-sm font-medium text-[var(--color-brand-primary)] hover:underline">
                  View All Events
                </button>
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
    </div>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
        active
          ? 'text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]'
      }`}
    >
      {children}
    </Link>
  );
}

function SidebarLink({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--color-surface-subtle)] transition-all group">
      <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
      {count !== undefined && (
        <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

// Icons
function MountainLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
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

