import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPeakBySlug } from "@/lib/peaks";
import { getForecastByPeakSlug } from "@/lib/forecasts";
import { createClient } from "@/lib/supabase/server";
import type { Route, AdjustedHour, PeakForecast } from "@/lib/database.types";
import UserNav from "../../components/UserNav";
import MobileNav from "../../components/MobileNav";
import WatchButton from "./WatchButton";
import TripReportButton from "./TripReportButton";
import LogSummitButton from "../../components/LogSummitButton";

export default async function PeakProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch peak data from database
  const peak = await getPeakBySlug(slug);

  if (!peak) {
    notFound();
  }

  // Get auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let isWatched = false;
  if (user) {
    const [{ data: profile }, { data: watchRow }] = await Promise.all([
      supabase
        .from("profiles")
        .select("screen_name, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("peak_watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("peak_id", peak.id)
        .maybeSingle(),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    isWatched = !!watchRow;
  }

  // The rest of the page uses `peak` (already checked above)
  if (!peak) {
    notFound();
  }

  // Fetch real forecast data
  const forecast = await getForecastByPeakSlug(slug);

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
                <NavLink href="/profile">Profile</NavLink>
              </div>

              <div className="flex items-center gap-2">
                <UserNav user={userNav} />
                <MobileNav user={userNav} />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section with Peak Image */}
        <section className="relative min-h-[70vh] flex items-end pb-16 pt-32">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/hero.png"
              alt={peak.name}
              fill
              priority
              className="object-cover"
            />
            {/* Stronger gradient overlays for better readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-page)] via-[var(--color-page)]/60 to-[var(--color-brand-primary)]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-primary)]/50 via-[var(--color-brand-primary)]/20 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
            {/* Breadcrumb */}
            <div className="animate-fade-up mb-6">
              <div className="inline-flex items-center gap-2 text-sm bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                <Link
                  href="/"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="w-4 h-4 text-white/60" />
                <Link
                  href="/peaks"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Peaks
                </Link>
                <ChevronRight className="w-4 h-4 text-white/60" />
                <span className="text-white font-medium">{peak.name}</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-end">
              {/* Left: Peak Title & Info */}
              <div>
                <div className="animate-fade-up flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-[var(--color-brand-primary)] tracking-wider uppercase border border-white shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-highlight)]" />
                    Rank #{peak.rank}
                  </span>
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-emerald-500 backdrop-blur-sm text-xs font-semibold text-white border border-emerald-400 shadow-lg">
                    {peak.difficulty ?? "Unknown"}
                  </span>
                </div>

                <h1 className="animate-fade-up delay-100">
                  <span
                    className="block text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tight"
                    style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 20px rgba(0,0,0,0.5), 0 4px 40px rgba(0,0,0,0.3)" }}
                  >
                    {peak.name}
                  </span>
                </h1>

                <div className="animate-fade-up delay-200 mt-6 flex flex-wrap items-center gap-6 text-white" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{peak.range ?? "Unknown Range"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TreesIcon className="w-5 h-5" />
                    <span>{peak.forest ?? "Unknown Forest"}</span>
                  </div>
                </div>
              </div>

              {/* Right: Elevation Card */}
              <div className="animate-fade-up delay-300">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-2xl">
                  <div className="text-center">
                    <p className="text-sm text-[var(--color-text-muted-green)] font-medium tracking-wider uppercase mb-2">
                      Summit Elevation
                    </p>
                    <p
                      className="text-6xl sm:text-7xl font-bold text-[var(--color-brand-primary)] tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {peak.elevation.toLocaleString()}
                      <span className="text-3xl text-[var(--color-text-secondary)]">&apos;</span>
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                      {(peak.elevation * 0.3048).toFixed(0)} meters
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[var(--color-border-app)]">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
                        {(peak.prominence ?? 0).toLocaleString()}&apos;
                      </p>
                      <p className="text-xs text-[var(--color-text-muted-green)] mt-1">Prominence</p>
                    </div>
                    <div className="text-center border-x border-[var(--color-border-app)]">
                      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
                        {(peak.completions ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted-green)] mt-1">Summits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
                        {peak.routes.length}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted-green)] mt-1">Routes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-12 relative">
          <div className="absolute inset-0 topo-pattern opacity-30" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description Card */}
                <div className="animate-fade-up bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
                  <h2
                    className="text-2xl font-bold text-[var(--color-brand-primary)] mb-4"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Overview
                  </h2>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {peak.description ?? "No description available."}
                  </p>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[var(--color-border-app)]">
                    <QuickStat
                      icon={<UsersIcon className="w-5 h-5" />}
                      label="Completions"
                      value={(peak.completions ?? 0).toLocaleString()}
                    />
                    <QuickStat
                      icon={<DocumentIcon className="w-5 h-5" />}
                      label="Recent Reports"
                      value={`${peak.recent_trip_reports ?? 0} this week`}
                    />
                    <QuickStat
                      icon={<SignalIcon className="w-5 h-5" />}
                      label="Cell Reception"
                      value={peak.cell_reception ?? "Unknown"}
                    />
                    <QuickStat
                      icon={<BuildingIcon className="w-5 h-5" />}
                      label="County"
                      value={peak.county ?? "Unknown"}
                    />
                  </div>
                </div>

                {/* Weather Section */}
                <WeatherSection forecast={forecast} />

                {/* Routes Section */}
                <div className="animate-fade-up delay-200 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2
                      className="text-2xl font-bold text-[var(--color-brand-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Routes
                    </h2>
                    <span className="text-sm text-[var(--color-text-muted-green)]">
                      {peak.routes.length} routes available
                    </span>
                  </div>

                  <div className="space-y-4">
                    {peak.routes.map((route, i) => (
                      <RouteCard key={route.name} route={route} index={i} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Location Card */}
                <div className="animate-fade-up delay-100 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] overflow-hidden">
                  {/* Map Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)]">
                    <div className="absolute inset-0 topo-pattern opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPinIcon className="w-10 h-10 text-white/80 mx-auto mb-2" />
                        <p className="text-white/70 text-sm font-medium">
                          Interactive Map
                        </p>
                      </div>
                    </div>
                    {/* Map pin marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl animate-float">
                        <div className="w-4 h-4 bg-[var(--color-brand-primary)] rounded-full" />
                      </div>
                      <div className="w-2 h-2 bg-white/50 rounded-full mx-auto mt-1" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">
                      Coordinates
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          Latitude
                        </span>
                        <span className="font-mono text-sm font-medium text-[var(--color-brand-primary)]">
                          {peak.latitude?.toFixed(4) ?? "N/A"}° N
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          Longitude
                        </span>
                        <span className="font-mono text-sm font-medium text-[var(--color-brand-primary)]">
                          {peak.longitude ? Math.abs(peak.longitude).toFixed(4) : "N/A"}° W
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--color-border-app)]">
                      <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">
                        Nearby Towns
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(peak.nearby_towns ?? []).map((town) => (
                          <span
                            key={town}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
                          >
                            {town}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="animate-fade-up delay-200 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-6">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <LogSummitButton
                      peakId={peak.id}
                      peakName={peak.name}
                      routes={peak.routes}
                      isLoggedIn={!!user}
                      className="w-full group relative bg-[var(--color-brand-primary)] text-white px-6 py-4 rounded-2xl font-semibold text-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/20"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        Log Summit
                      </span>
                      <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </LogSummitButton>
                    <WatchButton peakId={peak.id} initialWatched={isWatched} isLoggedIn={!!user} />
                    <TripReportButton peakId={peak.id} peakName={peak.name} routes={peak.routes} isLoggedIn={!!user} />
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[var(--color-text-secondary)] border-2 border-[var(--color-border-app-strong)] bg-white hover:bg-[var(--color-surface-subtle)] transition-all">
                      <ShareIcon className="w-5 h-5" />
                      Share Peak
                    </button>
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div className="animate-fade-up delay-300 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 grain-overlay" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <TrendingUpIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Trending</p>
                        <p className="text-xs text-white/70">This week</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">
                          Summit Attempts
                        </span>
                        <span className="font-bold">127</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">
                          Successful Summits
                        </span>
                        <span className="font-bold">119</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">
                          Trip Reports
                        </span>
                        <span className="font-bold">
                          {(peak.recent_trip_reports ?? 0)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50 flex items-center justify-center text-xs font-medium"
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-xs font-medium">
                          +12
                        </div>
                      </div>
                      <p className="text-xs text-white/60 mt-2">
                        Recently summited by 17 hikers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="relative bg-[var(--color-stone-light)] rounded-[2.5rem] p-12 lg:p-16 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10">
                <svg
                  viewBox="0 0 1200 200"
                  fill="var(--color-brand-primary)"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <path d="M0,200 L0,120 L200,60 L400,100 L500,40 L700,80 L900,20 L1100,70 L1200,50 L1200,200 Z" />
                </svg>
              </div>

              <div className="relative text-center">
                <h2
                  className="text-3xl lg:text-5xl font-bold text-[var(--color-brand-primary)] tracking-tight mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Ready to summit {peak.name}?
                </h2>
                <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8 leading-relaxed">
                  Create a free account to track your progress, connect with
                  other hikers, and access detailed route information.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="group relative bg-[var(--color-brand-primary)] text-white px-8 py-4 rounded-2xl font-semibold text-base overflow-hidden transition-all hover:shadow-2xl hover:shadow-[var(--color-brand-primary)]/30">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                  <Link
                    href="/peaks"
                    className="px-8 py-4 rounded-2xl font-semibold text-base text-[var(--color-text-secondary)] border-2 border-[var(--color-stone-warm)] hover:border-[var(--color-brand-primary)]/20 hover:bg-white/50 transition-all text-center"
                  >
                    Explore All Peaks
                  </Link>
                </div>
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

// Weather Section Component
function WeatherSection({ forecast }: { forecast: PeakForecast | null }) {
  if (!forecast) {
    return (
      <div className="animate-fade-up delay-100 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
        <h2
          className="text-2xl font-bold text-[var(--color-brand-primary)] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Summit Weather
        </h2>
        <div className="bg-[var(--color-surface-subtle)] rounded-2xl p-8 text-center">
          <CloudIcon className="w-12 h-12 text-[var(--color-text-muted-green)] mx-auto mb-3" />
          <p className="text-[var(--color-text-secondary)] font-medium">
            Weather data loading...
          </p>
          <p className="text-sm text-[var(--color-text-muted-green)] mt-1">
            Forecast will be available shortly
          </p>
        </div>
      </div>
    );
  }

  const adjustedHours = (forecast.adjusted_forecast ?? []) as AdjustedHour[];
  const currentHour = adjustedHours[0];
  const riskLevel = forecast.risk_level ?? "UNKNOWN";
  const riskScore = forecast.risk_score ?? 0;
  const summitWindow = forecast.summit_window;
  const conditionFlags = forecast.condition_flags;

  // Build 7-day forecast from raw data
  const rawForecast = forecast.raw_forecast as { daily?: { dt: number; temp: { max: number; min: number }; weather: { id: number; main: string; description: string }[] }[] } | null;
  const dailyForecast = rawForecast?.daily?.slice(0, 7) ?? [];

  // Calculate time ago
  const updatedAt = forecast.updated_at ? new Date(forecast.updated_at) : null;
  const timeAgo = updatedAt ? getTimeAgo(updatedAt) : "Unknown";

  const riskColors: Record<string, string> = {
    LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
    MODERATE: "bg-amber-100 text-amber-700 border-amber-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    EXTREME: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const riskBgColors: Record<string, string> = {
    LOW: "bg-emerald-500",
    MODERATE: "bg-amber-500",
    HIGH: "bg-orange-500",
    EXTREME: "bg-rose-500",
  };

  return (
    <div className="animate-fade-up delay-100 bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2
            className="text-2xl font-bold text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Summit Weather
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${riskColors[riskLevel] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
          >
            <span className={`w-2 h-2 rounded-full ${riskBgColors[riskLevel] ?? "bg-gray-500"}`} />
            {riskLevel} RISK
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-muted-green)] font-medium">
          Updated {timeAgo}
        </span>
      </div>

      {/* Current Weather */}
      {currentHour && (
        <div className="bg-gradient-to-br from-[var(--color-surface-subtle)] to-[var(--color-border-app)]/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <WeatherIconForId weatherId={currentHour.weather_id} className="w-12 h-12 text-[var(--color-amber-glow)]" />
              </div>
              <div>
                <p className="text-5xl font-bold text-[var(--color-brand-primary)]">
                  {Math.round(currentHour.temp)}°
                  <span className="text-2xl text-[var(--color-text-secondary)]">
                    F
                  </span>
                </p>
                <p className="text-[var(--color-text-secondary)] font-medium capitalize">
                  {currentHour.weather_description}
                </p>
                {currentHour.wind_chill < currentHour.temp - 5 && (
                  <p className="text-xs text-[var(--color-text-muted-green)] mt-1">
                    Feels like {Math.round(currentHour.wind_chill)}°F
                  </p>
                )}
              </div>
            </div>

            <div className="hidden sm:grid grid-cols-3 gap-6">
              <WeatherDetail
                icon={<WindIcon className="w-5 h-5" />}
                label="Wind"
                value={`${Math.round(currentHour.wind_speed)} mph`}
              />
              <WeatherDetail
                icon={<DropletIcon className="w-5 h-5" />}
                label="Humidity"
                value={`${currentHour.humidity}%`}
              />
              <WeatherDetail
                icon={<EyeIcon className="w-5 h-5" />}
                label="Gusts"
                value={`${Math.round(currentHour.wind_gust)} mph`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summit Window & Risk Info */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Summit Window */}
        <div className="bg-[var(--color-surface-subtle)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-wider uppercase">
              Summit Window
            </h3>
          </div>
          {summitWindow?.best_hour ? (
            <div>
              <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
                {formatTime(summitWindow.best_hour)}
              </p>
              <p className="text-xs text-[var(--color-text-muted-green)] mt-1">
                Best summit time (score: {summitWindow.best_score}/100)
              </p>
              {summitWindow.morning_average !== null && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Morning avg: {summitWindow.morning_average}/100
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)]">
              No summit window data available
            </p>
          )}
        </div>

        {/* Risk Score */}
        <div className="bg-[var(--color-surface-subtle)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-wider uppercase">
              Risk Assessment
            </h3>
          </div>
          <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
            {riskScore}/100
          </p>
          <div className="w-full bg-[var(--color-border-app)] rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${riskBgColors[riskLevel] ?? "bg-gray-500"}`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Condition Flags */}
      {conditionFlags && (
        <div className="flex flex-wrap gap-2 mb-6">
          {conditionFlags.windRisk && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
              <WindIcon className="w-3.5 h-3.5" /> Wind Risk
            </span>
          )}
          {conditionFlags.thunderstormRisk && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <BoltIcon className="w-3.5 h-3.5" /> Thunderstorm Risk
            </span>
          )}
          {conditionFlags.snowRisk && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <SnowIcon className="w-3.5 h-3.5" /> Snow Risk
            </span>
          )}
          {conditionFlags.whiteoutRisk && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
              <CloudIcon className="w-3.5 h-3.5" /> Whiteout Risk
            </span>
          )}
          {conditionFlags.extremeColdRisk && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
              <ThermometerIcon className="w-3.5 h-3.5" /> Extreme Cold
            </span>
          )}
        </div>
      )}

      {/* 7-Day Forecast */}
      {dailyForecast.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 tracking-wider uppercase">
            7-Day Forecast
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {dailyForecast.map((day, i) => {
              const date = new Date(day.dt * 1000);
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
              const weatherId = day.weather?.[0]?.id ?? 800;
              const condition = weatherIdToCondition(weatherId);
              // Elevation-adjust daily temps using the same lapse rate
              const elevDiff = (adjustedHours[0]?.temp ?? day.temp.max) - day.temp.max;
              const adjustedHigh = Math.round(day.temp.max + elevDiff);
              const adjustedLow = Math.round(day.temp.min + elevDiff);
              return (
                <ForecastDay
                  key={day.dt}
                  day={dayName}
                  high={adjustedHigh}
                  low={adjustedLow}
                  condition={condition}
                  isToday={i === 0}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Denver",
  });
}

function weatherIdToCondition(id: number): string {
  if (id >= 200 && id < 300) return "snow"; // thunderstorm - show as severe
  if (id >= 300 && id < 400) return "cloudy"; // drizzle
  if (id >= 500 && id < 600) return "cloudy"; // rain
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "cloudy"; // atmosphere
  if (id === 800) return "sunny";
  if (id === 801 || id === 802) return "partly-cloudy";
  return "cloudy";
}

function WeatherIconForId({ weatherId, className }: { weatherId: number; className?: string }) {
  const condition = weatherIdToCondition(weatherId);
  const icons: Record<string, React.FC<{ className?: string }>> = {
    sunny: SunIcon,
    "partly-cloudy": SunCloudIcon,
    cloudy: CloudIcon,
    snow: SnowIcon,
  };
  const Icon = icons[condition] || SunCloudIcon;
  return <Icon className={className} />;
}

// Components
function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
        active
          ? "bg-[var(--color-surface-subtle)] text-[var(--color-brand-primary)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]"
      }`}
    >
      {children}
    </Link>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-subtle)] flex items-center justify-center text-[var(--color-brand-primary)]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-muted-green)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function WeatherDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[var(--color-brand-primary)] mb-1">{icon}</div>
      <p className="text-xs text-[var(--color-text-muted-green)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function ForecastDay({
  day,
  high,
  low,
  condition,
  isToday,
}: {
  day: string;
  high: number;
  low: number;
  condition: string;
  isToday: boolean;
}) {
  const WeatherIcon = {
    sunny: SunIcon,
    "partly-cloudy": SunCloudIcon,
    cloudy: CloudIcon,
    snow: SnowIcon,
  }[condition] || SunIcon;

  return (
    <div
      className={`text-center p-3 rounded-2xl transition-all ${
        isToday
          ? "bg-[var(--color-brand-primary)] text-white"
          : "bg-[var(--color-surface-subtle)] hover:bg-[var(--color-border-app-strong)]"
      }`}
    >
      <p
        className={`text-xs font-semibold mb-2 ${isToday ? "text-white/80" : "text-[var(--color-text-muted-green)]"}`}
      >
        {isToday ? "Today" : day}
      </p>
      <WeatherIcon
        className={`w-6 h-6 mx-auto mb-2 ${isToday ? "text-white" : "text-[var(--color-amber-glow)]"}`}
      />
      <p
        className={`text-sm font-bold ${isToday ? "text-white" : "text-[var(--color-text-primary)]"}`}
      >
        {high}°
      </p>
      <p
        className={`text-xs ${isToday ? "text-white/60" : "text-[var(--color-text-secondary)]"}`}
      >
        {low}°
      </p>
    </div>
  );
}

function RouteCard({
  route,
  index,
}: {
  route: Route;
  index: number;
}) {
  const difficultyColors = {
    "Class 1": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Class 2": "bg-sky-100 text-sky-700 border-sky-200",
    "Class 3": "bg-amber-100 text-amber-700 border-amber-200",
    "Class 4": "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div className="group p-5 rounded-2xl border border-[var(--color-border-app)] hover:border-[var(--color-brand-primary)]/30 hover:bg-[var(--color-surface-subtle)]/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center text-sm font-bold text-[var(--color-brand-primary)]">
            {index + 1}
          </span>
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
              {route.name}
            </h4>
            <p className="text-xs text-[var(--color-text-muted-green)]">
              {route.trailhead ?? "Unknown trailhead"}
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${difficultyColors[(route.difficulty ?? "Class 1") as keyof typeof difficultyColors] ?? difficultyColors["Class 1"]}`}
        >
          {route.difficulty ?? "Unknown"}
        </span>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
        {route.description ?? "No description available."}
      </p>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <RouteIcon className="w-4 h-4 text-[var(--color-text-muted-green)]" />
          <span className="text-[var(--color-text-secondary)]">
            {route.distance ?? 0} mi
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MountainIcon className="w-4 h-4 text-[var(--color-text-muted-green)]" />
          <span className="text-[var(--color-text-secondary)]">
            {(route.elevation_gain ?? 0).toLocaleString()}&apos; gain
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ClockIcon className="w-4 h-4 text-[var(--color-text-muted-green)]" />
          <span className="text-[var(--color-text-secondary)]">
            {route.estimated_time ?? "Unknown"}
          </span>
        </div>
      </div>
    </div>
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

function ArrowRight({ className }: { className?: string }) {
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
        d="M13 7l5 5-5 5M6 12h12"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TreesIcon({ className }: { className?: string }) {
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
        d="M17 20V10m0 0l4 4m-4-4l-4 4m-2 6V8m0 0l4 4m-4-4L7 12m-2 8V6m0 0l4 4M5 6L1 10"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
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
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function SignalIcon({ className }: { className?: string }) {
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
        d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.981 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.789M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
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
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function SunCloudIcon({ className }: { className?: string }) {
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
        d="M2 15a4 4 0 004 4h10a5 5 0 100-10 6 6 0 00-11.8 2H6a4 4 0 00-4 4z"
      />
      <circle cx="18" cy="6" r="3" />
      <path strokeLinecap="round" d="M18 1v1m0 8v1m5-5h-1m-8 0h-1m7-3.5l-.7.7m-5.6 5.6l-.7.7m7 0l-.7-.7M13.7 3.2l-.7.7" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="5" />
      <path
        strokeLinecap="round"
        d="M12 1v2m0 18v2m11-11h-2M3 12H1m18.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93"
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
        d="M2 15a4 4 0 004 4h12a5 5 0 100-10 6 6 0 00-11.8 2H6a4 4 0 00-4 4z"
      />
    </svg>
  );
}

function SnowIcon({ className }: { className?: string }) {
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
        d="M2 12a4 4 0 004 4h12a5 5 0 100-10 6 6 0 00-11.8 2H6a4 4 0 00-4 4z"
      />
      <path strokeLinecap="round" d="M8 19v2m4-2v2m4-2v2" />
    </svg>
  );
}

function WindIcon({ className }: { className?: string }) {
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
        d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"
      />
    </svg>
  );
}

function DropletIcon({ className }: { className?: string }) {
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
        d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
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
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path strokeLinecap="round" d="M8.59 13.51l6.83 3.98m0-10.98l-6.83 3.98" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
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
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

function RouteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="6" cy="19" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15"
      />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
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
        d="M4 20l5-10 4 5 3-6 4 11H4z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function ThermometerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  );
}
