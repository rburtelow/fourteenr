"use client";

import { useState } from "react";
import Link from "next/link";

interface WatchedPeak {
  peak_id: string;
  name: string;
  elevation: number;
  slug: string;
}

const DEFAULT_VISIBLE = 3;

export default function PeaksWatchedPanel({
  peaks,
  isLoggedIn,
}: {
  peaks: WatchedPeak[];
  isLoggedIn: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? peaks : peaks.slice(0, DEFAULT_VISIBLE);
  const hasMore = peaks.length > DEFAULT_VISIBLE;

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
          Peaks Watched
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Sign in to start watching peaks.
        </p>
      </div>
    );
  }

  if (peaks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
          Peaks Watched
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          No peaks watched yet. Browse peaks and add some to your watchlist.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
        Peaks Watched
        <span className="ml-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-2 py-0.5 rounded-full normal-case tracking-normal">
          {peaks.length}
        </span>
      </h3>
      <div className="space-y-3">
        {visible.map((peak, i) => (
          <Link
            key={peak.peak_id}
            href={`/peaks/${peak.slug}`}
            className="flex items-center gap-3 group"
          >
            <span className="text-sm font-mono text-[var(--color-text-muted-green)] w-5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors truncate">
                {peak.name}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {peak.elevation.toLocaleString()}&prime;
              </p>
            </div>
            <svg
              className="w-4 h-4 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-4 w-full text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
        >
          {showAll ? "Show Less" : `Show All (${peaks.length})`}
        </button>
      )}
    </div>
  );
}
