import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllPeaks } from "@/lib/peaks";
import { getAllBadges, getUserBadges } from "@/lib/badges";
import type { Peak } from "@/lib/database.types";
import UserNav from "../components/UserNav";
import Footer from "../components/Footer";
import BadgeGrid from "../components/badges/BadgeGrid";

const TOTAL_14ERS = 58; // canonical count of Colorado 14ers

export default async function ProfilePage() {
  // Get auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch full profile for the authenticated user
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("screen_name, avatar_url, full_name, location, bio, created_at")
        .eq("id", user.id)
        .single()
        .then((res) => res)
    : { data: null };

  const userNav = user
    ? {
        email: user.email || "",
        screen_name: profile?.screen_name || null,
        avatar_url: profile?.avatar_url || null,
      }
    : null;

  // Fetch summit logs with joined route data for the authenticated user
  const { data: summitLogs } = user
    ? await supabase
        .from("summit_logs")
        .select("id, peak_id, route_id, summit_date, rating, weather, notes")
        .eq("user_id", user.id)
        .order("summit_date", { ascending: false })
    : { data: null };

  // Fetch the routes used in summit logs so we can sum distance & elevation gain
  const routeIds = (summitLogs || [])
    .map((log) => log.route_id)
    .filter((id): id is string => id !== null);

  const { data: summitRoutes } = routeIds.length > 0
    ? await supabase
        .from("routes")
        .select("id, distance, elevation_gain")
        .in("id", routeIds)
    : { data: null };

  const routeMap = new Map(
    (summitRoutes || []).map((r) => [r.id, r])
  );

  // Fetch watchlist with joined peak data
  const { data: watchlistRows } = user
    ? await supabase
        .from("peak_watchlist")
        .select("id, peak_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: null };

  // Fetch all peaks (used for the "Add to Wishlist" table and to resolve peak names)
  const allPeaks = await getAllPeaks();
  const peakMap = new Map<string, Peak>(allPeaks.map((p) => [p.id, p]));

  // Fetch badge data
  const [allBadges, userBadges] = user
    ? await Promise.all([getAllBadges(), getUserBadges(user.id)])
    : [await getAllBadges(), []];

  // Build watchlist display data
  const watchlistPeaks = (watchlistRows || []).flatMap((row) => {
    const peak = peakMap.get(row.peak_id);
    if (!peak) return [];
    return [{
      id: row.id,
      peakId: peak.id,
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

  // Build completed peaks display data from summit logs
  const completedPeaks = (summitLogs || []).flatMap((log) => {
    const peak = peakMap.get(log.peak_id);
    if (!peak) return [];
    return [{
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
    }];
  });

  // Sets for quick lookups in the "Add to Wishlist" table
  const completedPeakIds = new Set((summitLogs || []).map((l) => l.peak_id));
  const watchedPeakIds = new Set((watchlistRows || []).map((w) => w.peak_id));

  // --- Compute real profile stats ---
  const logs = summitLogs || [];

  // Summits: count of unique peaks summited
  const uniquePeakIds = new Set(logs.map((l) => l.peak_id));
  const summitCount = uniquePeakIds.size;

  // Elevation Gained: sum of elevation_gain from each log's route
  const totalElevation = logs.reduce((sum, log) => {
    const route = log.route_id ? routeMap.get(log.route_id) : null;
    return sum + (route?.elevation_gain ?? 0);
  }, 0);

  // Miles Hiked: sum of distance from each log's route
  const totalMiles = logs.reduce((sum, log) => {
    const route = log.route_id ? routeMap.get(log.route_id) : null;
    return sum + (route?.distance ?? 0);
  }, 0);

  // Days on Trail: count of unique summit dates
  const uniqueDates = new Set(logs.map((l) => l.summit_date));
  const daysOnTrail = uniqueDates.size;

  // Peaks Remaining & Progress
  const peaksRemaining = TOTAL_14ERS - summitCount;
  const percentComplete = Math.round((summitCount / TOTAL_14ERS) * 1000) / 10;

  const profileStats = {
    summits: summitCount,
    totalElevation: totalElevation.toLocaleString(),
    totalMiles: totalMiles % 1 === 0 ? totalMiles.toString() : totalMiles.toFixed(1),
    daysOnTrail,
    peaksRemaining,
    percentComplete,
  };

  // Derive display values from auth + profile data
  const displayName =
    profile?.full_name || profile?.screen_name || user?.email?.split("@")[0] || "Hiker";
  const screenName = profile?.screen_name
    ? `@${profile.screen_name}`
    : user?.email || "";
  const userLocation = profile?.location || null;
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      {/* Navigation */}
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
                <NavLink href="/community">Community</NavLink>
                <NavLink href="/peaks">Peaks</NavLink>
              </div>

              <UserNav user={userNav} />
            </div>
          </div>
        </nav>
      </header>

      {/* Profile Header */}
      <div className="pt-24">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <Image
            src="/hero.png"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-page)] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[var(--color-brand-primary)]/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 relative z-10">
          <div className="bg-white rounded-3xl border border-[var(--color-border-app)] shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-row items-center gap-4 md:gap-6">
                {/* Avatar - inline to the left of username/details */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] border-4 border-white flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-brand-highlight)] rounded-full flex items-center justify-center border-2 border-white">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Username and details - to the right of avatar */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {screenName}
                  </h1>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                    {userLocation && (
                      <>
                        <MapPinIcon className="w-4 h-4" />
                        {userLocation}
                        <span className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)]/40" />
                      </>
                    )}
                    {joinDate && (
                      <>
                        <CalendarIcon className="w-4 h-4" />
                        Joined {joinDate}
                      </>
                    )}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button className="px-5 py-2.5 text-sm font-semibold text-[var(--color-brand-primary)] border-2 border-[var(--color-border-app-strong)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-all flex items-center gap-2">
                    <EditIcon className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-brand-primary)]/20">
                    <ShareIcon className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-4 pt-4 px-6 md:px-8 pb-6 md:pb-8 border-t border-[var(--color-border-app)]">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  <StatItem label="Summits" value={profileStats.summits.toString()} suffix="/58" />
                  <StatItem label="Elevation Gained" value={profileStats.totalElevation} suffix=" ft" />
                  <StatItem label="Miles Hiked" value={profileStats.totalMiles} suffix=" mi" />
                  <StatItem label="Peaks Remaining" value={profileStats.peaksRemaining.toString()} />
                  <div className="text-center md:text-left md:col-span-2">
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
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
              <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                Quick Actions
              </h3>
              <nav className="space-y-1">
                <SidebarLink icon={<PlusIcon />} label="Log a Summit" primary />
                <SidebarLink icon={<ListIcon />} label="My Wishlist" count={watchlistPeaks.length} />
                <SidebarLink icon={<MapIcon />} label="Planned Routes" count={2} />
                <SidebarLink icon={<PhotoIcon />} label="Photo Gallery" count={47} />
                <SidebarLink icon={<TrophyIcon />} label="Achievements" count={2} />
              </nav>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">
                  Achievements
                </h3>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {userBadges.length}/{allBadges.length}
                </span>
              </div>
              <BadgeGrid
                allBadges={allBadges}
                earnedBadges={userBadges}
                size="sm"
                columns={5}
                maxDisplay={10}
              />
              {allBadges.length > 10 && (
                <Link href="/badges" className="mt-3 block w-full text-center text-xs font-medium text-[var(--color-brand-primary)] hover:underline">
                  View All Badges
                </Link>
              )}
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
              <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                Settings
              </h3>
              <nav className="space-y-1">
                <SidebarLink icon={<UserIcon />} label="Account" />
                <SidebarLink icon={<BellIcon className="w-5 h-5" />} label="Notifications" />
                <SidebarLink icon={<LockIcon />} label="Privacy" />
                <SidebarLink icon={<DownloadIcon />} label="Export Data" />
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-8">
            {/* Wishlist Section */}
            <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
              <div className="p-6 border-b border-[var(--color-border-app)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Peak Wishlist
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      Peaks you want to conquer next
                    </p>
                  </div>
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-brand-primary)]/20">
                    <PlusIcon className="w-4 h-4" />
                    Add Peak
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[var(--color-border-app)]">
                {watchlistPeaks.map((peak) => (
                  <div
                    key={peak.id}
                    className="p-5 hover:bg-[var(--color-surface-subtle)]/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-surface-subtle)] to-[var(--color-border-app-strong)] flex items-center justify-center">
                        <MountainIcon className="w-6 h-6 text-[var(--color-brand-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <Link href={`/peaks/${peak.slug}`} className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors hover:underline">
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
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all opacity-0 group-hover:opacity-100">
                          <CalendarPlusIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                        <ArrowRightIcon className="w-5 h-5 text-[var(--color-text-muted-green)] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[var(--color-surface-subtle)]/30 text-center">
                <Link href="/peaks" className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline">
                  Browse All {allPeaks.length} Peaks
                </Link>
              </div>
            </section>

            {/* Completed Peaks Section */}
            <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
              <div className="p-6 border-b border-[var(--color-border-app)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Summit History
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      Your conquered peaks
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)] rounded-lg">
                      All
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] rounded-lg transition-all">
                      2026
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] rounded-lg transition-all">
                      2025
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {completedPeaks.map((peak, index) => (
                  <article
                    key={peak.id}
                    className="group card-hover bg-[var(--color-surface-subtle)]/30 rounded-2xl overflow-hidden border border-[var(--color-border-app)] animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
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
                                i < peak.rating ? 'text-[var(--color-amber-glow)]' : 'text-white/30'
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
                      <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                        {peak.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        <span className="font-mono text-[var(--color-brand-primary)]">{peak.elevation}</span>
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

              <div className="p-4 bg-[var(--color-surface-subtle)]/30 flex items-center justify-between">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Showing <span className="font-semibold">{completedPeaks.length}</span> summits
                </p>
                <button className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline flex items-center gap-2 group">
                  View All History
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>

            {/* Peak Search Section */}
            <section className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
              <div className="p-6 border-b border-[var(--color-border-app)]">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Add to Wishlist
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Search and add peaks you want to climb
                </p>
              </div>

              <div className="p-6">
                {/* Search Input */}
                <div className="relative mb-6">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    placeholder={`Search ${allPeaks.length} peaks...`}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface-subtle)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                  />
                </div>

                {/* Quick Add Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--color-border-app)]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">Peak</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden sm:table-cell">Region</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">Elevation</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden md:table-cell">Class</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPeaks.slice(0, 8).map((peak, i) => {
                        const isCompleted = completedPeakIds.has(peak.id);
                        const isWishlisted = watchedPeakIds.has(peak.id);
                        return (
                          <tr
                            key={peak.id}
                            className="border-b border-[var(--color-border-app)] last:border-0 hover:bg-[var(--color-surface-subtle)]/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[var(--color-text-muted-green)] w-5">
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <Link href={`/peaks/${peak.slug}`} className={`font-medium hover:underline ${isCompleted ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                                  {peak.name}
                                </Link>
                                {isCompleted && (
                                  <CheckCircleIcon className="w-4 h-4 text-[var(--color-brand-highlight)]" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] hidden sm:table-cell">
                              {peak.range || ""}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-[var(--color-brand-primary)] text-sm">
                                {peak.elevation.toLocaleString()}&apos;
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                                {peak.difficulty || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isCompleted ? (
                                <span className="text-xs font-medium text-[var(--color-brand-highlight)]">
                                  Completed
                                </span>
                              ) : isWishlisted ? (
                                <span className="text-xs font-medium text-[var(--color-amber-glow)]">
                                  Watching
                                </span>
                              ) : (
                                <Link href={`/peaks/${peak.slug}`} className="px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-primary)] border border-[var(--color-border-app-strong)] rounded-lg hover:bg-[var(--color-surface-subtle)] transition-all">
                                  View
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-center">
                  <Link href="/peaks" className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline">
                    View All {allPeaks.length} Peaks
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Components
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

function StatItem({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
        {value}
        {suffix && <span className="text-sm font-normal text-[var(--color-text-secondary)]">{suffix}</span>}
      </p>
    </div>
  );
}

function SidebarLink({ icon, label, count, primary }: { icon: React.ReactNode; label: string; count?: number; primary?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
      primary
        ? 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-accent)]'
        : 'hover:bg-[var(--color-surface-subtle)]'
    }`}>
      <span className={primary ? 'text-white' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-primary)] transition-colors'}>
        {icon}
      </span>
      <span className={`flex-1 text-sm font-medium ${primary ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
        {label}
      </span>
      {count !== undefined && !primary && (
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

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0-15l-5.625 1.875A.75.75 0 003 2.625v14.25c0 .527.52.9 1.016.75L9 15.75m0-9l6 3m-6-3v9m6-6v9m0-9l4.875-1.625A.75.75 0 0021 6.375V17.25a.75.75 0 01-.516.71L15 20.25m0-9l6-2" />
    </svg>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M7.73 9.728a6.726 6.726 0 002.748 1.35m3.044 0a6.726 6.726 0 002.748-1.35m-8.592 0c-.623.134-1.27.218-1.933.254A4.492 4.492 0 013 8.25c0-1.177.45-2.247 1.188-3.052M16.27 9.728c.623.134 1.27.218 1.933.254A4.492 4.492 0 0021 8.25c0-1.177-.45-2.247-1.188-3.052" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CalendarPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}
