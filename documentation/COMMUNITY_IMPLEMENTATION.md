# Community Page Implementation Plan

This document catalogs every piece of placeholder/dummy data and non-functional UI in the `app/community/` directory, and provides a phased implementation plan to make it real.

---

## Current State

The community page (`app/community/page.tsx`) renders a three-column layout with a social feed. The **left sidebar** shows a user profile card, quick links, and trending peaks. The **center column** contains a post composer and feed (via `CommunityFeed.tsx`). The **right sidebar** shows peaks watched (functional via `PeaksWatchedPanel.tsx`), recent badges (functional via `getRecentBadges`), upcoming events, and a weather widget.

### What Already Works
- **User profile card** — pulls real data from `profiles` and `summit_logs`
- **Peaks Watched panel** — reads/writes `peak_watchlist` with optimistic UI
- **Recent Badges panel** — queries `user_badges` joined with `badge_definitions` and `profiles`
- **Navigation/auth** — `UserNav`, `MobileNav`, sign-in flows are functional

### What Is Placeholder
Everything below uses hardcoded data or non-functional buttons.

---

## Placeholder Inventory

### 1. Feed Posts (Critical)
**Location:** `page.tsx` lines 12–55, rendered by `CommunityFeed.tsx`
**What's fake:** The `feedPosts` array contains 3 hardcoded posts with invented authors ("Sarah Chen", "Marcus Reid", "Elena Voss"), handles, content, and engagement counts. Post images all reference `/hero.png`.
**Needed:** A `community_posts` table and full CRUD.

### 2. Post Composer (Critical)
**Location:** `CommunityFeed.tsx` lines 88–117
**What's fake:** The textarea, image/location/peak attachment buttons, and "Post" button are entirely non-functional. No form submission, no server action, no image upload.
**Needed:** Server action for post creation, Supabase Storage bucket for images, peak-linking UI.

### 3. Post Engagement — Likes, Comments, Saves (Critical)
**Location:** `CommunityFeed.tsx` lines 191–241
**What's fake:** Like and comment buttons display hardcoded counts but do nothing on click. The save/bookmark button only works for peak watchlist toggling (not post saving). Comment count is static — there's no comment thread UI.
**Needed:** `post_likes`, `post_comments`, `post_saves` tables with toggle actions and optimistic UI.

### 4. Feed Filtering Tabs (Medium)
**Location:** `page.tsx` lines 201–209
**What's fake:** "Latest", "Following", and "Conditions" tab buttons are styled but have no active state logic and don't filter posts. "Following" is visually selected by default via static CSS class.
**Needed:** URL-based or state-based filter that queries posts by recency, followed users, or `is_condition_report` flag.

### 5. "Load More Stories" Button (Medium)
**Location:** `CommunityFeed.tsx` lines 247–251
**What's fake:** Button renders but has no onClick handler. No pagination or infinite scroll implemented.
**Needed:** Cursor-based pagination on the posts query.

### 6. Trending Peaks Sidebar (Medium)
**Location:** `page.tsx` lines 57–61, rendered lines 298–322
**What's fake:** `trendingPeaks` array is hardcoded with 3 peaks, fake report counts, and fake trend percentages.
**Needed:** A query that counts recent summit logs or condition reports per peak over the last 7 days, compared to the prior period, sorted by volume.

### 7. Quick Links Sidebar (Medium)
**Location:** `page.tsx` lines 285–295
**What's fake:** "Groups" count hardcoded to 4, "Events" to 2, "Saved" to 18. All buttons are non-functional (no navigation, no onClick).
**Needed:** Real counts from respective tables. "Peaks Watched" count is already real. Buttons should navigate to filtered views or scroll to relevant sections.

### 8. Upcoming Events Sidebar (Low — Feature Expansion)
**Location:** `page.tsx` lines 63–66, rendered lines 388–419
**What's fake:** `upcomingEvents` array has 2 hardcoded events with fake dates, locations, and attendee counts. "View All Events" button does nothing.
**Needed:** `community_events` and `event_attendees` tables, event creation UI, RSVP toggle.

### 9. Notification Bell (Low — Feature Expansion)
**Location:** `page.tsx` lines 172–179
**What's fake:** Bell icon shows a hardcoded "3" badge. Button has no dropdown, no notification list, no link to a notifications page.
**Needed:** `notifications` table, notification generation triggers, a dropdown or page to view them.

### 10. Weather Widget (Low — Can Leverage Existing)
**Location:** `page.tsx` lines 422–437
**What's fake:** Hardcoded "28°", "Winds 25-35 mph", "Clear skies" for "Mt. Elbert summit forecast". No connection to the existing `peak_forecasts` table.
**Needed:** Query `peak_forecasts` for a relevant peak (user's most-watched, or highest-traffic). The `adjusted_forecast` JSONB column already contains elevation-adjusted weather data.

### 11. Post Author Avatars
**Location:** `CommunityFeed.tsx` lines 134–136
**What's fake:** Avatars render as 2-letter initials from the mock data's `avatar` field ("SC", "MR", "EV") with a gradient background. No real profile images.
**Needed:** Once posts come from the DB with a `profiles` join, use `avatar_url` from the profile (with initials as fallback, which is already the pattern used in the profile card).

---

## Database Schema

### New Tables Required

```sql
-- Community posts (feed items)
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  peak_id UUID REFERENCES peaks(id) ON DELETE SET NULL,
  is_condition_report BOOLEAN NOT NULL DEFAULT false,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_peak ON community_posts(peak_id) WHERE peak_id IS NOT NULL;
CREATE INDEX idx_community_posts_conditions ON community_posts(created_at DESC) WHERE is_condition_report = true;

-- Post likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

-- Post comments
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id, created_at);

-- Post saves/bookmarks
CREATE TABLE post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

-- User follows (needed for "Following" feed filter)
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Community events
CREATE TABLE community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  peak_id UUID REFERENCES peaks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_events_date ON community_events(event_date) WHERE event_date > now();

-- Event attendees
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'event_reminder', 'badge_earned'
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
```

### RLS Policies

All tables should follow the project's existing patterns:
- **Posts:** Public read, authenticated users can insert their own, users can update/delete their own
- **Likes/Saves/Follows:** Public read (for counts), users can insert/delete their own
- **Comments:** Public read, users can insert their own, users can update/delete their own
- **Events:** Public read, creator can update/delete
- **Event attendees:** Public read, users can insert/delete their own
- **Notifications:** Users can only read/update their own

---

## Implementation Phases

### Phase 1 — Posts & Feed (Core Loop)

**Goal:** Replace mock `feedPosts` with real data from the database.

**Migration:**
- Create `community_posts` table with RLS

**Server Actions** (`app/community/actions.ts`):
- `createPost(formData)` — insert into `community_posts`, revalidate `/community`
- `deletePost(postId)` — delete own post

**Data Fetching** (in `page.tsx`):
- Replace `feedPosts` constant with a Supabase query:
  ```
  community_posts(*, profiles(screen_name, full_name, avatar_url), peaks(name, slug, elevation))
  ```
- Order by `created_at DESC`, limit 20

**Component Updates:**
- Update `FeedPost` interface to match DB shape (UUID id, `profiles` join instead of `author`/`handle`/`avatar`)
- Wire up `CommunityFeed` post composer to call `createPost` server action
- Add image upload to Supabase Storage (create `post-images` bucket)
- Add peak selector dropdown in composer (query `peaks` table)
- Add delete option to the "more" button menu on own posts

**Pagination:**
- Implement cursor-based pagination in `CommunityFeed` using `created_at` cursor
- Wire up "Load More Stories" button to fetch next page via client-side query

---

### Phase 2 — Engagement (Likes, Comments, Saves)

**Goal:** Make like/comment/save buttons functional.

**Migration:**
- Create `post_likes`, `post_comments`, `post_saves` tables with RLS

**Server Actions:**
- `toggleLike(postId)` — upsert/delete in `post_likes`
- `addComment(postId, content)` — insert into `post_comments`
- `deleteComment(commentId)` — delete own comment
- `toggleSave(postId)` — upsert/delete in `post_saves`

**Data Fetching:**
- Add aggregated counts to the posts query: like count, comment count, save count
- Include whether the current user has liked/saved each post (for active state)
- Use Supabase's `.select()` with count aggregation or a database view

**Component Updates:**
- Add optimistic toggle for likes (same pattern as peak watchlist)
- Add optimistic toggle for saves
- Build a comment thread UI (expandable below each post)
- Show filled heart icon when user has liked
- Show filled bookmark icon when user has saved
- Update Quick Links "Saved" count to query `post_saves` for the current user

---

### Phase 3 — Feed Filters & Trending

**Goal:** Make feed tabs and trending sidebar functional.

**Feed Filters:**
- Use URL search params (`?filter=latest|following|conditions`) to control the active tab
- `latest` — all posts ordered by `created_at DESC`
- `following` — posts from users the current user follows (requires `user_follows` table)
- `conditions` — posts where `is_condition_report = true`
- Update tab buttons to be `<Link>` elements with search params
- Highlight active tab based on current search param

**User Follows** (if implementing "Following" filter):
- Create `user_follows` table with RLS
- Add follow/unfollow button on user profiles and post headers
- Server action: `toggleFollow(userId)`

**Trending Peaks:**
- Replace `trendingPeaks` constant with a query:
  ```sql
  SELECT p.name, p.slug,
    COUNT(*) FILTER (WHERE sl.summit_date >= now() - interval '7 days') AS this_week,
    COUNT(*) FILTER (WHERE sl.summit_date >= now() - interval '14 days'
                     AND sl.summit_date < now() - interval '7 days') AS last_week
  FROM summit_logs sl
  JOIN peaks p ON p.id = sl.peak_id
  WHERE sl.summit_date >= now() - interval '14 days'
  GROUP BY p.id
  ORDER BY this_week DESC
  LIMIT 5
  ```
- Calculate trend percentage: `((this_week - last_week) / last_week * 100)`
- Alternatively, count `community_posts` referencing each peak if summit log volume is low

---

### Phase 4 — Weather Widget (Quick Win)

**Goal:** Connect the weather widget to real forecast data.

**Data Fetching:**
- Query `peak_forecasts` joined with `peaks` for a contextually relevant peak:
  - If user has watched peaks, use the most recently watched
  - Otherwise, use the most popular peak (highest `completions` count)
- Extract temperature, wind speed, and sky condition from `adjusted_forecast` JSONB

**Component Updates:**
- Replace hardcoded "28°", "Winds 25-35 mph", "Clear skies" with real values
- Replace "Mt. Elbert summit forecast" with the actual peak name
- Make the widget a link to the peak's detail page
- Handle missing forecast data gracefully (loading state or fallback message)

---

### Phase 5 — Events

**Goal:** Replace mock events with real data and allow creation/RSVP.

**Migration:**
- Create `community_events` and `event_attendees` tables with RLS

**Server Actions:**
- `createEvent(formData)` — insert into `community_events`
- `toggleEventAttendance(eventId)` — upsert/delete in `event_attendees`
- `deleteEvent(eventId)` — delete own event

**Data Fetching:**
- Replace `upcomingEvents` constant with a query for events where `event_date > now()`, ordered by `event_date ASC`, limit 3
- Include attendee count via aggregation
- Include whether current user is attending

**Component Updates:**
- Add RSVP button to each event card
- Build an event creation modal or page
- Wire up "View All Events" to an `/events` page or expanded view
- Update Quick Links "Events" count with real upcoming event count

---

### Phase 6 — Notifications

**Goal:** Replace the hardcoded notification badge with real notifications.

**Migration:**
- Create `notifications` table with RLS

**Triggers/Functions:**
- Create Supabase database functions or Edge Functions to generate notifications when:
  - Someone likes your post
  - Someone comments on your post
  - Someone follows you
  - An event you're attending is coming up
  - You earn a badge (can hook into existing badge award flow)

**Data Fetching:**
- Query unread notification count for the bell badge
- Query recent notifications for a dropdown

**Component Updates:**
- Replace hardcoded "3" with real unread count (or hide badge if 0)
- Build a notification dropdown or `/notifications` page
- Add "mark as read" functionality
- Consider Supabase Realtime subscription for live notification count updates

---

### Phase 7 — Groups (Optional / Future)

**Goal:** Implement the "Groups" feature hinted at in Quick Links.

This is the lowest priority since it's only referenced as a sidebar count. Consider whether groups add enough value vs. the implementation cost. If proceeding:
- `community_groups` table (name, description, created_by, visibility)
- `group_members` table (group_id, user_id, role)
- Group feed (posts scoped to a group)
- Group discovery/search page

---

## File Changes Summary

| File | Changes |
|---|---|
| `supabase/migrations/` | New migration files for each phase's tables |
| `app/community/actions.ts` | **New file** — server actions for posts, likes, comments, saves, events |
| `app/community/page.tsx` | Replace all mock data constants with DB queries; wire up weather widget; make tabs functional |
| `app/community/CommunityFeed.tsx` | Update `FeedPost` interface to DB shape; wire composer to server action; add pagination; add engagement toggle handlers |
| `app/community/PeaksWatchedPanel.tsx` | No changes needed (already functional) |
| `app/community/CommentThread.tsx` | **New file** — expandable comment list per post |
| `app/community/EventCard.tsx` | **New file** — event card with RSVP toggle (extract from page.tsx) |
| `app/community/NotificationDropdown.tsx` | **New file** — notification bell dropdown |
| `app/community/PostComposer.tsx` | Consider extracting from CommunityFeed for cleaner separation |
| `lib/community.ts` | **New file** — shared query helpers (getPosts, getTrendingPeaks, getUpcomingEvents) |

---

## Notes

- **Supabase Storage:** Needed for post image uploads. Create a `post-images` bucket with public read access and authenticated upload. Use signed URLs or public URLs depending on privacy needs.
- **Supabase Realtime:** Consider subscribing to `community_posts` and `notifications` for live feed updates, but this is a polish item — not required for initial implementation.
- **Content moderation:** Not addressed here. Consider adding a `reported_at` / `hidden` flag to posts and comments if the community grows.
- **Rate limiting:** Server actions for post creation and commenting should include basic rate limiting to prevent spam.
- **Image optimization:** Post images should be resized/compressed on upload. Consider using Supabase's image transformation or a service like `next/image` with a remote pattern allowlist.
