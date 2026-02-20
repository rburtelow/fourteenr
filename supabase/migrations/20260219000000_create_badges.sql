-- Badge definitions table
CREATE TABLE badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'range', 'difficulty', 'special', 'seasonal', 'dedication')),
  icon_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  unlock_criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User badges table (earned badges)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  trigger_peak_id UUID REFERENCES peaks(id),
  UNIQUE (user_id, badge_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);
CREATE INDEX idx_badge_definitions_category ON badge_definitions(category);
CREATE INDEX idx_badge_definitions_slug ON badge_definitions(slug);

-- Enable RLS
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Badge definitions are readable by everyone
CREATE POLICY "Badge definitions are viewable by everyone"
  ON badge_definitions FOR SELECT
  USING (true);

-- User badges are readable by everyone (public achievements)
CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- Only service role can insert/update badges (via edge function)
CREATE POLICY "Service role can manage user badges"
  ON user_badges FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON badge_definitions TO anon, authenticated;
GRANT SELECT ON user_badges TO anon, authenticated;
