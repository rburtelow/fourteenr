"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/groups.types";
import type { GroupCategory } from "@/lib/groups.types";

interface GroupResult {
  id: string;
  name: string;
  slug: string;
  category: GroupCategory;
  member_count: number;
}

interface TrailheadResult {
  id: string;
  name: string;
  slug: string;
  elevation_ft: number | null;
  road_type: string | null;
  nearest_town: string | null;
}

const ROAD_TYPE_LABELS: Record<string, string> = {
  paved: "Paved",
  gravel: "Gravel",
  rough_2wd: "Rough 2WD",
  "4wd_required": "4WD Required",
  "4wd_high_clearance": "4WD High Clearance",
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const [trailheads, setTrailheads] = useState<TrailheadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setGroups([]);
      setTrailheads([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const [{ data: groupData }, { data: trailheadData }] = await Promise.all([
      supabase
        .from("groups")
        .select("id, name, slug, category, member_count")
        .ilike("name", `%${q}%`)
        .eq("privacy", "public")
        .order("member_count", { ascending: false })
        .limit(4),
      supabase
        .from("trailheads")
        .select("id, name, slug, elevation_ft, road_type, nearest_town")
        .ilike("name", `%${q}%`)
        .order("name")
        .limit(4),
    ]);
    setGroups((groupData as GroupResult[]) || []);
    setTrailheads((trailheadData as TrailheadResult[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setGroups([]);
      setTrailheads([]);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelectGroup = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/groups/${slug}`);
  };

  const handleSelectTrailhead = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/trailheads/${slug}`);
  };

  const handleSeeAll = () => {
    setOpen(false);
    router.push(`/groups?search=${encodeURIComponent(query)}`);
    setQuery("");
  };

  const hasResults = groups.length > 0 || trailheads.length > 0;
  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Search groups"
        className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all"
      >
        <SearchIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[var(--color-border-app)] overflow-hidden z-50">
          {/* Input row */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-app)]">
            <SearchIcon className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups…"
              className="flex-1 text-sm text-[var(--color-text-primary)] bg-transparent outline-none placeholder:text-[var(--color-text-secondary)]"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
                if (e.key === "Enter" && query.trim()) handleSeeAll();
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results */}
          {showDropdown ? (
            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                  Searching…
                </p>
              )}

              {!loading && hasResults && (
                <>
                  {trailheads.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Trailheads
                      </p>
                      {trailheads.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTrailhead(t.slug)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-subtle)] transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex-shrink-0 flex items-center justify-center">
                            <TrailheadSearchIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                              {t.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {t.road_type ? ROAD_TYPE_LABELS[t.road_type] || t.road_type : "Trailhead"}
                              {t.elevation_ft && ` · ${t.elevation_ft.toLocaleString()}'`}
                              {t.nearest_town && ` · ${t.nearest_town}`}
                            </p>
                          </div>
                          <ChevronRightIcon className="w-3.5 h-3.5 text-[var(--color-text-secondary)] flex-shrink-0" />
                        </button>
                      ))}
                    </>
                  )}

                  {groups.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Groups
                      </p>
                      {groups.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => handleSelectGroup(g.slug)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-subtle)] transition-colors text-left"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[g.category]} flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                              {g.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {CATEGORY_LABELS[g.category]} ·{" "}
                              {g.member_count}{" "}
                              {g.member_count === 1 ? "member" : "members"}
                            </p>
                          </div>
                          <ChevronRightIcon className="w-3.5 h-3.5 text-[var(--color-text-secondary)] flex-shrink-0" />
                        </button>
                      ))}
                    </>
                  )}

                  <div className="px-4 py-2.5 border-t border-[var(--color-border-app)]">
                    <button
                      onClick={handleSeeAll}
                      className="text-xs text-[var(--color-brand-primary)] hover:underline font-medium"
                    >
                      See all results for &ldquo;{query}&rdquo;
                    </button>
                  </div>
                </>
              )}

              {!loading && !hasResults && (
                <p className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-[var(--color-text-secondary)]">
              Search trailheads and groups…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TrailheadSearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l4-12 5 7 3-5 6 10H3z" />
    </svg>
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
