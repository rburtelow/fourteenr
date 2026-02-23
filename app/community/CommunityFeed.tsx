"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useState,
  useCallback,
  useTransition,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { createPost, deletePost, toggleLike, toggleSave } from "./actions";
import type { CommunityPost, PostComment } from "@/lib/community.types";
import CommentThread from "./CommentThread";

const FEED_POST_SELECT = `
  id,
  user_id,
  content,
  peak_id,
  is_condition_report,
  image_urls,
  created_at,
  updated_at,
  profiles:user_id (
    screen_name,
    full_name,
    avatar_url
  ),
  peaks:peak_id (
    name,
    slug,
    elevation
  ),
  community_events (
    id
  )
`;

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else if (diffDays > 0) {
    return `${diffDays}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else if (diffMins > 0) {
    return `${diffMins}m`;
  } else {
    return "now";
  }
}

function getAvatarInitials(
  fullName: string | null,
  screenName: string | null
): string {
  const name = fullName || screenName || "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface Peak {
  id: string;
  name: string;
  slug: string;
  elevation: number;
}

interface CommunityFeedProps {
  posts: CommunityPost[];
  avatarInitials: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  initialWatchedPeakIds: string[];
  allPeaks: Peak[];
}

export default function CommunityFeed({
  posts: initialPosts,
  avatarInitials,
  isLoggedIn,
  currentUserId,
  initialWatchedPeakIds,
  allPeaks,
}: CommunityFeedProps) {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState(initialPosts);
  const [watchedPeaks, setWatchedPeaks] = useState<Set<string>>(
    () => new Set(initialWatchedPeakIds)
  );
  const [isPending, startTransition] = useTransition();

  // Comment thread state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    () => new Set()
  );
  const [commentsCache, setCommentsCache] = useState<
    Record<string, PostComment[]>
  >({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(
    () => new Set()
  );
  const expandedCommentsRef = useRef(expandedComments);

  useEffect(() => {
    expandedCommentsRef.current = expandedComments;
  }, [expandedComments]);

  // Track optimistic actions initiated from THIS tab so realtime echoes can be
  // absorbed without double-counting. Actions from the same user on another
  // device will NOT be in these sets and will be applied normally.
  const pendingLikeRef = useRef<Set<string>>(new Set());
  const pendingSaveRef = useRef<Set<string>>(new Set());
  const pendingCommentRef = useRef<Map<string, number>>(new Map()); // postId → pending delta

  const fetchComments = useCallback(
    async (postId: string) => {
      const { data } = await supabase
        .from("post_comments")
        .select(
          `
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            screen_name,
            full_name,
            avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      return (data || []) as unknown as PostComment[];
    },
    [supabase]
  );

  const fetchEngagementSnapshot = useCallback(
    async (postId: string) => {
      const [likeResult, commentResult, saveResult, userLikeResult, userSaveResult] =
        await Promise.all([
          supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId),
          supabase
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId),
          supabase
            .from("post_saves")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId),
          currentUserId
            ? supabase
                .from("post_likes")
                .select("id")
                .eq("post_id", postId)
                .eq("user_id", currentUserId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
          currentUserId
            ? supabase
                .from("post_saves")
                .select("id")
                .eq("post_id", postId)
                .eq("user_id", currentUserId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

      return {
        like_count: likeResult.count ?? 0,
        comment_count: commentResult.count ?? 0,
        save_count: saveResult.count ?? 0,
        user_has_liked: Boolean(userLikeResult.data),
        user_has_saved: Boolean(userSaveResult.data),
      };
    },
    [currentUserId, supabase]
  );


  const fetchPostById = useCallback(
    async (postId: string): Promise<CommunityPost | null> => {
      const { data, error } = await supabase
        .from("community_posts")
        .select(FEED_POST_SELECT)
        .eq("id", postId)
        .single();

      if (error || !data) {
        return null;
      }

      const snapshot = await fetchEngagementSnapshot(postId);

      const rawEvents = data.community_events as { id: string }[] | null;
      return {
        ...(data as Omit<
          CommunityPost,
          | "like_count"
          | "comment_count"
          | "save_count"
          | "user_has_liked"
          | "user_has_saved"
          | "linked_event_id"
        >),
        profiles: data.profiles as CommunityPost["profiles"],
        peaks: data.peaks as CommunityPost["peaks"],
        linked_event_id: rawEvents?.[0]?.id ?? null,
        like_count: snapshot.like_count,
        comment_count: snapshot.comment_count,
        save_count: snapshot.save_count,
        user_has_liked: snapshot.user_has_liked,
        user_has_saved: snapshot.user_has_saved,
      };
    },
    [fetchEngagementSnapshot, supabase]
  );

  useEffect(() => {
    const channel = supabase
      // Naming convention: scope:id:entity
      .channel("community:feed:posts")
      // ── community_posts ──────────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_posts" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            const postId = String(payload.old?.id || "");
            if (!postId) return;
            setPosts((prev) => prev.filter((post) => post.id !== postId));
            return;
          }

          const postId = String(payload.new?.id || "");
          if (!postId) return;

          const freshPost = await fetchPostById(postId);
          if (!freshPost) return;

          setPosts((prev) => {
            const existingIndex = prev.findIndex((post) => post.id === postId);
            if (existingIndex === -1) {
              return [freshPost, ...prev].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
            }
            const next = [...prev];
            next[existingIndex] = freshPost;
            return next;
          });
        }
      )
      // ── post_likes ───────────────────────────────────────────────────────
      // If this tab initiated the action (pendingLikeRef), absorb the echo.
      // If it's the same user on a different device, apply count + liked state.
      // REPLICA IDENTITY FULL ensures payload.old includes user_id on DELETE.
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_likes" },
        (payload) => {
          const postId = String(payload.new?.post_id || "");
          if (!postId) return;
          if (payload.new?.user_id === currentUserId) {
            if (pendingLikeRef.current.has(postId)) {
              pendingLikeRef.current.delete(postId);
              return; // Absorb echo from this tab
            }
            // Same user, different device — reflect their like
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, like_count: p.like_count + 1, user_has_liked: true }
                  : p
              )
            );
            return;
          }
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, like_count: p.like_count + 1 } : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_likes" },
        (payload) => {
          const postId = String(payload.old?.post_id || "");
          if (!postId) return;
          if (payload.old?.user_id === currentUserId) {
            if (pendingLikeRef.current.has(postId)) {
              pendingLikeRef.current.delete(postId);
              return;
            }
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, like_count: Math.max(0, p.like_count - 1), user_has_liked: false }
                  : p
              )
            );
            return;
          }
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, like_count: Math.max(0, p.like_count - 1) }
                : p
            )
          );
        }
      )
      // ── post_saves ───────────────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_saves" },
        (payload) => {
          const postId = String(payload.new?.post_id || "");
          if (!postId) return;
          if (payload.new?.user_id === currentUserId) {
            if (pendingSaveRef.current.has(postId)) {
              pendingSaveRef.current.delete(postId);
              return;
            }
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, save_count: p.save_count + 1, user_has_saved: true }
                  : p
              )
            );
            return;
          }
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, save_count: p.save_count + 1 } : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_saves" },
        (payload) => {
          const postId = String(payload.old?.post_id || "");
          if (!postId) return;
          if (payload.old?.user_id === currentUserId) {
            if (pendingSaveRef.current.has(postId)) {
              pendingSaveRef.current.delete(postId);
              return;
            }
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, save_count: Math.max(0, p.save_count - 1), user_has_saved: false }
                  : p
              )
            );
            return;
          }
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, save_count: Math.max(0, p.save_count - 1) }
                : p
            )
          );
        }
      )
      // ── post_comments ────────────────────────────────────────────────────
      // pendingCommentRef tracks deltas applied by this tab via onCommentCountChange.
      // Consume one unit of pending delta to absorb the echo; if none pending,
      // it came from another device and should be applied.
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments" },
        async (payload) => {
          const postId = String(payload.new?.post_id || "");
          if (!postId) return;

          if (payload.new?.user_id === currentUserId) {
            const pending = pendingCommentRef.current.get(postId) ?? 0;
            if (pending > 0) {
              pendingCommentRef.current.set(postId, pending - 1);
              // Absorb — but still sync the cache for cross-tab comment list accuracy
            } else {
              // Different device: apply count
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === postId
                    ? { ...p, comment_count: p.comment_count + 1 }
                    : p
                )
              );
            }
          } else {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, comment_count: p.comment_count + 1 }
                  : p
              )
            );
          }

          if (expandedCommentsRef.current.has(postId)) {
            const latestComments = await fetchComments(postId);
            setCommentsCache((prev) => ({ ...prev, [postId]: latestComments }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_comments" },
        async (payload) => {
          const postId = String(payload.old?.post_id || "");
          if (!postId) return;

          if (payload.old?.user_id === currentUserId) {
            const pending = pendingCommentRef.current.get(postId) ?? 0;
            if (pending < 0) {
              pendingCommentRef.current.set(postId, pending + 1);
            } else {
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === postId
                    ? { ...p, comment_count: Math.max(0, p.comment_count - 1) }
                    : p
                )
              );
            }
          } else {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, comment_count: Math.max(0, p.comment_count - 1) }
                  : p
              )
            );
          }

          if (expandedCommentsRef.current.has(postId)) {
            const latestComments = await fetchComments(postId);
            setCommentsCache((prev) => ({ ...prev, [postId]: latestComments }));
          }
        }
      )
      .subscribe((_status, err) => {
        if (err) {
          console.error("Realtime subscription error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchComments, fetchPostById, supabase, currentUserId]);

  const handleToggleComments = useCallback(
    async (postId: string) => {
      if (expandedComments.has(postId)) {
        setExpandedComments((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        return;
      }

      setExpandedComments((prev) => new Set(prev).add(postId));

      if (!commentsCache[postId]) {
        setLoadingComments((prev) => new Set(prev).add(postId));
        const data = await fetchComments(postId);

        setCommentsCache((prev) => ({
          ...prev,
          [postId]: data,
        }));
        setLoadingComments((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [expandedComments, commentsCache, fetchComments]
  );

  const handleCommentCountChange = useCallback(
    (postId: string, delta: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comment_count: p.comment_count + delta }
            : p
        )
      );
      // Track that this tab already applied the delta so the realtime echo is absorbed
      pendingCommentRef.current.set(
        postId,
        (pendingCommentRef.current.get(postId) ?? 0) + delta
      );
    },
    []
  );

  // Post composer state
  const [content, setContent] = useState("");
  const [selectedPeakId, setSelectedPeakId] = useState<string | null>(null);
  const [isConditionReport, setIsConditionReport] = useState(false);
  const [showPeakSelector, setShowPeakSelector] = useState(false);
  const [peakSearch, setPeakSearch] = useState("");
  const peakSelectorRef = useRef<HTMLDivElement>(null);
  const peakSearchRef = useRef<HTMLInputElement>(null);

  // Close peak selector on Escape or click outside
  useEffect(() => {
    if (!showPeakSelector) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPeakSelector(false);
        setPeakSearch("");
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (peakSelectorRef.current && !peakSelectorRef.current.contains(e.target as Node)) {
        setShowPeakSelector(false);
        setPeakSearch("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPeakSelector]);

  // Auto-focus search input when selector opens
  useEffect(() => {
    if (showPeakSelector) {
      requestAnimationFrame(() => peakSearchRef.current?.focus());
    }
  }, [showPeakSelector]);

  const filteredPeaks = allPeaks.filter((p) =>
    p.name.toLowerCase().includes(peakSearch.toLowerCase())
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
    [isLoggedIn, watchedPeaks, supabase]
  );

  const handleSubmitPost = async () => {
    if (!content.trim() || !isLoggedIn) return;

    const formData = new FormData();
    formData.set("content", content);
    if (selectedPeakId) formData.set("peakId", selectedPeakId);
    formData.set("isConditionReport", String(isConditionReport));

    startTransition(async () => {
      const result = await createPost(formData);
      if (result.success) {
        const newPostId = (result.post as { id?: string } | undefined)?.id;
        if (newPostId) {
          const freshPost = await fetchPostById(newPostId);
          if (freshPost) {
            setPosts((prev) => {
              const exists = prev.some((post) => post.id === freshPost.id);
              if (exists) return prev;
              return [freshPost, ...prev];
            });
          }
        }
        setContent("");
        setSelectedPeakId(null);
        setIsConditionReport(false);
        setShowPeakSelector(false);
      }
    });
  };

  const handleDeletePost = async (postId: string) => {
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    });
  };

  const handleToggleLike = async (postId: string) => {
    if (!isLoggedIn) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_has_liked: !p.user_has_liked,
              like_count: p.user_has_liked ? p.like_count - 1 : p.like_count + 1,
            }
          : p
      )
    );

    // Mark as pending so the realtime echo from this tab is absorbed
    pendingLikeRef.current.add(postId);

    const result = await toggleLike(postId);
    if (result.error) {
      pendingLikeRef.current.delete(postId);
      // Rollback on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                user_has_liked: !p.user_has_liked,
                like_count: p.user_has_liked
                  ? p.like_count - 1
                  : p.like_count + 1,
              }
            : p
        )
      );
    }
  };

  const handleToggleSave = async (postId: string) => {
    if (!isLoggedIn) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_has_saved: !p.user_has_saved,
              save_count: p.user_has_saved ? p.save_count - 1 : p.save_count + 1,
            }
          : p
      )
    );

    pendingSaveRef.current.add(postId);

    const result = await toggleSave(postId);
    if (result.error) {
      pendingSaveRef.current.delete(postId);
      // Rollback on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                user_has_saved: !p.user_has_saved,
                save_count: p.user_has_saved
                  ? p.save_count - 1
                  : p.save_count + 1,
              }
            : p
        )
      );
    }
  };

  const selectedPeak = allPeaks.find((p) => p.id === selectedPeakId);

  return (
    <main className="lg:col-span-6 space-y-6">
      {/* Create Post */}
      {isLoggedIn && (
        <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {avatarInitials}
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Share your trail story..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full resize-none bg-[var(--color-surface-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
              />

              {/* Selected peak tag */}
              {selectedPeak && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] text-sm">
                  <MountainIcon className="w-4 h-4 text-[var(--color-brand-primary)]" />
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {selectedPeak.name}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedPeakId(null);
                      setIsConditionReport(false);
                    }}
                    className="ml-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Peak selector dropdown */}
              {showPeakSelector && (
                <div ref={peakSelectorRef} className="mt-2 bg-white border border-[var(--color-border-app)] rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border-app)]">
                    <SearchIcon className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" />
                    <input
                      ref={peakSearchRef}
                      type="text"
                      value={peakSearch}
                      onChange={(e) => setPeakSearch(e.target.value)}
                      placeholder="Search peaks..."
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--color-text-secondary)]/60 text-[var(--color-text-primary)]"
                    />
                    <button
                      onClick={() => {
                        setShowPeakSelector(false);
                        setPeakSearch("");
                      }}
                      className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPeaks.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-[var(--color-text-secondary)] text-center">
                        No peaks found
                      </div>
                    ) : (
                      filteredPeaks.map((peak) => (
                        <button
                          key={peak.id}
                          onClick={() => {
                            setSelectedPeakId(peak.id);
                            setShowPeakSelector(false);
                            setPeakSearch("");
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface-subtle)] flex items-center justify-between"
                        >
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {peak.name}
                          </span>
                          <span className="text-[var(--color-text-secondary)] font-mono text-xs">
                            {peak.elevation.toLocaleString()}&apos;
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Condition report toggle */}
              {selectedPeakId && (
                <label className="mt-2 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConditionReport}
                    onChange={(e) => setIsConditionReport(e.target.checked)}
                    className="rounded border-[var(--color-border-app)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    This is a trail conditions report
                  </span>
                </label>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                    <MapPinIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowPeakSelector(!showPeakSelector);
                      if (showPeakSelector) setPeakSearch("");
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      selectedPeakId
                        ? "text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]"
                    }`}
                  >
                    <MountainIcon className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleSubmitPost}
                  disabled={!content.trim() || isPending}
                  className="bg-[var(--color-brand-primary)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-12 text-center">
          <MountainIcon className="w-12 h-12 mx-auto text-[var(--color-text-secondary)] opacity-50" />
          <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
            No posts yet
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Be the first to share your trail story!
          </p>
        </div>
      )}

      {/* Feed Posts */}
      {posts.map((post, index) => {
        const authorName =
          post.profiles.full_name || post.profiles.screen_name || "Anonymous";
        const authorHandle =
          post.profiles.full_name && post.profiles.screen_name
            ? `@${post.profiles.screen_name}`
            : "";
        const authorInitials = getAvatarInitials(
          post.profiles.full_name,
          post.profiles.screen_name
        );
        const timeAgo = formatTimeAgo(post.created_at);
        const isOwnPost = currentUserId === post.user_id;
        const peakId = post.peak_id;
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
                  {post.profiles.avatar_url ? (
                    <Image
                      src={post.profiles.avatar_url}
                      alt={authorName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white font-semibold">
                      {authorInitials}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {authorName}
                      </span>
                      {post.is_condition_report && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-amber-glow)]/10 text-[var(--color-amber-glow)] text-xs font-medium">
                          Conditions
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      {authorHandle && <span>{authorHandle}</span>}
                      {authorHandle && (
                        <span className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)]/30" />
                      )}
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                    <MoreIcon className="w-5 h-5" />
                  </button>
                  {isOwnPost && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-[var(--color-border-app)] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              {post.content.startsWith("\u{1F4C5}") || post.content.startsWith("\u{274C}") ? (
                <EventPostContent content={post.content} eventId={post.linked_event_id} />
              ) : (
                <p className="mt-4 text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              )}

              {/* Peak Tag */}
              {post.peaks && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] text-sm">
                  <MountainIcon className="w-4 h-4 text-[var(--color-brand-primary)]" />
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {post.peaks.name}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">•</span>
                  <span className="font-mono text-[var(--color-brand-primary)]">
                    {post.peaks.elevation.toLocaleString()}&apos;
                  </span>
                </div>
              )}
            </div>

            {/* Image */}
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={post.image_urls[0]}
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Actions */}
            <div className="px-5 py-4 border-t border-[var(--color-border-app)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`group flex items-center gap-2 transition-colors ${
                      post.user_has_liked
                        ? "text-red-500"
                        : "text-[var(--color-text-secondary)] hover:text-red-500"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        post.user_has_liked
                          ? "bg-red-50"
                          : "group-hover:bg-red-50"
                      }`}
                    >
                      <HeartIcon
                        className="w-5 h-5"
                        filled={post.user_has_liked}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {post.like_count}
                    </span>
                  </button>
                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className={`group flex items-center gap-2 transition-colors ${
                      expandedComments.has(post.id)
                        ? "text-[var(--color-brand-primary)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        expandedComments.has(post.id)
                          ? "bg-[var(--color-surface-subtle)]"
                          : "group-hover:bg-[var(--color-surface-subtle)]"
                      }`}
                    >
                      <CommentIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">
                      {post.comment_count}
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
                      <BookmarkIcon className="w-5 h-5" filled={isWatched} />
                    </div>
                    <span className="text-sm font-medium">
                      {post.save_count}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleSave(post.id)}
                    className={`group flex items-center gap-2 transition-colors ${
                      post.user_has_saved
                        ? "text-[var(--color-amber-glow)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-amber-glow)]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        post.user_has_saved
                          ? "bg-[var(--color-amber-glow)]/10"
                          : "group-hover:bg-[var(--color-amber-glow)]/10"
                      }`}
                    >
                      <BookmarkIcon
                        className="w-5 h-5"
                        filled={post.user_has_saved}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {post.save_count}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Comment Thread */}
            {expandedComments.has(post.id) && (
              <div className="border-t border-[var(--color-border-app)]">
                {loadingComments.has(post.id) ? (
                  <div className="px-5 py-4 text-sm text-[var(--color-text-secondary)] text-center">
                    Loading comments...
                  </div>
                ) : (
                  <CommentThread
                    postId={post.id}
                    initialComments={commentsCache[post.id] || []}
                    currentUserId={currentUserId}
                    isLoggedIn={isLoggedIn}
                    onCommentCountChange={(delta) =>
                      handleCommentCountChange(post.id, delta)
                    }
                  />
                )}
              </div>
            )}
          </article>
        );
      })}

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center pt-4">
          <button className="px-6 py-3 text-sm font-semibold text-[var(--color-brand-primary)] border-2 border-[var(--color-border-app-strong)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-all">
            Load More Stories
          </button>
        </div>
      )}
    </main>
  );
}

// Event post renderer
function EventPostContent({ content, eventId }: { content: string; eventId: string | null }) {
  const lines = content.split("\n");
  // Line 0: "📅 {title}" or "❌ [CANCELLED] {title}"
  const rawTitle = lines[0].replace(/^\S+\s*/, ""); // strip leading emoji
  const dateLocation = lines[1] || null;
  const description = lines.slice(2).join("\n").trim() || null;
  const isCancelled = content.startsWith("\u{274C}");

  const inner = (
    <div className={`rounded-xl border overflow-hidden ${eventId && !isCancelled ? "hover:border-[var(--color-brand-primary)]/40 hover:shadow-sm transition-all cursor-pointer" : ""} ${isCancelled ? "border-red-200" : "border-[var(--color-border-app)]"}`}>
      <div className={`px-4 py-3 ${isCancelled ? "bg-red-50" : "bg-[var(--color-surface-subtle)]"}`}>
        <p className={`font-semibold text-base leading-snug ${isCancelled ? "text-red-700 line-through" : "text-[var(--color-text-primary)]"}`}>
          {isCancelled ? "\u274C\u00A0" : "\u{1F4C5}\u00A0"}
          {rawTitle}
        </p>
        {dateLocation && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {dateLocation}
          </p>
        )}
      </div>
      {description && (
        <p className="px-4 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed">
          {description}
        </p>
      )}
      {eventId && !isCancelled && (
        <div className="px-4 py-2 border-t border-[var(--color-border-app)] bg-white">
          <span className="text-xs font-medium text-[var(--color-brand-primary)]">View event details →</span>
        </div>
      )}
    </div>
  );

  if (eventId && !isCancelled) {
    return (
      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        <Link href={`/events/${eventId}`}>{inner}</Link>
      </div>
    );
  }

  return <div className="mt-4">{inner}</div>;
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

function HeartIcon({
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
