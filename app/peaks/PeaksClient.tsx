"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useRef, useCallback } from "react";
import type { PeakWithRouteCount } from "@/lib/peaks";
import { createClient } from "@/lib/supabase/client";
import UserNav from "../components/UserNav";
import MobileNav from "../components/MobileNav";
import Footer from "../components/Footer";

const regions = ["All Regions", "Sawatch Range", "Sangre de Cristo Range", "San Juan Range", "Front Range", "Elk Range", "Mosquito Range", "Tenmile Range"];
const difficulties = ["All Classes", "Class 1", "Class 2", "Class 3", "Class 4"];
const sortOptions = [
  { value: "rank", label: "Rank" },
  { value: "elevation", label: "Elevation" },
  { value: "name", label: "Name" },
  { value: "difficulty", label: "Difficulty" },
  { value: "summits", label: "Most Summited" },
];

interface ForecastBadge {
  risk_level: string | null;
  current_temp: number | null;
}

interface PeaksClientProps {
  peaks: PeakWithRouteCount[];
  userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null;
  initialWatchedPeakIds?: string[];
  forecasts?: Record<string, ForecastBadge>;
}

export default function PeaksClient({ peaks, userNav, initialWatchedPeakIds = [], forecasts = {} }: PeaksClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Classes");
  const [sortBy, setSortBy] = useState("rank");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedPeaks, setWatchedPeaks] = useState<Set<string>>(() => new Set(initialWatchedPeakIds));
  const filtersRef = useRef<HTMLDivElement>(null);

  const toggleWatchPeak = useCallback((peakId: string) => {
    if (!userNav) return; // not logged in

    const wasWatched = watchedPeaks.has(peakId);

    // Optimistic update
    setWatchedPeaks((prev) => {
      const next = new Set(prev);
      if (next.has(peakId)) {
        next.delete(peakId);
      } else {
        next.add(peakId);
      }
      return next;
    });

    // Persist to Supabase
    const supabase = createClient();
    const persist = wasWatched
      ? supabase.from("peak_watchlist").delete().eq("peak_id", peakId)
      : supabase.from("peak_watchlist").insert({ peak_id: peakId });

    persist.then(({ error }) => {
      if (error) {
        console.error("Watchlist toggle failed:", error);
        // Rollback
        setWatchedPeaks((prev) => {
          const next = new Set(prev);
          if (wasWatched) {
            next.add(peakId);
          } else {
            next.delete(peakId);
          }
          return next;
        });
      }
    });
  }, [userNav, watchedPeaks]);

  const handleRegionSelect = (regionFilter: string) => {
    setSelectedRegion(regionFilter);
    // Scroll to the filters bar with some offset for the fixed header
    filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDifficultySelect = (difficultyFilter: string) => {
    setSelectedDifficulty((prev) => (prev === difficultyFilter ? "All Classes" : difficultyFilter));
    // Keep the filter controls in view after selecting from hero stats.
    filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredAndSortedPeaks = useMemo(() => {
    let result = [...peaks];

    // Filter by region
    if (selectedRegion !== "All Regions") {
      result = result.filter((p) => p.range === selectedRegion);
    }

    // Filter by difficulty
    if (selectedDifficulty !== "All Classes") {
      result = result.filter((p) => p.difficulty === selectedDifficulty);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.range?.toLowerCase().includes(query) ?? false)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "elevation":
          return b.elevation - a.elevation;
        case "name":
          return a.name.localeCompare(b.name);
        case "difficulty":
          return (a.difficulty || "").localeCompare(b.difficulty || "");
        case "summits":
          return (b.completions || 0) - (a.completions || 0);
        default:
          return (a.rank || 99) - (b.rank || 99);
      }
    });

    return result;
  }, [peaks, selectedRegion, selectedDifficulty, sortBy, searchQuery]);

  const stats = useMemo(() => {
    const class1 = peaks.filter((p) => p.difficulty === "Class 1").length;
    const class2 = peaks.filter((p) => p.difficulty === "Class 2").length;
    const class3 = peaks.filter((p) => p.difficulty === "Class 3").length;
    const class4 = peaks.filter((p) => p.difficulty === "Class 4").length;
    return { class1, class2, class3, class4 };
  }, [peaks]);

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

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 topo-pattern opacity-50" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[var(--color-brand-primary)]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            {/* Breadcrumb */}
            <div className="animate-fade-up mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Link href="/" className="text-[var(--color-text-muted-green)] hover:text-[var(--color-brand-primary)] transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-4 h-4 text-[var(--color-text-muted-green)]" />
                <span className="text-[var(--color-text-primary)] font-medium">All Peaks</span>
              </div>
            </div>

            {/* Page Title */}
            <div className="grid lg:grid-cols-2 gap-12 items-end mb-16">
              <div>
                <span className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs font-semibold text-[var(--color-brand-primary)] tracking-wider uppercase mb-6 border border-[var(--color-border-app)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-highlight)]" />
                  The Complete Collection
                </span>
                <h1 className="animate-fade-up delay-100">
                  <span
                    className="block text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-brand-primary)] leading-[0.9] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Colorado&apos;s
                  </span>
                  <span
                    className="block text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.9] tracking-tight mt-2"
                    style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--color-text-secondary)" }}
                  >
                    {peaks.length} Fourteeners
                  </span>
                </h1>
                <p className="animate-fade-up delay-200 mt-6 text-lg text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
                  Every peak over 14,000 feet in the Centennial State. From the gentle slopes of Quandary to the knife-edge of Capitol.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="animate-fade-up delay-300 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  value={stats.class1}
                  label="Class 1"
                  color="green"
                  description="Hiking"
                  active={selectedDifficulty === "Class 1"}
                  onClick={() => handleDifficultySelect("Class 1")}
                />
                <StatCard
                  value={stats.class2}
                  label="Class 2"
                  color="blue"
                  description="Scrambling"
                  active={selectedDifficulty === "Class 2"}
                  onClick={() => handleDifficultySelect("Class 2")}
                />
                <StatCard
                  value={stats.class3}
                  label="Class 3"
                  color="amber"
                  description="Climbing"
                  active={selectedDifficulty === "Class 3"}
                  onClick={() => handleDifficultySelect("Class 3")}
                />
                <StatCard
                  value={stats.class4}
                  label="Class 4"
                  color="red"
                  description="Technical"
                  active={selectedDifficulty === "Class 4"}
                  onClick={() => handleDifficultySelect("Class 4")}
                />
              </div>
            </div>

            {/* Filters Bar */}
            <div ref={filtersRef} className="animate-fade-up delay-400 bg-white rounded-2xl shadow-lg border border-[var(--color-border-app)] p-4 mb-8 scroll-mt-28">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted-green)]" />
                  <input
                    type="text"
                    placeholder="Search peaks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-surface-subtle)] border-none text-sm placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <FilterSelect
                    value={selectedRegion}
                    onChange={setSelectedRegion}
                    options={regions}
                    icon={<MapPinIcon className="w-4 h-4" />}
                  />
                  <FilterSelect
                    value={selectedDifficulty}
                    onChange={setSelectedDifficulty}
                    options={difficulties}
                    icon={<DiamondIcon className="w-4 h-4" />}
                  />
                  <FilterSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortOptions.map((o) => o.value)}
                    labels={sortOptions.reduce((acc, o) => ({ ...acc, [o.value]: o.label }), {})}
                    icon={<SortIcon className="w-4 h-4" />}
                  />

                  {/* View Toggle */}
                  <div className="flex rounded-xl bg-[var(--color-surface-subtle)] p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "grid"
                          ? "bg-white shadow-sm text-[var(--color-brand-primary)]"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
                      }`}
                    >
                      <GridIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "list"
                          ? "bg-white shadow-sm text-[var(--color-brand-primary)]"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
                      }`}
                    >
                      <ListIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="animate-fade-up delay-500 flex items-center justify-between mb-6">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Showing <span className="font-semibold text-[var(--color-text-primary)]">{filteredAndSortedPeaks.length}</span> of{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">{peaks.length}</span> peaks
              </p>
              {(selectedRegion !== "All Regions" || selectedDifficulty !== "All Classes" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedRegion("All Regions");
                    setSelectedDifficulty("All Classes");
                    setSearchQuery("");
                  }}
                  className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Peaks Display */}
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredAndSortedPeaks.map((peak, index) => (
                  <PeakCard key={peak.id} peak={peak} index={index} watched={watchedPeaks.has(peak.id)} onToggleWatch={toggleWatchPeak} forecast={forecasts[peak.id]} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--color-border-app)]">
                        <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">
                          Rank
                        </th>
                        <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">
                          Peak
                        </th>
                        <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden sm:table-cell">
                          Region
                        </th>
                        <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">
                          Elevation
                        </th>
                        <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden md:table-cell">
                          Class
                        </th>
                        <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden lg:table-cell">
                          Summits
                        </th>
                        <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden lg:table-cell">
                          Weather
                        </th>
                        <th className="px-6 py-5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedPeaks.map((peak) => (
                        <PeakRow key={peak.id} peak={peak} watched={watchedPeaks.has(peak.id)} onToggleWatch={toggleWatchPeak} forecast={forecasts[peak.id]} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Region Overview Section */}
        <section className="mt-32 relative">
          <div className="absolute inset-0 bg-[var(--color-brand-primary)] diagonal-slice" />
          <div className="relative py-24 grain-overlay">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="text-center mb-16">
                <span className="text-xs font-semibold text-white/50 tracking-widest uppercase">
                  Explore by Range
                </span>
                <h2
                  className="mt-3 text-4xl lg:text-5xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Mountain Ranges
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <RegionCard
                  name="Sawatch Range"
                  count={15}
                  highest="Mt. Elbert (14,439')"
                  description="Home to Colorado's highest peaks, featuring gentle Class 1 & 2 routes."
                  onSelect={() => handleRegionSelect("Sawatch Range")}
                />
                <RegionCard
                  name="Sangre de Cristo Range"
                  count={10}
                  highest="Blanca Peak (14,345')"
                  description="Technical challenges and stunning isolation in southern Colorado."
                  onSelect={() => handleRegionSelect("Sangre de Cristo Range")}
                />
                <RegionCard
                  name="San Juan Range"
                  count={13}
                  highest="Uncompahgre (14,309')"
                  description="Remote wilderness peaks requiring long approaches and navigation skills."
                  onSelect={() => handleRegionSelect("San Juan Range")}
                />
                <RegionCard
                  name="Elk Range"
                  count={6}
                  highest="Castle Peak (14,265')"
                  description="Dramatic, unstable rock and the infamous Maroon Bells."
                  onSelect={() => handleRegionSelect("Elk Range")}
                />
                <RegionCard
                  name="Front Range"
                  count={6}
                  highest="Grays Peak (14,270')"
                  description="Accessible peaks close to Denver, perfect for first-timers."
                  onSelect={() => handleRegionSelect("Front Range")}
                />
                <RegionCard
                  name="Mosquito Range"
                  count={5}
                  highest="Mt. Lincoln (14,286')"
                  description="Historic mining district with 4-peak linkup opportunities."
                  onSelect={() => handleRegionSelect("Mosquito Range")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="relative bg-[var(--color-stone-light)] rounded-[2.5rem] p-12 lg:p-20 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
                <svg viewBox="0 0 1200 200" fill="var(--color-brand-primary)" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0,200 L0,120 L200,60 L400,100 L500,40 L700,80 L900,20 L1100,70 L1200,50 L1200,200 Z" />
                </svg>
              </div>

              <div className="relative text-center">
                <h2
                  className="text-4xl lg:text-6xl font-bold text-[var(--color-brand-primary)] tracking-tight mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Start tracking your summits
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
                  Create your free account and join thousands of hikers documenting their 14er journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="group relative bg-[var(--color-brand-primary)] text-white px-10 py-5 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-[var(--color-brand-primary)]/30">
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
          ? "bg-[var(--color-surface-subtle)] text-[var(--color-brand-primary)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]"
      }`}
    >
      {children}
    </Link>
  );
}

function StatCard({
  value,
  label,
  color,
  description,
  active = false,
  onClick,
}: {
  value: number;
  label: string;
  color: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-sky-50 border-sky-200 text-sky-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-rose-50 border-rose-200 text-rose-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/25 ${
        colorClasses[color as keyof typeof colorClasses]
      } ${active ? "ring-2 ring-[var(--color-brand-primary)]/35 shadow-md" : ""}`}
      aria-pressed={active}
    >
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs opacity-70">{description}</p>
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  labels,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-green)]">{icon}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-10 pr-10 py-3 rounded-xl bg-[var(--color-surface-subtle)] border-none text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels ? labels[option] || option : option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-green)] pointer-events-none" />
    </div>
  );
}

function PeakCard({ peak, index, watched, onToggleWatch, forecast }: { peak: PeakWithRouteCount; index: number; watched: boolean; onToggleWatch: (id: string) => void; forecast?: ForecastBadge }) {
  const difficultyColors = {
    "Class 1": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Class 2": "bg-sky-100 text-sky-700 border-sky-200",
    "Class 3": "bg-amber-100 text-amber-700 border-amber-200",
    "Class 4": "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <Link
      href={`/peaks/${peak.slug}`}
      className="group bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden card-hover"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      {/* Image placeholder with gradient */}
      <div className="relative h-40 bg-gradient-to-br from-[var(--color-surface-subtle)] to-[var(--color-border-app-strong)] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <MountainLogo className="w-16 h-16 text-[var(--color-brand-primary)]/20" />
        </div>
        {/* Rank badge */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-[var(--color-brand-primary)] border border-[var(--color-border-app)]">
          {peak.rank}
        </div>
        {/* Difficulty badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${difficultyColors[peak.difficulty as keyof typeof difficultyColors] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
          {peak.difficulty}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[var(--color-brand-primary)]/0 group-hover:bg-[var(--color-brand-primary)]/10 transition-colors duration-300" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
              {peak.name}
            </h3>
            <p className="text-sm text-[var(--color-text-muted-green)] mt-1">{peak.range}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWatch(peak.id);
            }}
            className={`p-2 -mr-2 -mt-1 rounded-lg transition-all ${
              watched
                ? "text-[var(--color-amber-glow)] bg-[var(--color-amber-glow)]/10"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-amber-glow)] hover:bg-[var(--color-amber-glow)]/10"
            }`}
            aria-label={watched ? `Remove ${peak.name} from watchlist` : `Save ${peak.name} to watchlist`}
          >
            <BookmarkIcon className="w-5 h-5" filled={watched} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-2xl font-bold text-[var(--color-brand-primary)] font-mono">
              {peak.elevation.toLocaleString()}&apos;
            </p>
          </div>
          <div className="text-right">
            {forecast?.current_temp !== null && forecast?.current_temp !== undefined ? (
              <div className="flex items-center justify-end gap-2 mb-0.5">
                <RiskDot level={forecast.risk_level} />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{forecast.current_temp}°F</span>
              </div>
            ) : null}
            <p className="text-xs text-[var(--color-text-secondary)]">{(peak.completions || 0).toLocaleString()} summits</p>
            <p className="text-xs text-[var(--color-text-muted-green)]">{peak.routeCount} routes</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PeakRow({ peak, watched, onToggleWatch, forecast }: { peak: PeakWithRouteCount; watched: boolean; onToggleWatch: (id: string) => void; forecast?: ForecastBadge }) {
  const difficultyColors = {
    "Class 1": "bg-emerald-100 text-emerald-700",
    "Class 2": "bg-sky-100 text-sky-700",
    "Class 3": "bg-amber-100 text-amber-700",
    "Class 4": "bg-rose-100 text-rose-700",
  };

  return (
    <tr className="border-b border-[var(--color-border-app)] last:border-0 hover:bg-[var(--color-surface-subtle)]/50 transition-colors group cursor-pointer">
      <td className="px-6 py-5">
        <span className="w-8 h-8 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center text-sm font-bold text-[var(--color-brand-primary)]">
          {peak.rank}
        </span>
      </td>
      <td className="px-6 py-5">
        <Link href={`/peaks/${peak.slug}`} className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
          {peak.name}
        </Link>
      </td>
      <td className="px-6 py-5 text-sm text-[var(--color-text-secondary)] hidden sm:table-cell">{peak.range}</td>
      <td className="px-6 py-5">
        <span className="font-mono text-[var(--color-brand-primary)] font-medium">{peak.elevation.toLocaleString()}&apos;</span>
      </td>
      <td className="px-6 py-5 hidden md:table-cell">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[peak.difficulty as keyof typeof difficultyColors] || "bg-gray-100 text-gray-700"}`}>
          {peak.difficulty}
        </span>
      </td>
      <td className="px-6 py-5 hidden lg:table-cell">
        <span className="text-sm text-[var(--color-text-secondary)]">{(peak.completions || 0).toLocaleString()}</span>
      </td>
      <td className="px-6 py-5 hidden lg:table-cell">
        {forecast?.current_temp !== null && forecast?.current_temp !== undefined ? (
          <div className="flex items-center gap-2">
            <RiskDot level={forecast.risk_level} />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{forecast.current_temp}°F</span>
          </div>
        ) : (
          <span className="text-sm text-[var(--color-text-muted-green)]">--</span>
        )}
      </td>
      <td className="px-6 py-5 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatch(peak.id);
          }}
          className={`p-2 rounded-lg transition-all ${
            watched
              ? "text-[var(--color-amber-glow)] bg-[var(--color-amber-glow)]/10"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-amber-glow)] hover:bg-[var(--color-amber-glow)]/10"
          }`}
          aria-label={watched ? `Remove ${peak.name} from watchlist` : `Save ${peak.name} to watchlist`}
        >
          <BookmarkIcon className="w-5 h-5" filled={watched} />
        </button>
      </td>
    </tr>
  );
}

function RegionCard({ name, count, highest, description, onSelect }: { name: string; count: number; highest: string; description: string; onSelect?: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group text-left bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/20 hover:border-white/25 hover:scale-[1.02] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white group-hover:text-[var(--color-amber-glow)] transition-colors">{name}</h3>
        <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium text-white">{count} peaks</span>
      </div>
      <p className="text-sm text-white/70 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-amber-glow)] font-medium">Highest: {highest}</p>
        <span className="flex items-center gap-1 text-xs font-medium text-white/50 group-hover:text-white transition-colors">
          View peaks
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

function RiskDot({ level }: { level: string | null | undefined }) {
  const colors: Record<string, string> = {
    LOW: "bg-emerald-500",
    MODERATE: "bg-amber-500",
    HIGH: "bg-orange-500",
    EXTREME: "bg-rose-500",
  };
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full ${colors[level ?? ""] ?? "bg-gray-300"}`}
      title={level ? `${level} risk` : "No data"}
    />
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
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

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
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

function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l10 10-10 10L2 12 12 2z" />
    </svg>
  );
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M9 18h6" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function BookmarkIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}
