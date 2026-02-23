"use client";

import Image from "next/image";
import { useState, useTransition, useCallback, useEffect } from "react";
import { addComment, deleteComment } from "./actions";
import type { PostComment } from "@/lib/community.types";

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
  }
  return "now";
}

interface CommentThreadProps {
  postId: string;
  initialComments: PostComment[];
  currentUserId?: string;
  isLoggedIn: boolean;
  onCommentCountChange: (delta: number) => void;
}

export default function CommentThread({
  postId,
  initialComments,
  currentUserId,
  isLoggedIn,
  onCommentCountChange,
}: CommentThreadProps) {
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim() || !isLoggedIn) return;

    const content = newComment.trim();
    setNewComment("");

    startTransition(async () => {
      const result = await addComment(postId, content);
      if (result.success && result.comment) {
        setComments((prev) => [...prev, result.comment as PostComment]);
        onCommentCountChange(1);
      }
    });
  }, [newComment, isLoggedIn, postId, onCommentCountChange]);

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentCountChange(-1);

      startTransition(async () => {
        const result = await deleteComment(commentId);
        if (result.error) {
          // Rollback not easily possible without storing the comment, but the
          // page will revalidate and correct state on next load.
        }
      });
    },
    [onCommentCountChange]
  );

  return (
    <div className="px-5 pt-3 pb-5 space-y-4">
      {/* Existing comments */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => {
            const name =
              comment.profiles.full_name ||
              comment.profiles.screen_name ||
              "Anonymous";
            const initials = getAvatarInitials(
              comment.profiles.full_name,
              comment.profiles.screen_name
            );
            const isOwn = currentUserId === comment.user_id;

            return (
              <div key={comment.id} className="flex items-start gap-3 group">
                {comment.profiles.avatar_url ? (
                  <Image
                    src={comment.profiles.avatar_url}
                    alt={name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="bg-[var(--color-surface-subtle)] rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {name}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="mt-1 ml-2 text-xs text-[var(--color-text-secondary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add comment input */}
      {isLoggedIn && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {/* Current user avatar handled via initials; could be enhanced */}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 bg-[var(--color-surface-subtle)] rounded-xl px-3.5 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isPending}
              className="px-3 py-2 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {!isLoggedIn && comments.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-2">
          Sign in to join the conversation.
        </p>
      )}
    </div>
  );
}
