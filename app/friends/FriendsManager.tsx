"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { FollowerUser, FollowingUser, PendingRequest } from "@/lib/follows";
import {
  acceptFollowRequest,
  rejectFollowRequest,
  removeFollower,
  unfollowUser,
} from "@/app/community/follow-actions";

type Tab = "requests" | "followers" | "following";

interface FriendsManagerProps {
  initialRequests: PendingRequest[];
  initialFollowers: FollowerUser[];
  initialFollowing: FollowingUser[];
}

export default function FriendsManager({
  initialRequests,
  initialFollowers,
  initialFollowing,
}: FriendsManagerProps) {
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState(initialRequests);
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  function handleAccept(followId: string) {
    setActionId(followId);
    const request = requests.find((r) => r.id === followId);
    setRequests((prev) => prev.filter((r) => r.id !== followId));
    if (request) {
      setFollowers((prev) => [
        {
          followId: request.id,
          id: request.profiles.id,
          screen_name: request.profiles.screen_name,
          full_name: request.profiles.full_name,
          avatar_url: request.profiles.avatar_url,
        },
        ...prev,
      ]);
    }
    startTransition(async () => {
      const result = await acceptFollowRequest(followId);
      if (result.error) {
        setRequests(initialRequests);
        setFollowers(initialFollowers);
      }
      setActionId(null);
    });
  }

  function handleReject(followId: string) {
    setActionId(followId);
    setRequests((prev) => prev.filter((r) => r.id !== followId));
    startTransition(async () => {
      const result = await rejectFollowRequest(followId);
      if (result.error) {
        setRequests(initialRequests);
      }
      setActionId(null);
    });
  }

  function handleRemoveFollower(followId: string) {
    setActionId(followId);
    setFollowers((prev) => prev.filter((f) => f.followId !== followId));
    startTransition(async () => {
      const result = await removeFollower(followId);
      if (result.error) {
        setFollowers(initialFollowers);
      }
      setActionId(null);
    });
  }

  function handleUnfollow(userId: string) {
    setActionId(userId);
    setFollowing((prev) => prev.filter((f) => f.id !== userId));
    startTransition(async () => {
      const result = await unfollowUser(userId);
      if (result.error) {
        setFollowing(initialFollowing);
      }
      setActionId(null);
    });
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "requests", label: "Requests", count: requests.length },
    { key: "followers", label: "Followers", count: followers.length },
    { key: "following", label: "Following", count: following.length },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center gap-2 p-4 sm:p-6 border-b border-[var(--color-border-app)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
              tab === t.key
                ? "text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  tab === t.key && t.key === "requests"
                    ? "bg-[var(--color-brand-primary)] text-white"
                    : tab === t.key
                    ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]"
                    : "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {tab === "requests" && (
        <div>
          {requests.length === 0 ? (
            <EmptyState
              icon={<UsersIcon />}
              title="No pending requests"
              description="When someone sends you a follow request, it will appear here."
            />
          ) : (
            <div className="divide-y divide-[var(--color-border-app)]">
              {requests.map((req) => (
                <UserRow
                  key={req.id}
                  name={req.profiles.full_name || req.profiles.screen_name || "Unknown"}
                  screenName={req.profiles.screen_name}
                  avatarUrl={req.profiles.avatar_url}
                  disabled={isPending && actionId === req.id}
                  actions={
                    <>
                      <button
                        onClick={() => handleAccept(req.id)}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50 shadow-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border-app-strong)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Followers Tab */}
      {tab === "followers" && (
        <div>
          {followers.length === 0 ? (
            <EmptyState
              icon={<UsersIcon />}
              title="No followers yet"
              description="Share your profile to get followers and build your hiking community."
            />
          ) : (
            <div className="divide-y divide-[var(--color-border-app)]">
              {followers.map((f) => (
                <UserRow
                  key={f.followId}
                  name={f.full_name || f.screen_name || "Unknown"}
                  screenName={f.screen_name}
                  avatarUrl={f.avatar_url}
                  disabled={isPending && actionId === f.followId}
                  actions={
                    <button
                      onClick={() => handleRemoveFollower(f.followId)}
                      disabled={isPending}
                      className="px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border-app-strong)] rounded-xl hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      Remove
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Following Tab */}
      {tab === "following" && (
        <div>
          {following.length === 0 ? (
            <EmptyState
              icon={<UsersIcon />}
              title="Not following anyone"
              description="Find hikers in the community to follow and see their summit updates."
              action={
                <Link
                  href="/community"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all shadow-sm"
                >
                  Explore Community
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-[var(--color-border-app)]">
              {following.map((f) => (
                <UserRow
                  key={f.id}
                  name={f.full_name || f.screen_name || "Unknown"}
                  screenName={f.screen_name}
                  avatarUrl={f.avatar_url}
                  disabled={isPending && actionId === f.id}
                  actions={
                    <button
                      onClick={() => handleUnfollow(f.id)}
                      disabled={isPending}
                      className="px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border-app-strong)] rounded-xl hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      Unfollow
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserRow({
  name,
  screenName,
  avatarUrl,
  actions,
  disabled,
}: {
  name: string;
  screenName: string | null;
  avatarUrl: string | null;
  actions: React.ReactNode;
  disabled?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-center gap-4 p-4 sm:px-6 hover:bg-[var(--color-surface-subtle)]/50 transition-colors ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--color-text-primary)] truncate">{name}</p>
        {screenName && (
          <p className="text-sm text-[var(--color-text-secondary)] truncate">@{screenName}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-10 text-center">
      <div className="text-[var(--color-text-secondary)] opacity-40 mb-3 flex justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-sm mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}

function UsersIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}
