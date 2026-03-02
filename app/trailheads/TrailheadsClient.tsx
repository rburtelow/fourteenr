"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { TrailheadWithRouteCount } from "@/lib/trailheads";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ROAD_TYPE_OPTIONS = ["All", "Paved", "Gravel", "Rough 2WD", "4WD Required"];
const ROAD_TYPE_MAP: Record<string, string> = {
  Paved: "paved",
  Gravel: "gravel",
  "Rough 2WD": "rough_2wd",
  "4WD Required": "4wd_required",
};
const ROAD_TYPE_LABELS: Record<string, string> = {
  paved: "Paved",
  gravel: "Gravel",
  rough_2wd: "Rough 2WD",
  "4wd_required": "4WD Required",
  "4wd_high_clearance": "4WD High Clearance",
};
const ROAD_TYPE_COLORS: Record<string, string> = {
  paved: "bg-emerald-100 text-emerald-700",
  gravel: "bg-sky-100 text-sky-700",
  rough_2wd: "bg-amber-100 text-amber-700",
  "4wd_required": "bg-rose-100 text-rose-700",
  "4wd_high_clearance": "bg-rose-100 text-rose-800",
};

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "elevation", label: "Elevation" },
  { value: "routes", label: "Route Count" },
];

interface TrailheadsClientProps {
  trailheads: TrailheadWithRouteCount[];
  userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null;
  userId?: string;
  navPeaks?: { id: string; name: string; slug: string; elevation: number }[];
  unreadNotificationCount?: number;
}

export default function TrailheadsClient({
  trailheads,
  userNav,
  userId,
  navPeaks = [],
  unreadNotificationCount = 0,
}: TrailheadsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoadType, setSelectedRoadType] = useState("All");
  const [winterOnly, setWinterOnly] = useState(false);
  const [noFeeOnly, setNoFeeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  const filtered = useMemo(() => {
    let result = [...trailheads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.nearest_town || "").toLowerCase().includes(q)
      );
    }

    if (selectedRoadType !== "All") {
      result = result.filter((t) => t.road_type === ROAD_TYPE_MAP[selectedRoadType]);
    }

    if (winterOnly) {
      result = result.filter((t) => t.winter_accessible);
    }

    if (noFeeOnly) {
      result = result.filter((t) => !t.fee_required);
    }

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "elevation") return (b.elevation_ft || 0) - (a.elevation_ft || 0);
      if (sortBy === "routes") return b.routeCount - a.routeCount;
      return 0;
    });

    return result;
  }, [trailheads, searchQuery, selectedRoadType, winterOnly, noFeeOnly, sortBy]);

  const isFiltered =
    searchQuery.trim() || selectedRoadType !== "All" || winterOnly || noFeeOnly;

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={userId}
        unreadNotificationCount={unreadNotificationCount}
        peaks={navPeaks}
      />

      <main>
        {/* Hero */}
        <section className="pt-32 pb-12 bg-gradient-to-b from-[var(--color-brand-primary)] to-[var(--color-brand-primary)]/90 relative overflow-hidden">
          <div className="absolute inset-0 topo-pattern opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <p className="text-white/60 text-sm font-medium tracking-wider uppercase mb-2">
              Colorado 14ers
            </p>
            <h1
              className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trailheads
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Find starting points for every 14er route. Driving directions, road conditions,
              and parking info.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-white/70 text-sm">
                <span className="font-semibold text-white">{trailheads.length}</span> trailheads
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            {/* Search + Sort bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search by name or nearest town…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--color-border-app)] bg-white text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-primary)]/40 transition-colors"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-[var(--color-border-app)] bg-white text-sm text-[var(--color-text-primary)] outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {ROAD_TYPE_OPTIONS.map((rt) => (
                <button
                  key={rt}
                  onClick={() => setSelectedRoadType(rt)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedRoadType === rt
                      ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
                      : "bg-white border border-[var(--color-border-app)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)]/30 hover:text-[var(--color-brand-primary)]"
                  }`}
                >
                  {rt}
                </button>
              ))}
              <div className="w-px bg-[var(--color-border-app)] self-stretch mx-1" />
              <button
                onClick={() => setWinterOnly(!winterOnly)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  winterOnly
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-white border border-[var(--color-border-app)] text-[var(--color-text-secondary)] hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                Winter Access
              </button>
              <button
                onClick={() => setNoFeeOnly(!noFeeOnly)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  noFeeOnly
                    ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
                    : "bg-white border border-[var(--color-border-app)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)]/30 hover:text-[var(--color-brand-primary)]"
                }`}
              >
                No Fee
              </button>
            </div>

            {/* Result count */}
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              {filtered.length} trailhead{filtered.length !== 1 ? "s" : ""}
              {isFiltered ? " matching your filters" : ""}
            </p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-2">
                  No trailheads found
                </p>
                <p className="text-[var(--color-text-muted-green)] text-sm">
                  Try adjusting your filters or search.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((trailhead) => (
                  <TrailheadCard key={trailhead.id} trailhead={trailhead} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TrailheadCard({ trailhead }: { trailhead: TrailheadWithRouteCount }) {
  return (
    <Link href={`/trailheads/${trailhead.slug}`}>
      <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-6 hover:shadow-lg hover:border-[var(--color-brand-primary)]/20 transition-all group h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors leading-snug mb-1 truncate">
              {trailhead.name}
            </h3>
            {trailhead.nearest_town && (
              <p className="text-xs text-[var(--color-text-muted-green)] truncate">
                Near {trailhead.nearest_town}, CO
              </p>
            )}
          </div>
          {trailhead.road_type && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                ROAD_TYPE_COLORS[trailhead.road_type] || "bg-gray-100 text-gray-700"
              }`}
            >
              {ROAD_TYPE_LABELS[trailhead.road_type] || trailhead.road_type}
            </span>
          )}
        </div>

        <div className="flex items-center gap-5 text-sm mb-4">
          {trailhead.elevation_ft && (
            <div>
              <span className="font-bold text-[var(--color-brand-primary)]">
                {trailhead.elevation_ft.toLocaleString()}&apos;
              </span>
              <span className="text-[var(--color-text-muted-green)] ml-1 text-xs">elev</span>
            </div>
          )}
          <div>
            <span className="font-bold text-[var(--color-brand-primary)]">
              {trailhead.routeCount}
            </span>
            <span className="text-[var(--color-text-muted-green)] ml-1 text-xs">
              route{trailhead.routeCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {trailhead.restrooms && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">
              Restrooms
            </span>
          )}
          {!trailhead.fee_required && (
            <span className="text-xs bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] px-2 py-1 rounded-full">
              No Fee
            </span>
          )}
          {trailhead.winter_accessible && (
            <span className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-full border border-sky-100">
              Winter
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}
