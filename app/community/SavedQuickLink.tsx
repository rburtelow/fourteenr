"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SavedQuickLink({
  initialCount,
  userId,
}: {
  initialCount: number;
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const channel = supabase
      .channel("saved-quick-link")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_saves",
          filter: `user_id=eq.${userId}`,
        },
        () => setCount((c) => c + 1)
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "post_saves",
          filter: `user_id=eq.${userId}`,
        },
        () => setCount((c) => Math.max(0, c - 1))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <Link
      href="/community/saved"
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--color-surface-subtle)] transition-all group"
    >
      <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
        <BookmarkIcon />
      </span>
      <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">
        Saved
      </span>
      <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-2 py-0.5 rounded-full">
        {count}
      </span>
    </Link>
  );
}

function BookmarkIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}
