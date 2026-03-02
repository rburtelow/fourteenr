"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  updateGroup,
  updateGroupCoverUrl,
  updateMemberRole,
  removeMember,
  transferAdmin,
  deleteGroup,
} from "@/app/groups/actions";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/groups.types";
import type { Group, GroupMember, GroupCategory } from "@/lib/groups.types";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [GroupCategory, string][];

interface Props {
  group: Group;
  members: GroupMember[];
  currentUserId: string;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function Avatar({ profile }: { profile: GroupMember["profiles"] }) {
  const name = profile.full_name || profile.screen_name || "?";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  if (profile.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.avatar_url} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{message}</div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app-strong)] text-[var(--color-brand-primary)] text-sm font-medium">{message}</div>
  );
}

// ─── Cover Image Upload ────────────────────────────────────────────────────────

const TARGET_W = 1200;
const TARGET_H = 400;

async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_W;
      canvas.height = TARGET_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas unavailable")); return; }

      // Center-crop to 3:1 ratio
      const targetRatio = TARGET_W / TARGET_H;
      const imgRatio = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

function CoverImageSection({ group }: { group: Group }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSaved(false);
    try {
      const blob = await resizeImage(file);
      setPendingBlob(blob);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setError("Could not process image. Please try a different file.");
    }
  }, []);

  const handleUpload = async () => {
    if (!pendingBlob) return;
    setUploading(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const path = `${group.id}/cover.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("group-covers")
      .upload(path, pendingBlob, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) {
      setError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("group-covers")
      .getPublicUrl(path);

    // Bust cache by appending timestamp
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;
    const res = await updateGroupCoverUrl(group.id, urlWithBust, group.slug);

    if (res.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setPendingBlob(null);
      setPreview(null);
      router.refresh();
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    setError(null);
    setSaved(false);
    const res = await updateGroupCoverUrl(group.id, null, group.slug);
    if (res.error) {
      setError(res.error);
    } else {
      setSaved(true);
      router.refresh();
    }
  };

  const gradientClass = CATEGORY_COLORS[group.category] ?? "from-slate-500 to-slate-700";
  const currentCover = preview ?? group.cover_image_url;

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
        Cover Image
      </label>
      <p className="text-xs text-[var(--color-text-secondary)] mb-3">
        Recommended: 1200×400 px. Images will be cropped to fit.
      </p>

      {/* Preview */}
      <div
        className={`relative h-32 rounded-xl overflow-hidden bg-gradient-to-br ${gradientClass} mb-3`}
      >
        {currentCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentCover}
            alt="Cover preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!currentCover && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/60 text-xs font-medium">Default gradient (no image)</p>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} />}
      {saved && !error && <SuccessBanner message="Cover image saved." />}

      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] hover:border-[var(--color-border-app-strong)] transition-all"
        >
          {currentCover ? "Change Image" : "Upload Image"}
        </button>

        {pendingBlob && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Save Cover"}
          </button>
        )}

        {group.cover_image_url && !pendingBlob && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            Remove
          </button>
        )}

        {pendingBlob && (
          <button
            type="button"
            onClick={() => { setPreview(null); setPendingBlob(null); }}
            className="px-3 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"
          >
            Cancel
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ─── Tab: Details ─────────────────────────────────────────────────────────────

function DetailsTab({ group }: { group: Group }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [privacy, setPrivacy] = useState<"public" | "private">(group.privacy);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    formData.set("privacy", privacy);

    startTransition(async () => {
      const res = await updateGroup(group.id, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
        // If slug changed, navigate to new URL
        if (res.slug && res.slug !== group.slug) {
          router.push(`/groups/${res.slug}/settings`);
        } else {
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="space-y-5">
      <CoverImageSection group={group} />

      <form onSubmit={handleSubmit} className="space-y-5">
      {error && <ErrorBanner message={error} />}
      {saved && !error && <SuccessBanner message="Changes saved." />}

      <div>
        <label htmlFor="s-name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          Group Name <span className="text-red-500">*</span>
        </label>
        <input
          id="s-name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={group.name}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-colors"
        />
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Changing the name will update the group URL.</p>
      </div>

      <div>
        <label htmlFor="s-description" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          Description
        </label>
        <textarea
          id="s-description"
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={group.description ?? ""}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] resize-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="s-category" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          Category
        </label>
        <select
          id="s-category"
          name="category"
          defaultValue={group.category}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] transition-colors"
        >
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Privacy</p>
        <div className="grid grid-cols-2 gap-3">
          {(["public", "private"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrivacy(p)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                privacy === p
                  ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5"
                  : "border-[var(--color-border-app)] bg-[var(--color-surface-subtle)] hover:border-[var(--color-border-app-strong)]"
              }`}
            >
              {p === "public" ? <GlobeIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" /> : <LockIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />}
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] capitalize">{p}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {p === "public" ? "Anyone can join and see posts" : "Members must request to join"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-accent)] transition-all disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
    </div>
  );
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MemberRow({
  member,
  isCurrentUser,
  isAdmin,
  groupId,
  groupSlug,
}: {
  member: GroupMember;
  isCurrentUser: boolean;
  isAdmin: boolean;
  groupId: string;
  groupSlug: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [currentRole, setCurrentRole] = useState(member.role);

  if (removed) return null;

  const name = member.profiles.full_name || member.profiles.screen_name || "Unknown";
  const handle = member.profiles.screen_name ? `@${member.profiles.screen_name}` : null;

  const handleRoleChange = (newRole: string) => {
    if (newRole === currentRole) return;
    setError(null);
    startTransition(async () => {
      const res = await updateMemberRole(member.id, newRole, groupSlug);
      if (res.error) setError(res.error);
      else {
        setCurrentRole(newRole as typeof currentRole);
        router.refresh();
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      const res = await removeMember(member.id, groupSlug);
      if (res.error) setError(res.error);
      else {
        setRemoved(true);
        router.refresh();
      }
    });
  };

  const handleTransfer = () => {
    setError(null);
    startTransition(async () => {
      const res = await transferAdmin(groupId, member.user_id, groupSlug);
      if (res.error) setError(res.error);
      else {
        setShowTransfer(false);
        router.push(`/groups/${groupSlug}`);
      }
    });
  };

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[var(--color-border-app)] last:border-0">
      <Avatar profile={member.profiles} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{name}</p>
          {isCurrentUser && (
            <span className="text-xs text-[var(--color-text-secondary)] italic">(you)</span>
          )}
        </div>
        {handle && <p className="text-xs text-[var(--color-text-secondary)]">{handle}</p>}
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Role selector — only admin can change roles; skip current user */}
        {isAdmin && !isCurrentUser && member.role !== "admin" && (
          <select
            value={currentRole}
            disabled={isPending}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-border-app)] bg-white text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]/30 disabled:opacity-50 cursor-pointer"
          >
            <option value="member">Member</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        )}

        {/* Transfer admin for admin-to-admin rows */}
        {isAdmin && !isCurrentUser && member.role !== "admin" && (
          <>
            {showTransfer ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--color-text-secondary)]">Transfer admin?</span>
                <button
                  disabled={isPending}
                  onClick={handleTransfer}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all disabled:opacity-50"
                >
                  {isPending ? "…" : "Confirm"}
                </button>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="px-2 py-1.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </>
        )}

        {/* Remove button */}
        {!isCurrentUser && member.role !== "admin" && (
          <button
            disabled={isPending}
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
            title="Remove member"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}

        {/* Admin badge (non-interactive) */}
        {member.role === "admin" && (
          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-[var(--color-brand-primary)] text-white">
            Admin
          </span>
        )}
      </div>
    </div>
  );
}

function TransferAdminSection({
  members,
  groupId,
  groupSlug,
  currentUserId,
}: {
  members: GroupMember[];
  groupId: string;
  groupSlug: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [targetId, setTargetId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const eligibleMembers = members.filter(
    (m) => m.user_id !== currentUserId && m.status === "active" && m.role !== "admin"
  );

  if (eligibleMembers.length === 0) return null;

  const handleTransfer = () => {
    if (!targetId) return;
    setError(null);
    startTransition(async () => {
      const res = await transferAdmin(groupId, targetId, groupSlug);
      if (res.error) setError(res.error);
      else router.push(`/groups/${groupSlug}`);
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-[var(--color-border-app)]">
      <SectionHeader
        title="Transfer Admin Role"
        subtitle="Hand over group ownership to another member. You will become a regular member."
      />
      {error && <ErrorBanner message={error} />}
      <div className="flex items-center gap-3 mt-3">
        <select
          value={targetId}
          onChange={(e) => { setTargetId(e.target.value); setShowConfirm(false); }}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
        >
          <option value="">Select a member…</option>
          {eligibleMembers.map((m) => {
            const label = m.profiles.full_name || m.profiles.screen_name || m.user_id;
            return <option key={m.user_id} value={m.user_id}>{label}</option>;
          })}
        </select>
        {!showConfirm ? (
          <button
            disabled={!targetId}
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-40"
          >
            Transfer
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-secondary)]">Are you sure?</span>
            <button
              disabled={isPending}
              onClick={handleTransfer}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all disabled:opacity-50"
            >
              {isPending ? "Transferring…" : "Yes, transfer"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-2 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MembersTab({
  members,
  groupId,
  groupSlug,
  currentUserId,
}: {
  members: GroupMember[];
  groupId: string;
  groupSlug: string;
  currentUserId: string;
}) {
  return (
    <div>
      <SectionHeader
        title="Members"
        subtitle="Manage roles and remove members. Admins cannot be removed — transfer the role first."
      />
      <div className="bg-[var(--color-surface-subtle)] rounded-2xl border border-[var(--color-border-app)] px-4">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            isCurrentUser={member.user_id === currentUserId}
            isAdmin={true}
            groupId={groupId}
            groupSlug={groupSlug}
          />
        ))}
      </div>
      <TransferAdminSection
        members={members}
        groupId={groupId}
        groupSlug={groupSlug}
        currentUserId={currentUserId}
      />
    </div>
  );
}

// ─── Tab: Danger Zone ─────────────────────────────────────────────────────────

function DangerTab({ group }: { group: Group }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmed = confirmText === group.name;

  const handleDelete = () => {
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteGroup(group.id);
      if (res?.error) setError(res.error);
      // On success, deleteGroup redirects to /groups
    });
  };

  return (
    <div>
      <SectionHeader title="Danger Zone" subtitle="These actions are permanent and cannot be undone." />

      <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-800">Delete This Group</p>
            <p className="text-sm text-red-700 mt-1">
              All posts, members, and settings will be permanently removed. This cannot be undone.
            </p>
          </div>
          {!showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-red-700 border border-red-300 hover:bg-red-100 transition-all"
            >
              Delete Group
            </button>
          )}
        </div>

        {showConfirm && (
          <div className="mt-4 pt-4 border-t border-red-200 space-y-3">
            {error && <ErrorBanner message={error} />}
            <div>
              <label className="block text-sm font-medium text-red-800 mb-1.5">
                Type <span className="font-bold">{group.name}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={group.name}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-red-200 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={!confirmed || isPending}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-40"
              >
                {isPending ? "Deleting…" : "Permanently Delete Group"}
              </button>
              <button
                onClick={() => { setShowConfirm(false); setConfirmText(""); setError(null); }}
                className="px-4 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root Component ────────────────────────────────────────────────────────────

type Tab = "Details" | "Members" | "Danger Zone";

export default function GroupSettingsClient({ group, members, currentUserId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Details");

  const tabs: Tab[] = ["Details", "Members", "Danger Zone"];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[var(--color-border-app)] mb-8 -mx-6 sm:-mx-8 px-6 sm:px-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            } ${tab === "Danger Zone" ? "ml-auto" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Details" && <DetailsTab group={group} />}
      {activeTab === "Members" && (
        <MembersTab
          members={members}
          groupId={group.id}
          groupSlug={group.slug}
          currentUserId={currentUserId}
        />
      )}
      {activeTab === "Danger Zone" && <DangerTab group={group} />}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
