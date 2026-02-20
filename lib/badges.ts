import { createClient } from "./supabase/server";
import type { BadgeDefinition, UserBadgeWithDefinition } from "./database.types";

/**
 * Get all badge definitions ordered by sort_order
 */
export async function getAllBadges(): Promise<BadgeDefinition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("badge_definitions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching badges:", error);
    return [];
  }

  return (data || []) as BadgeDefinition[];
}

/**
 * Get all badges earned by a specific user
 */
export async function getUserBadges(userId: string): Promise<UserBadgeWithDefinition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_badges")
    .select(`
      *,
      badge_definitions (*)
    `)
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }

  return (data || []) as UserBadgeWithDefinition[];
}

/**
 * Get recent badges earned across all users (for community feed)
 */
export async function getRecentBadges(limit: number = 10): Promise<
  (UserBadgeWithDefinition & { profiles: { screen_name: string | null; avatar_url: string | null } })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_badges")
    .select(`
      *,
      badge_definitions (*),
      profiles (screen_name, avatar_url)
    `)
    .order("earned_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent badges:", error);
    return [];
  }

  return (data || []) as (UserBadgeWithDefinition & {
    profiles: { screen_name: string | null; avatar_url: string | null };
  })[];
}

/**
 * Get badge definitions by category
 */
export async function getBadgesByCategory(
  category: BadgeDefinition["category"]
): Promise<BadgeDefinition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("badge_definitions")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching badges by category:", error);
    return [];
  }

  return (data || []) as BadgeDefinition[];
}

/**
 * Get count of earned badges for a user
 */
export async function getUserBadgeCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("user_badges")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching badge count:", error);
    return 0;
  }

  return count || 0;
}
