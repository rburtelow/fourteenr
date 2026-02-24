"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendFollowRequest(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };
  if (user.id === targetUserId) return { error: "Cannot follow yourself" };

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  if (error) {
    if (error.code === "23505") return { error: "Follow request already sent" };
    return { error: error.message };
  }

  return { success: true };
}

export async function cancelFollowRequest(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { success: true };
}

export async function acceptFollowRequest(followId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const { error } = await supabase
    .from("follows")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", followId)
    .eq("following_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectFollowRequest(followId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("id", followId)
    .eq("following_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function removeFollower(followId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("id", followId)
    .eq("following_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) return { error: error.message };
  return { success: true };
}
