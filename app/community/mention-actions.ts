"use server";

import { createClient, getSessionUser } from "@/lib/supabase/server";
import type { MentionKind } from "@/lib/mentions";

export interface MentionSuggestion {
  kind: MentionKind;
  identifier: string; // slug for peak/trailhead, screen_name for user
  label: string; // primary display text
  secondary?: string | null; // e.g. elevation or @screen_name
  avatarUrl?: string | null; // users only
}

export interface MentionSearchResults {
  peaks: MentionSuggestion[];
  trailheads: MentionSuggestion[];
  users: MentionSuggestion[];
}

const EMPTY: MentionSearchResults = { peaks: [], trailheads: [], users: [] };

// Strip characters that would break PostgREST ilike / .or() filter syntax.
function sanitize(query: string): string {
  return query.replace(/[%,()*]/g, "").trim();
}

/**
 * Search peaks, trailheads, and users for the @-mention autocomplete.
 * User suggestions are limited to the author's accepted follow graph
 * (people they follow + their followers).
 */
export async function searchMentions(
  rawQuery: string,
  kinds: MentionKind[] = ["peak", "trailhead", "user"],
): Promise<MentionSearchResults> {
  const query = sanitize(rawQuery);
  if (query.length === 0) return EMPTY;

  const supabase = await createClient();
  const like = `%${query}%`;

  const wantPeaks = kinds.includes("peak");
  const wantTrailheads = kinds.includes("trailhead");
  const wantUsers = kinds.includes("user");

  const [peaksRes, trailheadsRes, users] = await Promise.all([
    wantPeaks
      ? supabase
          .from("peaks")
          .select("name, slug, elevation")
          .ilike("name", like)
          .order("elevation", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [] as { name: string; slug: string; elevation: number }[] }),
    wantTrailheads
      ? supabase
          .from("trailheads")
          .select("name, slug, nearest_town")
          .ilike("name", like)
          .order("name", { ascending: true })
          .limit(4)
      : Promise.resolve({ data: [] as { name: string; slug: string; nearest_town: string | null }[] }),
    wantUsers ? searchFollowGraphUsers(supabase, query) : Promise.resolve([] as MentionSuggestion[]),
  ]);

  const peaks: MentionSuggestion[] = (peaksRes.data || []).map((p) => ({
    kind: "peak" as const,
    identifier: p.slug,
    label: p.name,
    secondary: p.elevation ? `${p.elevation.toLocaleString()}'` : null,
  }));

  const trailheads: MentionSuggestion[] = (trailheadsRes.data || []).map((t) => ({
    kind: "trailhead" as const,
    identifier: t.slug,
    label: t.name,
    secondary: t.nearest_town ?? null,
  }));

  return { peaks, trailheads, users };
}

async function searchFollowGraphUsers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
): Promise<MentionSuggestion[]> {
  const user = await getSessionUser();
  if (!user) return [];

  // Gather the accepted follow graph (people the user follows + their followers).
  const [followingRes, followersRes] = await Promise.all([
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .eq("status", "accepted"),
    supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", user.id)
      .eq("status", "accepted"),
  ]);

  const graphIds = new Set<string>();
  for (const row of followingRes.data || []) graphIds.add(row.following_id);
  for (const row of followersRes.data || []) graphIds.add(row.follower_id);
  graphIds.delete(user.id);

  if (graphIds.size === 0) return [];

  const like = `%${query}%`;
  const { data } = await supabase
    .from("profiles")
    .select("screen_name, full_name, avatar_url")
    .in("id", [...graphIds])
    .not("screen_name", "is", null)
    .or(`screen_name.ilike.${like},full_name.ilike.${like}`)
    .limit(6);

  return (data || [])
    .filter((p): p is { screen_name: string; full_name: string | null; avatar_url: string | null } =>
      Boolean(p.screen_name),
    )
    .map((p) => ({
      kind: "user" as const,
      identifier: p.screen_name,
      label: p.full_name || p.screen_name,
      secondary: `@${p.screen_name}`,
      avatarUrl: p.avatar_url,
    }));
}
