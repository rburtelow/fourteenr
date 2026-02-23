import { createClient } from "@/lib/supabase/server";
import type { CommunityPost, PostComment, CommunityEvent, EventAttendee } from "@/lib/community.types";

export type { CommunityPost, PostComment, CommunityEvent, EventAttendee };

export async function getPosts(options?: {
  filter?: "latest" | "conditions";
  limit?: number;
  cursor?: string;
  userId?: string;
}): Promise<CommunityPost[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = options?.limit ?? 20;

  // Build the base query
  let query = supabase
    .from("community_posts")
    .select(
      `
      id,
      user_id,
      content,
      peak_id,
      is_condition_report,
      image_urls,
      created_at,
      updated_at,
      profiles:user_id (
        screen_name,
        full_name,
        avatar_url
      ),
      peaks:peak_id (
        name,
        slug,
        elevation
      ),
      community_events (
        id
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  // Apply filters
  if (options?.filter === "conditions") {
    query = query.eq("is_condition_report", true);
  }

  // Cursor-based pagination
  if (options?.cursor) {
    query = query.lt("created_at", options.cursor);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  if (!posts || posts.length === 0) {
    return [];
  }

  // Get engagement counts for all posts
  const postIds = posts.map((p) => p.id);

  const [likeCounts, commentCounts, saveCounts, userLikes, userSaves] =
    await Promise.all([
      // Like counts
      supabase
        .from("post_likes")
        .select("post_id")
        .in("post_id", postIds)
        .then(({ data }) => {
          const counts: Record<string, number> = {};
          data?.forEach((like) => {
            counts[like.post_id] = (counts[like.post_id] || 0) + 1;
          });
          return counts;
        }),

      // Comment counts
      supabase
        .from("post_comments")
        .select("post_id")
        .in("post_id", postIds)
        .then(({ data }) => {
          const counts: Record<string, number> = {};
          data?.forEach((comment) => {
            counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
          });
          return counts;
        }),

      // Save counts
      supabase
        .from("post_saves")
        .select("post_id")
        .in("post_id", postIds)
        .then(({ data }) => {
          const counts: Record<string, number> = {};
          data?.forEach((save) => {
            counts[save.post_id] = (counts[save.post_id] || 0) + 1;
          });
          return counts;
        }),

      // User's likes (if logged in)
      user
        ? supabase
            .from("post_likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds)
            .then(({ data }) => new Set(data?.map((l) => l.post_id) || []))
        : Promise.resolve(new Set<string>()),

      // User's saves (if logged in)
      user
        ? supabase
            .from("post_saves")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds)
            .then(({ data }) => new Set(data?.map((s) => s.post_id) || []))
        : Promise.resolve(new Set<string>()),
    ]);

  // Map posts with engagement data
  return posts.map((post) => {
    const rawEvents = post.community_events as { id: string }[] | null;
    return {
      ...post,
      profiles: post.profiles as CommunityPost["profiles"],
      peaks: post.peaks as CommunityPost["peaks"],
      linked_event_id: rawEvents?.[0]?.id ?? null,
      like_count: likeCounts[post.id] || 0,
      comment_count: commentCounts[post.id] || 0,
      save_count: saveCounts[post.id] || 0,
      user_has_liked: userLikes.has(post.id),
      user_has_saved: userSaves.has(post.id),
    };
  });
}

export async function getUpcomingEvents(options?: {
  limit?: number;
  cursor?: string;
  filter?: "upcoming" | "this_week" | "this_month" | "past";
  peakId?: string;
  search?: string;
  sort?: "soonest" | "popular" | "newest";
}): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = options?.limit ?? 20;
  const filter = options?.filter ?? "upcoming";
  const now = new Date().toISOString();

  let query = supabase
    .from("community_events")
    .select(
      `
      id,
      created_by,
      title,
      description,
      event_date,
      end_date,
      location,
      peak_id,
      max_attendees,
      status,
      community_post_id,
      created_at,
      updated_at,
      profiles:created_by (
        screen_name,
        full_name,
        avatar_url
      ),
      peaks:peak_id (
        name,
        slug,
        elevation
      )
    `
    )
    .limit(limit);

  // Time filters
  if (filter === "past") {
    query = query.lt("event_date", now).order("event_date", { ascending: false });
  } else if (filter === "this_week") {
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("event_date", now).lte("event_date", weekFromNow).eq("status", "active").order("event_date", { ascending: true });
  } else if (filter === "this_month") {
    const monthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("event_date", now).lte("event_date", monthFromNow).eq("status", "active").order("event_date", { ascending: true });
  } else {
    // upcoming
    query = query.gte("event_date", now).eq("status", "active").order("event_date", { ascending: true });
  }

  if (options?.peakId) {
    query = query.eq("peak_id", options.peakId);
  }

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,location.ilike.%${options.search}%`);
  }

  if (options?.cursor) {
    if (filter === "past") {
      query = query.lt("event_date", options.cursor);
    } else {
      query = query.gt("event_date", options.cursor);
    }
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  if (!events || events.length === 0) {
    return [];
  }

  const eventIds = events.map((e) => e.id);

  const [attendeeCounts, userRsvps] = await Promise.all([
    supabase
      .from("event_attendees")
      .select("event_id")
      .in("event_id", eventIds)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach((a) => {
          counts[a.event_id] = (counts[a.event_id] || 0) + 1;
        });
        return counts;
      }),
    user
      ? supabase
          .from("event_attendees")
          .select("event_id")
          .eq("user_id", user.id)
          .in("event_id", eventIds)
          .then(({ data }) => new Set(data?.map((a) => a.event_id) || []))
      : Promise.resolve(new Set<string>()),
  ]);

  const mapped = events.map((event) => ({
    ...event,
    profiles: event.profiles as CommunityEvent["profiles"],
    peaks: event.peaks as CommunityEvent["peaks"],
    status: event.status as CommunityEvent["status"],
    attendee_count: attendeeCounts[event.id] || 0,
    user_has_rsvpd: userRsvps.has(event.id),
  }));

  // Post-query sort for "popular" and "newest"
  if (options?.sort === "popular") {
    mapped.sort((a, b) => b.attendee_count - a.attendee_count);
  } else if (options?.sort === "newest") {
    mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return mapped;
}

export async function getEventById(eventId: string): Promise<CommunityEvent | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("community_events")
    .select(
      `
      id,
      created_by,
      title,
      description,
      event_date,
      end_date,
      location,
      peak_id,
      max_attendees,
      status,
      community_post_id,
      created_at,
      updated_at,
      profiles:created_by (
        screen_name,
        full_name,
        avatar_url
      ),
      peaks:peak_id (
        name,
        slug,
        elevation
      )
    `
    )
    .eq("id", eventId)
    .single();

  if (error || !event) {
    return null;
  }

  const [attendeeCount, userRsvp] = await Promise.all([
    supabase
      .from("event_attendees")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .then(({ count }) => count ?? 0),
    user
      ? supabase
          .from("event_attendees")
          .select("id")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => Boolean(data))
      : Promise.resolve(false),
  ]);

  return {
    ...event,
    profiles: event.profiles as CommunityEvent["profiles"],
    peaks: event.peaks as CommunityEvent["peaks"],
    status: event.status as CommunityEvent["status"],
    attendee_count: attendeeCount,
    user_has_rsvpd: userRsvp,
  };
}

export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_attendees")
    .select(
      `
      id,
      event_id,
      user_id,
      created_at,
      profiles:user_id (
        screen_name,
        full_name,
        avatar_url
      )
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching event attendees:", error);
    return [];
  }

  return (data || []).map((a) => ({
    ...a,
    profiles: a.profiles as EventAttendee["profiles"],
  }));
}

export async function getPostComments(postId: string): Promise<PostComment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `
      id,
      post_id,
      user_id,
      content,
      created_at,
      profiles:user_id (
        screen_name,
        full_name,
        avatar_url
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return (data || []).map((comment) => ({
    ...comment,
    profiles: comment.profiles as PostComment["profiles"],
  }));
}

