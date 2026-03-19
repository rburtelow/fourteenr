"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function followUser(targetUserId: string, targetUsername: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
    status: "accepted",
  });

  revalidatePath(`/u/${targetUsername}`);
}

export async function unfollowUser(targetUserId: string, targetUsername: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  revalidatePath(`/u/${targetUsername}`);
}

export async function cancelFollowRequest(targetUserId: string, targetUsername: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .eq("status", "pending");

  revalidatePath(`/u/${targetUsername}`);
}
