"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export default function WatchButton({
  peakId,
  initialWatched,
  isLoggedIn,
}: {
  peakId: string;
  initialWatched: boolean;
  isLoggedIn: boolean;
}) {
  const [watched, setWatched] = useState(initialWatched);

  const toggle = useCallback(() => {
    if (!isLoggedIn) return;

    const wasWatched = watched;
    setWatched(!wasWatched);

    const supabase = createClient();
    const persist = wasWatched
      ? supabase.from("peak_watchlist").delete().eq("peak_id", peakId)
      : supabase.from("peak_watchlist").insert({ peak_id: peakId });

    persist.then(({ error }) => {
      if (error) {
        console.error("Watchlist toggle failed:", error);
        setWatched(wasWatched);
      }
    });
  }, [peakId, watched, isLoggedIn]);

  if (watched) {
    return (
      <button
        onClick={toggle}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[var(--color-amber-glow)] border-2 border-[var(--color-amber-glow)]/40 bg-[var(--color-amber-glow)]/10 hover:bg-[var(--color-amber-glow)]/20 transition-all"
      >
        <BookmarkFilledIcon className="w-5 h-5" />
        Watching
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[var(--color-text-secondary)] border-2 border-[var(--color-border-app-strong)] bg-white hover:bg-[var(--color-surface-subtle)] transition-all"
    >
      <BookmarkIcon className="w-5 h-5" />
      Save to List
    </button>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
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
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}
