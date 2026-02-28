"use client";

import Link from "next/link";
import type { Group } from "@/lib/groups.types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/groups.types";

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const categoryLabel = CATEGORY_LABELS[group.category] ?? group.category;
  const gradientClass = CATEGORY_COLORS[group.category] ?? "from-slate-500 to-slate-700";

  return (
    <Link
      href={`/groups/${group.slug}`}
      className="group bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/10 hover:border-[var(--color-brand-primary)]/30 transition-all duration-200 flex flex-col"
    >
      {/* Cover Image / Gradient */}
      <div className={`relative h-28 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
        {group.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.cover_image_url}
            alt={group.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Privacy badge */}
        <div className="absolute top-3 right-3">
          {group.privacy === "private" ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
              <LockIcon className="w-3 h-3" />
              Private
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-medium">
              <GlobeIcon className="w-3 h-3" />
              Public
            </span>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors line-clamp-1">
          {group.name}
        </h3>

        {group.description && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2 flex-1">
            {group.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
            <UsersIcon className="w-4 h-4" />
            <span className="font-medium text-[var(--color-text-primary)]">
              {group.member_count.toLocaleString()}
            </span>{" "}
            {group.member_count === 1 ? "member" : "members"}
          </span>

          {group.peaks && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
              <MountainIcon className="w-3.5 h-3.5" />
              {group.peaks.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
