"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveMember, denyMember } from "@/app/groups/actions";
import type { GroupMember, GroupRole } from "@/lib/groups.types";

interface MemberListProps {
  members: GroupMember[];
  pendingMembers: GroupMember[];
  currentUserRole: GroupRole | null;
  groupSlug: string;
}

const ROLE_BADGE: Record<GroupRole, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-[var(--color-brand-primary)] text-white" },
  moderator: { label: "Mod", className: "bg-amber-100 text-amber-800" },
  member: { label: "", className: "" },
};

function Avatar({ profile }: { profile: GroupMember["profiles"] }) {
  const name = profile.full_name || profile.screen_name || "?";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

function PendingRow({
  member,
  groupSlug,
}: {
  member: GroupMember;
  groupSlug: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);
  const router = useRouter();

  if (done) return null;

  const name = member.profiles.full_name || member.profiles.screen_name || "Unknown";
  const handle = member.profiles.screen_name ? `@${member.profiles.screen_name}` : null;

  const handleApprove = () => {
    setAction("approve");
    startTransition(async () => {
      await approveMember(member.id, groupSlug);
      setDone(true);
      router.refresh();
    });
  };

  const handleDeny = () => {
    setAction("deny");
    startTransition(async () => {
      await denyMember(member.id, groupSlug);
      setDone(true);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--color-border-app)] last:border-0">
      <Avatar profile={member.profiles} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{name}</p>
        {handle && <p className="text-xs text-[var(--color-text-secondary)]">{handle}</p>}
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Requested {new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50"
        >
          {isPending && action === "approve" ? "…" : "Approve"}
        </button>
        <button
          onClick={handleDeny}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border-app)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
        >
          {isPending && action === "deny" ? "…" : "Deny"}
        </button>
      </div>
    </div>
  );
}

export default function MemberList({
  members,
  pendingMembers,
  currentUserRole,
  groupSlug,
}: MemberListProps) {
  const canManage = currentUserRole === "admin" || currentUserRole === "moderator";
  const tabs = ["Members", ...(canManage && pendingMembers.length > 0 ? ["Requests"] : [])];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-[var(--color-brand-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"
            }`}
          >
            {tab}
            {tab === "Requests" && pendingMembers.length > 0 && (
              <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${activeTab === tab ? "bg-white/20" : "bg-amber-100 text-amber-800"}`}>
                {pendingMembers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Members grid */}
      {activeTab === "Members" && (
        <>
          {members.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-8 text-center">No members yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((member) => {
                const name = member.profiles.full_name || member.profiles.screen_name || "Unknown";
                const handle = member.profiles.screen_name ? `@${member.profiles.screen_name}` : null;
                const badge = ROLE_BADGE[member.role];
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-app)] bg-white hover:border-[var(--color-border-app-strong)] transition-colors"
                  >
                    <Avatar profile={member.profiles} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{name}</p>
                        {badge.label && (
                          <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      {handle && (
                        <p className="text-xs text-[var(--color-text-secondary)] truncate">{handle}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Pending requests */}
      {activeTab === "Requests" && canManage && (
        <>
          {pendingMembers.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-8 text-center">No pending requests.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--color-border-app)] px-4">
              {pendingMembers.map((member) => (
                <PendingRow key={member.id} member={member} groupSlug={groupSlug} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
