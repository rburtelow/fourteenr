"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface FeedPost {
  id: number;
  author: string;
  handle: string;
  avatar: string;
  timeAgo: string;
  content: string;
  image?: string;
  peak?: string;
  peakSlug?: string;
  elevation?: string;
  likes: number;
  comments: number;
  saves: number;
  isConditionReport?: boolean;
}

interface CommunityFeedProps {
  posts: FeedPost[];
  avatarInitials: string;
  isLoggedIn: boolean;
  slugToId: Record<string, string>;
  initialWatchedPeakIds: string[];
}

export default function CommunityFeed({
  posts,
  avatarInitials,
  isLoggedIn,
  slugToId,
  initialWatchedPeakIds,
}: CommunityFeedProps) {
  const [watchedPeaks, setWatchedPeaks] = useState<Set<string>>(
    () => new Set(initialWatchedPeakIds)
  );

  const toggleWatchPeak = useCallback(
    (peakId: string) => {
      if (!isLoggedIn) return;

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
    },
    [isLoggedIn, watchedPeaks]
  );

  return (
    <main className="lg:col-span-6 space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white font-semibold flex-shrink-0">
            {avatarInitials}
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Share your trail story..."
              rows={3}
              className="w-full resize-none bg-[var(--color-surface-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                  <MapPinIcon className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                  <MountainIcon className="w-5 h-5" />
                </button>
              </div>
              <button className="bg-[var(--color-brand-primary)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post, index) => {
        const peakId = post.peakSlug ? slugToId[post.peakSlug] : undefined;
        const isWatched = peakId ? watchedPeaks.has(peakId) : false;

        return (
          <article
            key={post.id}
            className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden card-hover animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Post Header */}
            <div className="p-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white font-semibold">
                    {post.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {post.author}
                      </span>
                      {post.isConditionReport && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-amber-glow)]/10 text-[var(--color-amber-glow)] text-xs font-medium">
                          Conditions
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span>{post.handle}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)]/30" />
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                  <MoreIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <p className="mt-4 text-[var(--color-text-primary)] leading-relaxed">
                {post.content}
              </p>

              {/* Peak Tag */}
              {post.peak && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] text-sm">
                  <MountainIcon className="w-4 h-4 text-[var(--color-brand-primary)]" />
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {post.peak}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    •
                  </span>
                  <span className="font-mono text-[var(--color-brand-primary)]">
                    {post.elevation}
                  </span>
                </div>
              )}
            </div>

            {/* Image */}
            {post.image && (
              <div className="relative h-72 overflow-hidden">
                <Image src={post.image} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Actions */}
            <div className="px-5 py-4 border-t border-[var(--color-border-app)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors">
                    <div className="p-2 rounded-lg group-hover:bg-[var(--color-surface-subtle)] transition-colors">
                      <HeartIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors">
                    <div className="p-2 rounded-lg group-hover:bg-[var(--color-surface-subtle)] transition-colors">
                      <CommentIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">
                      {post.comments}
                    </span>
                  </button>
                </div>
                {peakId ? (
                  <button
                    onClick={() => toggleWatchPeak(peakId)}
                    className={`group flex items-center gap-2 transition-colors ${
                      isWatched
                        ? "text-[var(--color-amber-glow)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-amber-glow)]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isWatched
                          ? "bg-[var(--color-amber-glow)]/10"
                          : "group-hover:bg-[var(--color-amber-glow)]/10"
                      }`}
                    >
                      <BookmarkIcon
                        className="w-5 h-5"
                        filled={isWatched}
                      />
                    </div>
                    <span className="text-sm font-medium">{post.saves}</span>
                  </button>
                ) : (
                  <button className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-amber-glow)] transition-colors">
                    <div className="p-2 rounded-lg group-hover:bg-[var(--color-amber-glow)]/10 transition-colors">
                      <BookmarkIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{post.saves}</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {/* Load More */}
      <div className="text-center pt-4">
        <button className="px-6 py-3 text-sm font-semibold text-[var(--color-brand-primary)] border-2 border-[var(--color-border-app-strong)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-all">
          Load More Stories
        </button>
      </div>
    </main>
  );
}

// Icons
function ImageIcon({ className }: { className?: string }) {
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
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
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
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
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
        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
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
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
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
        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
      />
    </svg>
  );
}

function BookmarkIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
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
