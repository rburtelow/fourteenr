import { createClient } from "@/lib/supabase/server";
import type { Notification } from "./notifications.types";

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      actor_id,
      type,
      post_id,
      comment_id,
      badge_id,
      message,
      is_read,
      created_at,
      actor:actor_id (
        screen_name,
        full_name,
        avatar_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return (data || []) as unknown as Notification[];
}
