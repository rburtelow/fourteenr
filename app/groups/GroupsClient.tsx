"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import GroupCard from "./GroupCard";
import CreateGroupModal from "./CreateGroupModal";
import type { Group, GroupCategory } from "@/lib/groups.types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/groups.types";

interface Peak {
  id: string;
  name: string;
  slug: string;
  elevation: number;
}

interface GroupsClientProps {
  initialGroups: Group[];
  allPeaks: Peak[];
  isLoggedIn: boolean;
  suggestedGroups?: Group[];
  initialSearch?: string;
}

type SortOption = "newest" | "most_members" | "recently_active";

const ALL_CATEGORIES: [string, string][] = [
  ["all", "All Groups"],
  ...Object.entries(CATEGORY_LABELS),
];

export default function GroupsClient({ initialGroups, allPeaks, isLoggedIn, suggestedGroups = [], initialSearch = "" }: GroupsClientProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleSuggestions = suggestedGroups.filter((g) => !dismissedIds.has(g.id));

  const filtered = useMemo(() => {
    let groups = initialGroups;

    if (search.trim()) {
      const q = search.toLowerCase();
      groups = groups.filter((g) => g.name.toLowerCase().includes(q));
    }

    if (category !== "all") {
      groups = groups.filter((g) => g.category === category);
    }

    const sorted = [...groups];
    switch (sort) {
      case "most_members":
        sorted.sort((a, b) => b.member_count - a.member_count);
        break;
      case "recently_active":
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [initialGroups, search, category, sort]);

  return (
    <>
      {/* Suggested Groups */}
      {visibleSuggestions.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Suggested for You
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Based on your summits and people you follow
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSuggestions.map((group) => (
              <div key={group.id} className="relative group/suggestion">
                <Link href={`/groups/${group.slug}`} className="block">
                  <SuggestedGroupCard group={group} />
                </Link>
                <button
                  onClick={() => setDismissedIds((prev) => new Set(prev).add(group.id))}
                  aria-label="Dismiss suggestion"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/suggestion:opacity-100 transition-opacity hover:bg-black/50"
                >
                  <XSmallIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-[var(--color-border-app)]" />
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2.5 rounded-xl bg-white border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="most_members">Most Members</option>
            <option value="recently_active">Recently Active</option>
          </select>

          {/* Create Group CTA */}
          {isLoggedIn ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
            >
              <PlusIcon className="w-4 h-4" />
              New Group
            </button>
          ) : null}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        {ALL_CATEGORIES.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === value
                ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
                : "bg-white border border-[var(--color-border-app)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)]/50 hover:text-[var(--color-text-primary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-[var(--color-text-secondary)] mb-5">
        {filtered.length === 0
          ? "No groups found"
          : `${filtered.length} ${filtered.length === 1 ? "group" : "groups"}`}
        {category !== "all" && ` in ${CATEGORY_LABELS[category as GroupCategory]}`}
        {search && ` matching "${search}"`}
      </p>

      {/* Group Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center">
            <UsersIcon className="w-8 h-8 text-[var(--color-text-muted-green)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            No groups found
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto mb-6">
            {search
              ? `No groups match "${search}". Try a different search.`
              : "Be the first to create a group for this category!"}
          </p>
          {isLoggedIn && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Create a Group
            </button>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        allPeaks={allPeaks}
      />
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function XSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SuggestedGroupCard({ group }: { group: Group }) {
  const gradientClass = CATEGORY_COLORS[group.category] ?? "from-slate-500 to-slate-700";
  const categoryLabel = CATEGORY_LABELS[group.category] ?? group.category;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden hover:shadow-md transition-shadow">
      {/* Mini cover */}
      <div className={`h-16 bg-gradient-to-br ${gradientClass} relative`}>
        {group.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4">
        <span className="inline-block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          {categoryLabel}
        </span>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-1 mb-1">
          {group.name}
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {group.member_count.toLocaleString()} {group.member_count === 1 ? "member" : "members"}
        </p>
      </div>
    </div>
  );
}
