"use client";

import { useState, useTransition } from "react";
import type { FollowStatus } from "@/lib/follows";
import { followUser, unfollowUser, cancelFollowRequest } from "./actions";

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

export default function FollowButton({
  targetUserId,
  targetUsername,
  initialStatus,
}: {
  targetUserId: string;
  targetUsername: string;
  initialStatus: FollowStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (status === "accepted") {
        setStatus("none");
        await unfollowUser(targetUserId, targetUsername);
      } else if (status === "pending") {
        setStatus("none");
        await cancelFollowRequest(targetUserId, targetUsername);
      } else {
        setStatus("accepted");
        await followUser(targetUserId, targetUsername);
      }
    });
  }

  const label =
    status === "accepted"
      ? "Following"
      : status === "pending"
      ? "Requested"
      : status === "following_you"
      ? "Follow Back"
      : "Follow";

  const className = `flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
    status === "accepted"
      ? "text-[var(--color-brand-primary)] border-2 border-[var(--color-border-app-strong)] hover:bg-[var(--color-surface-subtle)]"
      : status === "pending"
      ? "text-[var(--color-text-secondary)] border-2 border-[var(--color-border-app-strong)] hover:bg-[var(--color-surface-subtle)]"
      : "text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] shadow-lg shadow-[var(--color-brand-primary)]/20"
  }`;

  return (
    <button onClick={handleClick} disabled={isPending} className={className}>
      <UserPlusIcon className="w-4 h-4" />
      {label}
    </button>
  );
}
