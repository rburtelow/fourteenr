"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GroupCategory, GroupPrivacy } from "@/lib/groups.types";

const VALID_CATEGORIES: GroupCategory[] = [
  "general", "route", "range", "skill_level", "local_chapter", "trip_planning", "gear", "conditions",
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "group";
}

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a group" };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const categoryRaw = (formData.get("category") as string) || "general";
  const privacyRaw = (formData.get("privacy") as string) || "public";
  const category: GroupCategory = VALID_CATEGORIES.includes(categoryRaw as GroupCategory) ? (categoryRaw as GroupCategory) : "general";
  const privacy: GroupPrivacy = privacyRaw === "private" ? "private" : "public";
  const peakId = (formData.get("peak_id") as string) || null;

  if (!name || name.length < 1 || name.length > 100) {
    return { error: "Group name is required (max 100 characters)" };
  }

  if (description && description.length > 500) {
    return { error: "Description must be 500 characters or less" };
  }

  // Generate slug with collision handling
  const baseSlug = generateSlug(name);
  let finalSlug = baseSlug;
  let attempt = 0;

  while (true) {
    const { data: existing } = await supabase
      .from("groups")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (!existing) break;
    attempt++;
    finalSlug = `${baseSlug}-${attempt}`;
  }

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name,
      slug: finalSlug,
      description,
      category,
      privacy,
      peak_id: peakId || null,
      created_by: user.id,
    })
    .select("id, slug")
    .single();

  if (groupError || !group) {
    console.error("Error creating group:", groupError);
    return { error: "Failed to create group" };
  }

  // Add creator as admin member (triggers member_count increment)
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
    status: "active",
  });

  if (memberError) {
    console.error("Error adding creator as member:", memberError);
    // Group was created, still redirect
  }

  revalidatePath("/groups");
  return { success: true, slug: group.slug };
}

export async function joinGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Check group exists and is public
  const { data: group } = await supabase
    .from("groups")
    .select("id, slug, privacy")
    .eq("id", groupId)
    .single();

  if (!group) return { error: "Group not found" };
  if (group.privacy !== "public") return { error: "This group requires a join request" };

  const { error } = await supabase.from("group_members").upsert(
    { group_id: groupId, user_id: user.id, role: "member", status: "active" },
    { onConflict: "group_id,user_id" }
  );

  if (error) {
    console.error("Error joining group:", error);
    return { error: "Failed to join group" };
  }

  revalidatePath(`/groups/${group.slug}`);
  return { success: true };
}

export async function requestToJoin(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const { data: group } = await supabase
    .from("groups")
    .select("id, slug, privacy")
    .eq("id", groupId)
    .single();

  if (!group) return { error: "Group not found" };

  const { error } = await supabase.from("group_members").upsert(
    { group_id: groupId, user_id: user.id, role: "member", status: "pending" },
    { onConflict: "group_id,user_id" }
  );

  if (error) {
    console.error("Error requesting to join:", error);
    return { error: "Failed to send join request" };
  }

  revalidatePath(`/groups/${group.slug}`);
  return { success: true };
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Check if user is the only admin
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role === "admin") {
    const { count } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("role", "admin")
      .eq("status", "active");

    if ((count ?? 0) <= 1) {
      return { error: "You are the only admin. Transfer the admin role before leaving." };
    }
  }

  const { data: group } = await supabase
    .from("groups")
    .select("slug")
    .eq("id", groupId)
    .single();

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error leaving group:", error);
    return { error: "Failed to leave group" };
  }

  revalidatePath(`/groups/${group?.slug}`);
  revalidatePath("/groups");
  return { success: true };
}

export async function approveMember(memberId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Use security-definer RPC to approve + notify atomically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("approve_group_member", {
    p_member_id: memberId,
  });

  if (error) {
    console.error("Error approving member:", error);
    return { error: "Failed to approve request" };
  }

  const result = data as { success?: boolean; error?: string };
  if (result?.error) return { error: result.error };

  revalidatePath(`/groups/${groupSlug}`);
  return { success: true };
}

export async function denyMember(memberId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Use security-definer RPC to deny
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("deny_group_member", {
    p_member_id: memberId,
  });

  if (error) {
    console.error("Error denying member:", error);
    return { error: "Failed to deny request" };
  }

  const result = data as { success?: boolean; error?: string };
  if (result?.error) return { error: result.error };

  revalidatePath(`/groups/${groupSlug}`);
  return { success: true };
}

// ─── Settings: Update Group Details ───────────────────────────────────────────

export async function updateGroup(groupId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const categoryRaw = (formData.get("category") as string) || "general";
  const privacyRaw = (formData.get("privacy") as string) || "public";
  const category: GroupCategory = VALID_CATEGORIES.includes(categoryRaw as GroupCategory)
    ? (categoryRaw as GroupCategory)
    : "general";
  const privacy: GroupPrivacy = privacyRaw === "private" ? "private" : "public";

  if (!name || name.length < 1 || name.length > 100) {
    return { error: "Group name is required (max 100 characters)" };
  }
  if (description && description.length > 500) {
    return { error: "Description must be 500 characters or less" };
  }

  const { data: existing } = await supabase
    .from("groups")
    .select("id, slug, name")
    .eq("id", groupId)
    .single();

  if (!existing) return { error: "Group not found" };

  let newSlug = existing.slug;

  if (name !== existing.name) {
    const baseSlug = generateSlug(name);
    let attempt = 0;
    newSlug = baseSlug;

    while (true) {
      const { data: conflict } = await supabase
        .from("groups")
        .select("id")
        .eq("slug", newSlug)
        .neq("id", groupId)
        .maybeSingle();

      if (!conflict) break;
      attempt++;
      newSlug = `${baseSlug}-${attempt}`;
    }
  }

  const { error } = await supabase
    .from("groups")
    .update({ name, description, category, privacy, slug: newSlug })
    .eq("id", groupId);

  if (error) {
    console.error("Error updating group:", error);
    return { error: "Failed to save changes" };
  }

  revalidatePath(`/groups/${newSlug}`);
  revalidatePath(`/groups/${existing.slug}`);
  revalidatePath("/groups");
  return { success: true, slug: newSlug };
}

// ─── Settings: Cover Image URL ────────────────────────────────────────────────

export async function updateGroupCoverUrl(groupId: string, coverUrl: string | null, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Verify admin role
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membership?.role !== "admin") return { error: "Only admins can update the cover image" };

  const { error } = await supabase
    .from("groups")
    .update({ cover_image_url: coverUrl })
    .eq("id", groupId);

  if (error) {
    console.error("Error updating cover image:", error);
    return { error: "Failed to save cover image" };
  }

  revalidatePath(`/groups/${groupSlug}`);
  revalidatePath(`/groups/${groupSlug}/settings`);
  return { success: true };
}

// ─── Settings: Member Role Management ─────────────────────────────────────────

export async function updateMemberRole(memberId: string, newRole: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("update_member_role", {
    p_member_id: memberId,
    p_new_role: newRole,
  });

  if (error) {
    console.error("Error updating member role:", error);
    return { error: "Failed to update role" };
  }

  const res = data as { success?: boolean; error?: string };
  if (res?.error) return { error: res.error };

  revalidatePath(`/groups/${groupSlug}/settings`);
  return { success: true };
}

export async function removeMember(memberId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("remove_group_member", {
    p_member_id: memberId,
  });

  if (error) {
    console.error("Error removing member:", error);
    return { error: "Failed to remove member" };
  }

  const res = data as { success?: boolean; error?: string };
  if (res?.error) return { error: res.error };

  revalidatePath(`/groups/${groupSlug}/settings`);
  return { success: true };
}

export async function transferAdmin(groupId: string, targetUserId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("transfer_group_admin", {
    p_group_id: groupId,
    p_target_user_id: targetUserId,
  });

  if (error) {
    console.error("Error transferring admin:", error);
    return { error: "Failed to transfer admin role" };
  }

  const res = data as { success?: boolean; error?: string };
  if (res?.error) return { error: res.error };

  revalidatePath(`/groups/${groupSlug}`);
  revalidatePath(`/groups/${groupSlug}/settings`);
  return { success: true };
}

// ─── Group Feed: Pin / Unpin / Remove Posts ───────────────────────────────────

export async function pinGroupPost(postId: string, groupId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Verify caller is admin/mod
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!membership || !["admin", "moderator"].includes(membership.role)) {
    return { error: "Only admins and moderators can pin posts" };
  }

  // Enforce max 3 pinned posts
  const { count } = await supabase
    .from("group_pinned_posts")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);

  if ((count ?? 0) >= 3) {
    return { error: "Groups can have at most 3 pinned posts. Unpin one first." };
  }

  const { error } = await supabase.from("group_pinned_posts").insert({
    group_id: groupId,
    post_id: postId,
    pinned_by: user.id,
  });

  if (error) {
    console.error("Error pinning post:", error);
    return { error: "Failed to pin post" };
  }

  revalidatePath(`/groups/${groupSlug}`);
  return { success: true };
}

export async function unpinGroupPost(postId: string, groupId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Verify caller is admin/mod
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!membership || !["admin", "moderator"].includes(membership.role)) {
    return { error: "Only admins and moderators can unpin posts" };
  }

  const { error } = await supabase
    .from("group_pinned_posts")
    .delete()
    .eq("group_id", groupId)
    .eq("post_id", postId);

  if (error) {
    console.error("Error unpinning post:", error);
    return { error: "Failed to unpin post" };
  }

  revalidatePath(`/groups/${groupSlug}`);
  return { success: true };
}

export async function removeGroupPost(postId: string, groupId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // Use security-definer RPC to bypass owner-only RLS on community_posts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("remove_group_post", {
    p_post_id: postId,
  });

  if (error) {
    console.error("Error removing post:", error);
    return { error: "Failed to remove post" };
  }

  const result = data as { success?: boolean; error?: string };
  if (result?.error) return { error: result.error };

  revalidatePath(`/groups/${groupSlug}`);
  return { success: true };
}

// ─── Invite to Group ──────────────────────────────────────────────────────────

export async function inviteToGroup(groupId: string, inviteeUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("send_group_invite", {
    p_group_id: groupId,
    p_invitee_id: inviteeUserId,
  });

  if (error) {
    console.error("Error sending invite:", error);
    return { error: "Failed to send invite" };
  }

  const result = data as { success?: boolean; error?: string };
  if (result?.error) return { error: result.error };

  return { success: true };
}

export async function acceptGroupInvite(groupId: string, groupSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("accept_group_invite", {
    p_group_id: groupId,
  });

  if (error) {
    console.error("Error accepting invite:", error);
    return { error: "Failed to accept invite" };
  }

  const result = data as { success?: boolean; error?: string };
  if (result?.error) return { error: result.error };

  revalidatePath(`/groups/${groupSlug}`);
  revalidatePath("/groups");
  return { success: true };
}

export async function dismissGroupInvite(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("group_invites")
    .update({ status: "dismissed" })
    .eq("group_id", groupId)
    .eq("invitee_id", user.id)
    .eq("status", "pending");

  if (error) {
    console.error("Error dismissing invite:", error);
    return { error: "Failed to dismiss invite" };
  }

  return { success: true };
}

export async function getInviteModalData(groupId: string): Promise<{
  following: Array<{ id: string; screen_name: string | null; full_name: string | null; avatar_url: string | null }>;
  memberUserIds: string[];
  invitedUserIds: string[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { following: [], memberUserIds: [], invitedUserIds: [] };

  const [followingData, membersData, invitesData] = await Promise.all([
    supabase
      .from("follows")
      .select("following_id, profiles:following_id (id, screen_name, full_name, avatar_url)")
      .eq("follower_id", user.id)
      .eq("status", "accepted"),
    supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .eq("status", "active"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("group_invites")
      .select("invitee_id")
      .eq("group_id", groupId)
      .eq("status", "pending"),
  ]);

  return {
    following: ((followingData.data || []).map((r: { profiles: unknown }) => r.profiles) as Array<{
      id: string;
      screen_name: string | null;
      full_name: string | null;
      avatar_url: string | null;
    }>).filter(Boolean),
    memberUserIds: (membersData.data || []).map((m: { user_id: string }) => m.user_id),
    invitedUserIds: ((invitesData.data || []) as { invitee_id: string }[]).map((i) => i.invitee_id),
  };
}

// ─── Settings: Delete Group ────────────────────────────────────────────────────

export async function deleteGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId);

  if (error) {
    console.error("Error deleting group:", error);
    return { error: "Failed to delete group. Make sure you are the group admin." };
  }

  revalidatePath("/groups");
  redirect("/groups");
}
