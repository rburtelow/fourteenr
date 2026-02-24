import { createClient } from "@/lib/supabase/server";

export type FollowStatus = "none" | "pending" | "accepted" | "following_you";

export async function getFollowStatus(
  currentUserId: string,
  targetUserId: string
): Promise<FollowStatus> {
  const supabase = await createClient();

  // Check if current user is following target
  const { data: outgoing } = await supabase
    .from("follows")
    .select("status")
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (outgoing) {
    if (outgoing.status === "accepted") return "accepted";
    if (outgoing.status === "pending") return "pending";
  }

  // Check if target is following current user
  const { data: incoming } = await supabase
    .from("follows")
    .select("status")
    .eq("follower_id", targetUserId)
    .eq("following_id", currentUserId)
    .eq("status", "accepted")
    .maybeSingle();

  if (incoming) return "following_you";

  return "none";
}

export async function getFollowers(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("id, follower_id, profiles:follower_id (id, screen_name, full_name, avatar_url)")
    .eq("following_id", userId)
    .eq("status", "accepted");

  return (data || []).map((row) => ({
    followId: row.id,
    ...(row.profiles as unknown as {
      id: string;
      screen_name: string | null;
      full_name: string | null;
      avatar_url: string | null;
    }),
  }));
}

export async function getFollowing(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("following_id, profiles:following_id (id, screen_name, full_name, avatar_url)")
    .eq("follower_id", userId)
    .eq("status", "accepted");

  return (data || []).map((row) => row.profiles) as unknown as {
    id: string;
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }[];
}

export type FollowerUser = Awaited<ReturnType<typeof getFollowers>>[number];
export type FollowingUser = Awaited<ReturnType<typeof getFollowing>>[number];
export type PendingRequest = Awaited<ReturnType<typeof getPendingFollowRequests>>[number];

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId)
    .eq("status", "accepted");

  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId)
    .eq("status", "accepted");

  return count ?? 0;
}

export async function getPendingFollowRequests(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("id, follower_id, created_at, profiles:follower_id (id, screen_name, full_name, avatar_url)")
    .eq("following_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (data || []) as unknown as {
    id: string;
    follower_id: string;
    created_at: string;
    profiles: {
      id: string;
      screen_name: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
  }[];
}

export async function getUniqueFriendsCount(userId: string): Promise<number> {
  const supabase = await createClient();

  // Get user IDs who follow this user (accepted)
  const { data: followerRows } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId)
    .eq("status", "accepted");

  // Get user IDs this user follows (accepted)
  const { data: followingRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .eq("status", "accepted");

  const uniqueIds = new Set<string>();
  for (const row of followerRows || []) uniqueIds.add(row.follower_id);
  for (const row of followingRows || []) uniqueIds.add(row.following_id);

  return uniqueIds.size;
}

export async function getBulkFollowStatuses(
  currentUserId: string,
  userIds: string[]
): Promise<Map<string, FollowStatus>> {
  const result = new Map<string, FollowStatus>();
  if (!userIds.length) return result;

  // Deduplicate and exclude self
  const uniqueIds = [...new Set(userIds)].filter((id) => id !== currentUserId);
  if (!uniqueIds.length) return result;

  const supabase = await createClient();

  // Get all follows where current user is follower
  const { data: outgoing } = await supabase
    .from("follows")
    .select("following_id, status")
    .eq("follower_id", currentUserId)
    .in("following_id", uniqueIds)
    .in("status", ["pending", "accepted"]);

  for (const row of outgoing || []) {
    if (row.status === "accepted") {
      result.set(row.following_id, "accepted");
    } else if (row.status === "pending") {
      result.set(row.following_id, "pending");
    }
  }

  // Get accepted follows where these users follow the current user
  const remainingIds = uniqueIds.filter((id) => !result.has(id));
  if (remainingIds.length) {
    const { data: incoming } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", currentUserId)
      .in("follower_id", remainingIds)
      .eq("status", "accepted");

    for (const row of incoming || []) {
      result.set(row.follower_id, "following_you");
    }
  }

  // Fill remaining with 'none'
  for (const id of uniqueIds) {
    if (!result.has(id)) {
      result.set(id, "none");
    }
  }

  return result;
}
