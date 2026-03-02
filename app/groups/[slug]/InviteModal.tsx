"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { inviteToGroup, getInviteModalData } from "../actions";

type FollowingUser = {
  id: string;
  screen_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

interface InviteModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(fullName: string | null, screenName: string | null): string {
  const name = fullName || screenName || "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function InviteModal({ groupId, isOpen, onClose }: InviteModalProps) {
  const [search, setSearch] = useState("");
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [memberUserIds, setMemberUserIds] = useState<Set<string>>(new Set());
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(new Set()); // optimistic accepted

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getInviteModalData(groupId);
    setFollowing(data.following);
    setMemberUserIds(new Set(data.memberUserIds));
    setInvitedUserIds(new Set(data.invitedUserIds));
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSentIds(new Set());
      loadData();
    }
  }, [isOpen, loadData]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    if (!search.trim()) return following;
    const q = search.toLowerCase();
    return following.filter(
      (u) =>
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.screen_name || "").toLowerCase().includes(q)
    );
  }, [following, search]);

  const handleInvite = async (userId: string) => {
    setInviting((prev) => new Set(prev).add(userId));
    const result = await inviteToGroup(groupId, userId);
    setInviting((prev) => {
      const n = new Set(prev);
      n.delete(userId);
      return n;
    });
    if (!result.error) {
      setSentIds((prev) => new Set(prev).add(userId));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-app)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Invite to Group
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people you follow..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-80 px-3 pb-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
              Loading...
            </div>
          ) : following.length === 0 ? (
            <div className="py-10 text-center">
              <UsersIcon className="w-8 h-8 mx-auto text-[var(--color-text-secondary)] opacity-40 mb-2" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                You're not following anyone yet.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
              No matches for "{search}"
            </div>
          ) : (
            filtered.map((user) => {
              const isMember = memberUserIds.has(user.id);
              const isInvited = invitedUserIds.has(user.id) || sentIds.has(user.id);
              const isSending = inviting.has(user.id);
              const displayName = user.full_name || user.screen_name || "Unknown";

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[var(--color-surface-subtle)] transition-colors"
                >
                  {/* Avatar */}
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={displayName}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {getInitials(user.full_name, user.screen_name)}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {displayName}
                    </p>
                    {user.screen_name && user.full_name && (
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">
                        @{user.screen_name}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {isMember ? (
                    <span className="text-xs font-medium text-[var(--color-text-secondary)] px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)]">
                      Member
                    </span>
                  ) : isInvited ? (
                    <span className="text-xs font-medium text-[var(--color-text-secondary)] px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)]">
                      Invited
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInvite(user.id)}
                      disabled={isSending}
                      className="text-xs font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSending ? "Sending..." : "Invite"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
