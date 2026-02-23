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
  like_count: number;
  comment_count: number;
  save_count: number;
  user_has_liked: boolean;
  user_has_saved: boolean;
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
