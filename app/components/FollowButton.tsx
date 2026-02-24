"use client";

import { useState, useTransition } from "react";
import {
  sendFollowRequest,
  cancelFollowRequest,
  unfollowUser,
} from "@/app/community/follow-actions";
import type { FollowStatus } from "@/lib/follows";

interface FollowButtonProps {
  targetUserId: string;
  initialStatus: FollowStatus;
  size?: "sm" | "md";
}

export default function FollowButton({
  targetUserId,
  initialStatus,
  size = "sm",
}: FollowButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const prevStatus = status;

    if (status === "none" || status === "following_you") {
      setStatus("pending");
      startTransition(async () => {
        const result = await sendFollowRequest(targetUserId);
        if (result.error) setStatus(prevStatus);
      });
    } else if (status === "pending") {
      setStatus("none");
      startTransition(async () => {
        const result = await cancelFollowRequest(targetUserId);
        if (result.error) setStatus(prevStatus);
      });
    } else if (status === "accepted") {
      setStatus("none");
      startTransition(async () => {
        const result = await unfollowUser(targetUserId);
        if (result.error) setStatus(prevStatus);
      });
    }
  };

  const isSmall = size === "sm";

  if (status === "accepted") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center gap-1 font-medium rounded-full border transition-all group ${
          isSmall
            ? "px-2.5 py-1 text-xs"
            : "px-4 py-2 text-sm"
        } border-[var(--color-brand-primary)]/30 text-[var(--color-brand-primary)] hover:border-red-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-50`}
        title="Unfollow"
      >
        <CheckIcon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
        <span className="group-hover:hidden">Following</span>
        <span className="hidden group-hover:inline">Unfollow</span>
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center gap-1 font-medium rounded-full border transition-all ${
          isSmall
            ? "px-2.5 py-1 text-xs"
            : "px-4 py-2 text-sm"
        } border-[var(--color-border-app-strong)] text-[var(--color-text-secondary)] hover:text-red-500 hover:border-red-300 hover:bg-red-50 disabled:opacity-50`}
        title="Cancel request"
      >
        <ClockIcon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
        <span>Requested</span>
      </button>
    );
  }

  // status === "none" or "following_you"
  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1 font-semibold rounded-full transition-all ${
        isSmall
          ? "px-2.5 py-1 text-xs"
          : "px-4 py-2 text-sm"
      } bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-accent)] shadow-sm disabled:opacity-50`}
      title={status === "following_you" ? "Follow back" : "Follow"}
    >
      <PersonPlusIcon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
      <span>{status === "following_you" ? "Follow Back" : "Follow"}</span>
    </button>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PersonPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 8.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}
