export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'badge' | 'follow_request' | 'follow_accepted';
  post_id: string | null;
  comment_id: string | null;
  badge_id: string | null;
  follow_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}
