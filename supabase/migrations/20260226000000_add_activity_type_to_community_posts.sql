-- activity_type: NULL = regular user post, 'summit_log' = auto-post from summit, 'badge_earned' = auto-post from badge
ALTER TABLE public.community_posts
  ADD COLUMN activity_type text DEFAULT NULL
  CHECK (activity_type IS NULL OR activity_type IN ('summit_log', 'badge_earned'));

-- activity_metadata: structured data so frontend doesn't parse content strings
ALTER TABLE public.community_posts
  ADD COLUMN activity_metadata jsonb DEFAULT NULL;

-- Index for filtering
CREATE INDEX idx_community_posts_activity_type
  ON public.community_posts(activity_type)
  WHERE activity_type IS NOT NULL;
