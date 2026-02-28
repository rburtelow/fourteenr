"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinGroup, requestToJoin, leaveGroup } from "@/app/groups/actions";
import type { GroupPrivacy, MemberStatus, GroupRole } from "@/lib/groups.types";

interface MembershipButtonProps {
  groupId: string;
  groupSlug: string;
  groupPrivacy: GroupPrivacy;
  isLoggedIn: boolean;
  memberStatus: MemberStatus | null;
  memberRole: GroupRole | null;
}

export default function MembershipButton({
  groupId,
  groupSlug,
  groupPrivacy,
  isLoggedIn,
  memberStatus,
  memberRole,
}: MembershipButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <a
        href="/auth/login"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all shadow-sm"
      >
        Sign in to Join
      </a>
    );
  }

  // Already an active member or admin
  if (memberStatus === "active") {
    if (showLeaveConfirm) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-secondary)]">Leave this group?</span>
          <button
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const res = await leaveGroup(groupId);
                if (res.error) {
                  setError(res.error);
                  setShowLeaveConfirm(false);
                } else {
                  router.refresh();
                }
              });
            }}
            className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {isPending ? "Leaving…" : "Leave"}
          </button>
          <button
            onClick={() => setShowLeaveConfirm(false)}
            className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-all"
          >
            Cancel
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)] border border-[var(--color-border-app-strong)]">
          <CheckIcon className="w-4 h-4" />
          {memberRole === "admin" ? "Admin" : memberRole === "moderator" ? "Moderator" : "Member"}
        </span>
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50 border border-[var(--color-border-app)] transition-all"
        >
          Leave
        </button>
      </div>
    );
  }

  // Pending request
  if (memberStatus === "pending") {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200">
          <ClockIcon className="w-4 h-4" />
          Request Pending
        </span>
        <button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await leaveGroup(groupId);
              if (res.error) setError(res.error);
              else router.refresh();
            });
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50 border border-[var(--color-border-app)] transition-all disabled:opacity-50"
        >
          {isPending ? "…" : "Cancel"}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }

  // Not a member — show Join or Request to Join
  if (groupPrivacy === "public") {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await joinGroup(groupId);
              if (res.error) setError(res.error);
              else router.refresh();
            });
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <SpinnerIcon className="w-4 h-4 animate-spin" />
              Joining…
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              Join Group
            </>
          )}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }

  // Private group — request to join
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await requestToJoin(groupId);
            if (res.error) setError(res.error);
            else router.refresh();
          });
        }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all shadow-sm disabled:opacity-50"
      >
        {isPending ? (
          <>
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <LockIcon className="w-4 h-4" />
            Request to Join
          </>
        )}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
