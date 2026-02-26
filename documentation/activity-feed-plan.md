# Plan: Show Friends' Summit Logs & Badge Achievements in Community Feed

## Context

Currently the community feed only shows manually written posts and event announcements. When a friend logs a summit or earns a badge, there's no visibility into that in the feed. This change auto-generates community posts for these activities so they appear naturally in the feed with distinct visual treatments.

## Approach

Add an `activity_type` column to `community_posts` to distinguish auto-generated posts from user-written ones. Create auto-posts at the point of summit logging and badge awarding. Render them with custom card designs in CommunityFeed.

---

## Files to Change

### 1. New Migration: `supabase/migrations/20260226000000_add_activity_type_to_community_posts.sql`

Add two columns to the existing `community_posts` table:

```sql
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
```

### 2. `lib/community.types.ts` — Add fields to CommunityPost interface

```typescript
// Add to CommunityPost interface:
activity_type: 'summit_log' | 'badge_earned' | null;
activity_metadata: {
  // summit_log fields
  route_name?: string;
  summit_date?: string;
  // badge_earned fields
  badge_id?: string;
  badge_slug?: string;
  badge_name?: string;
  badge_icon_name?: string;
  badge_description?: string;
  badge_category?: string;
} | null;
```

### 3. `lib/community.ts` — Update `getPosts()` query

Add `activity_type` and `activity_metadata` to the select string (around line 23):

```typescript
.select(`
  id, user_id, content, peak_id, is_condition_report, image_urls,
  created_at, updated_at,
  activity_type,
  activity_metadata,
  profiles:user_id ( screen_name, full_name, avatar_url ),
  peaks:peak_id ( name, slug, elevation ),
  community_events ( id )
`)
```

Pass them through in the return mapping (around line 139):

```typescript
return {
  ...post,
  // ... existing fields ...
  activity_type: post.activity_type ?? null,
  activity_metadata: post.activity_metadata ?? null,
};
```

### 4. `app/peaks/[slug]/trip-report-actions.ts` — Auto-post on summit

After the summit_log insert (around line 96), add:

```typescript
// Auto-create community feed post for summit
const { data: peakData } = await supabase
  .from("peaks")
  .select("name, elevation")
  .eq("id", peakId)
  .single();

const peakName = peakData?.name ?? "a 14er";
const elevation = peakData?.elevation ?? 14000;

let routeName: string | null = null;
if (routeId) {
  const { data: routeData } = await supabase
    .from("routes")
    .select("name")
    .eq("id", routeId)
    .single();
  routeName = routeData?.name ?? null;
}

const routeSnippet = routeName ? ` via ${routeName}` : "";
const postContent = `Summited ${peakName} (${elevation.toLocaleString()}')${routeSnippet}!`;

await supabase.from("community_posts").insert({
  user_id: user.id,
  content: postContent,
  peak_id: peakId,
  is_condition_report: false,
  activity_type: "summit_log",
  activity_metadata: {
    summit_date: hikeDate,
    route_name: routeName,
  },
});
```

### 5. `supabase/functions/badge-worker/index.ts` — Auto-post on badge earned

After the batch `user_badges` insert succeeds (around line 209), add:

```typescript
// Create community feed posts for each new badge
const badgeById = new Map(
  (badges as BadgeDefinition[]).map((b: BadgeDefinition) => [b.id, b])
);

const activityPosts = newBadges.map((nb) => {
  const badge = badgeById.get(nb.badge_id);
  const badgeName = badge?.name ?? "a badge";
  return {
    user_id: nb.user_id,
    content: `Earned the "${badgeName}" badge! ${badge?.description ?? ""}`.trim(),
    peak_id: nb.trigger_peak_id,
    is_condition_report: false,
    activity_type: "badge_earned",
    activity_metadata: {
      badge_id: nb.badge_id,
      badge_slug: badge?.slug ?? null,
      badge_name: badge?.name ?? null,
      badge_icon_name: badge?.icon_name ?? null,
      badge_description: badge?.description ?? null,
      badge_category: badge?.category ?? null,
    },
  };
});

const { error: postError } = await supabase
  .from("community_posts")
  .insert(activityPosts);

if (postError) {
  console.error("Failed to create badge activity posts:", postError);
  // Non-fatal: badges were already awarded
}
```

The badge-worker already uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS, so it can insert posts on behalf of any user.

### 6. `app/community/CommunityFeed.tsx` — Render activity posts

**a) Update `FEED_POST_SELECT` (line 20):**

Add `activity_type, activity_metadata` to the select string.

**b) Update `fetchPostById` return (line 243):**

Pass through `activity_type` and `activity_metadata` in the return object.

**c) Update content rendering (line 1001):**

Replace the current content section with branching logic:

```tsx
{/* Content */}
{post.activity_type === 'summit_log' ? (
  <SummitLogPostContent
    peak={post.peaks}
    metadata={post.activity_metadata}
  />
) : post.activity_type === 'badge_earned' ? (
  <BadgeEarnedPostContent
    metadata={post.activity_metadata}
  />
) : post.content.startsWith("\u{1F4C5}") || post.content.startsWith("\u{274C}") ? (
  <EventPostContent content={post.content} eventId={post.linked_event_id} />
) : (
  <p className="mt-4 text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
    {post.content}
  </p>
)}
```

**d) Add `SummitLogPostContent` component:**

Green-tinted card with mountain icon, peak name linking to `/peaks/{slug}`, elevation, route name, and summit date.

```tsx
function SummitLogPostContent({
  peak,
  metadata,
}: {
  peak: CommunityPost["peaks"];
  metadata: CommunityPost["activity_metadata"];
}) {
  const routeName = metadata?.route_name;
  const summitDate = metadata?.summit_date
    ? new Date(metadata.summit_date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="mt-4">
      <div className="rounded-xl border border-[var(--color-border-app)] overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
            <MountainIcon className="w-5 h-5 text-[var(--color-brand-primary)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text-primary)]">Summit Logged</p>
            {summitDate && (
              <p className="text-xs text-[var(--color-text-secondary)]">{summitDate}</p>
            )}
          </div>
        </div>
        {peak && (
          <Link
            href={`/peaks/${peak.slug}`}
            className="block px-4 py-3 border-t border-[var(--color-border-app)] hover:bg-[var(--color-surface-subtle)] transition-colors"
          >
            <p className="font-bold text-lg text-[var(--color-brand-primary)]">{peak.name}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {peak.elevation.toLocaleString()}' {routeName ? `via ${routeName}` : ""}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
```

**e) Add `BadgeEarnedPostContent` component:**

Amber-tinted card using the existing `BadgeIcon` component from `app/components/badges/BadgeIcon.tsx`.

```tsx
// Add import at top of file:
import BadgeIcon from "../components/badges/BadgeIcon";
import type { BadgeDefinition, BadgeCategory } from "@/lib/database.types";

function BadgeEarnedPostContent({
  metadata,
}: {
  metadata: CommunityPost["activity_metadata"];
}) {
  const badgeName = metadata?.badge_name ?? "Badge";
  const badgeDescription = metadata?.badge_description ?? "";

  // Construct a minimal BadgeDefinition for BadgeIcon
  const fakeBadge = {
    icon_name: metadata?.badge_icon_name ?? "mountain-sunrise",
    name: badgeName,
    category: (metadata?.badge_category ?? "milestone") as BadgeCategory,
    slug: metadata?.badge_slug ?? "",
    description: badgeDescription,
  } as BadgeDefinition;

  return (
    <div className="mt-4">
      <div className="rounded-xl border border-[var(--color-border-app)] overflow-hidden bg-gradient-to-br from-amber-50 to-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            <BadgeIcon badge={fakeBadge} earned={true} size="lg" showTooltip={false} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-amber-glow)] uppercase tracking-wider">
              Badge Earned
            </p>
            <p className="font-bold text-lg text-[var(--color-text-primary)]">{badgeName}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{badgeDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## What Stays the Same

- Existing posts, likes, comments, saves, and realtime subscriptions all work unchanged
- Auto-posts are regular `community_posts` rows — they get all engagement features for free
- Users can delete their own auto-posts (existing `isOwnPost` check covers it)
- Condition reports filter won't include auto-posts (they set `is_condition_report: false`)
- No RLS changes needed (summit auto-posts use auth context; badge auto-posts use service role)

## Notes

- **No retroactive posts**: Existing summits/badges won't get auto-posts. Only new activity from deployment onward.
- **Badge timing**: Badges are evaluated every 2 hours by the worker, so badge auto-posts appear with that delay (not instant).
- **Multiple badges**: If a user earns multiple badges in one worker run, each gets its own post.

## Verification

1. Run `pnpm build` to check TypeScript compilation
2. Apply migration locally via Supabase CLI
3. Log a summit via trip report — verify auto-post appears in feed with summit card styling
4. Manually trigger badge-worker — verify badge auto-post appears with badge icon card
5. Check realtime: open feed in two tabs, log summit in one, verify it appears in both
