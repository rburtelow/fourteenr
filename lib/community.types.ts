// Shared types for community features - safe to import in both server and client components

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  peak_id: string | null;
  is_condition_report: boolean;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  profiles: {
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  peaks: {
    name: string;
    slug: string;
    elevation: number;
  } | null;
  linked_event_id: string | null;
  like_count: number;
  comment_count: number;
  save_count: number;
  user_has_liked: boolean;
  user_has_saved: boolean;
  activity_type: 'summit_log' | 'badge_earned' | null;
  activity_metadata: {
    // summit_log fields
    route_name?: string | null;
    summit_date?: string;
    trip_report_id?: string | null;
    // badge_earned fields
    badge_id?: string;
    badge_slug?: string | null;
    badge_name?: string | null;
    badge_icon_name?: string | null;
    badge_description?: string | null;
    badge_category?: string | null;
  } | null;
}

export interface CommunityEvent {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string;
  peak_id: string | null;
  group_id: string | null;
  max_attendees: number | null;
  status: "active" | "cancelled" | "completed";
  community_post_id: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  peaks: {
    name: string;
    slug: string;
    elevation: number;
  } | null;
  groups: {
    id: string;
    name: string;
    slug: string;
  } | null;
  attendee_count: number;
  user_has_rsvpd: boolean;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  profiles: {
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}
