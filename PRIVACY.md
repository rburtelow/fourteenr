# Privacy Controls & Follow System Enhancement

## Context

Profiles are currently fully public — anyone can see all profile data, summit history, badges, and groups. The follow system exists in the database with a request/accept model, and a `FollowButton` component exists (`app/components/FollowButton.tsx`) with server actions (`app/community/follow-actions.ts`), but the public profile page (`app/u/[username]/page.tsx`) uses a hardcoded static button instead of the real component.

Additionally, the summit_logs RLS policy only allows owner access (`auth.uid() = user_id`), but the public profile page queries other users' summit logs server-side — this works because the server client runs with the viewing user's auth context, meaning **other users' summit data silently returns empty**. This needs to be fixed as part of this work.

**Goal**: Let users control their profile visibility (public/private), protect specific profile sections, and wire up the existing follow system on the public profile page.

---

## Step 1: Database Migration

**New file: `supabase/migrations/20260320000000_profile_privacy.sql`**

### 1a. Add privacy columns to `profiles`
- `is_private boolean not null default false` — master toggle
- `privacy_settings jsonb not null default '{}'::jsonb` — section-level controls

Privacy settings JSONB shape:
```json
{
  "show_stats": "everyone" | "followers" | "nobody",
  "show_summit_history": "everyone" | "followers" | "nobody",
  "show_badges": "everyone" | "followers" | "nobody",
  "show_groups": "everyone" | "followers" | "nobody"
}
```

Empty JSONB = all sections default to `"everyone"` (backwards-compatible).

### 1b. Create helper function
```sql
create or replace function public.is_accepted_follower(viewer_id uuid, profile_owner_id uuid)
returns boolean language sql security definer stable
as $$
  select exists (
    select 1 from public.follows
    where follower_id = viewer_id
      and following_id = profile_owner_id
      and status = 'accepted'
  );
$$;
```

### 1c. Update summit_logs RLS
Drop the current SELECT policy ("Users can view their own summit logs") and replace with a privacy-aware policy:
- Owner always sees own logs
- Others see logs if the profile's `show_summit_history` setting permits (based on `everyone`/`followers` + accepted follow status)

### 1d. Modify follow request trigger
Change `on_follow_request` from `AFTER INSERT` to `BEFORE INSERT` so it can modify `NEW.status`:
- If target profile `is_private = false` → auto-set `status = 'accepted'` and send "started following you" notification
- If target profile `is_private = true` → leave as `pending` and send "wants to follow you" notification

### 1e. Update user_badges RLS (if needed)
Add a SELECT policy that respects `show_badges` privacy setting (same pattern as summit_logs).

---

## Step 2: TypeScript Types

**File: `lib/database.types.ts`**
- Add `is_private: boolean` and `privacy_settings: Json` to the profiles table Row/Insert/Update types

**New file: `lib/privacy.ts`**
```typescript
export type SectionVisibility = "everyone" | "followers" | "nobody";

export interface PrivacySettings {
  show_stats: SectionVisibility;
  show_summit_history: SectionVisibility;
  show_badges: SectionVisibility;
  show_groups: SectionVisibility;
}

export const DEFAULT_PRIVACY: PrivacySettings = { /* all "everyone" */ };

export function canViewSection(
  sectionKey: keyof PrivacySettings,
  settings: Partial<PrivacySettings>,
  isOwner: boolean,
  isAcceptedFollower: boolean
): boolean;
```

**File: `lib/follows.ts`**
- Add `isAcceptedFollower(viewerId, ownerId)` function (simple query check)

---

## Step 3: Privacy Settings Page

**New file: `app/profile/settings/page.tsx`** (server component)
- Auth guard → redirect to login if not authenticated
- Fetch current profile (is_private, privacy_settings)
- Render `PrivacySettingsClient`

**New file: `app/profile/settings/PrivacySettingsClient.tsx`** (client component)
- Modeled after `app/groups/[slug]/settings/GroupSettingsClient.tsx` UI patterns
- **Section A: Profile Visibility** — radio button cards:
  - "Public" (globe icon) — anyone sees profile, follows auto-accept
  - "Private" (lock icon) — protected sections hidden from non-followers, follow requests require approval
- **Section B: Section Visibility** — for each of: Stats, Summit History, Badges, Groups
  - Three-option pill radio group: Everyone / Followers Only / Nobody
- Save button → server action

**New file: `app/profile/settings/actions.ts`** (server action)
- `updatePrivacySettings(formData)` — validates, updates profiles row

---

## Step 4: Public Profile Page Updates

**File: `app/u/[username]/page.tsx`**

### 4a. Fetch privacy + follow data
- Add `is_private` and `privacy_settings` to the profile SELECT
- Call `getFollowStatus(user.id, profile.id)` for logged-in viewers
- Derive `isFollower` from status === "accepted"

### 4b. Replace static Follow button
- Import and use existing `FollowButton` component from `app/components/FollowButton.tsx`
- Pass `targetUserId={profile.id}` and `initialStatus={followStatus}`
- Show login link instead if viewer is not authenticated

### 4c. Conditional section rendering
Use `canViewSection()` to gate each section:
- **Stats bar** → `show_stats`
- **Badges** → `show_badges`
- **Groups** → `show_groups`
- **Summit History** → `show_summit_history`

When hidden, show a lock placeholder: "This section is only visible to followers" or "This section is private"

### 4d. Private profile lock screen
If `is_private` and viewer is not an accepted follower (and not the owner):
- Show only: avatar, name, screen_name, bio, "This account is private"
- Show Follow/Requested button
- Hide all section content

### 4e. Skip data fetching for hidden sections
If `canViewSection("show_summit_history", ...)` is false, skip summit_logs + routes queries entirely.

---

## Step 5: Navigation Updates

**File: `app/profile/page.tsx`**
- Add a Settings gear icon/link pointing to `/profile/settings`

**File: `app/u/[username]/page.tsx`**
- For `isOwnProfile`, add Settings link next to "Edit Profile"

---

## Key Files to Modify

| File | Change |
|------|--------|
| `supabase/migrations/20260320000000_profile_privacy.sql` | **New** — columns, RLS, trigger |
| `lib/database.types.ts` | Add `is_private`, `privacy_settings` to profiles |
| `lib/privacy.ts` | **New** — privacy utility functions |
| `lib/follows.ts` | Add `isAcceptedFollower()` |
| `app/profile/settings/page.tsx` | **New** — settings page |
| `app/profile/settings/PrivacySettingsClient.tsx` | **New** — settings UI |
| `app/profile/settings/actions.ts` | **New** — server action |
| `app/u/[username]/page.tsx` | Privacy-aware rendering, wire FollowButton |
| `app/profile/page.tsx` | Add settings link |

## Existing Code to Reuse

- `app/components/FollowButton.tsx` — fully functional follow button with optimistic updates
- `app/community/follow-actions.ts` — all follow server actions (send, cancel, accept, reject, unfollow)
- `app/groups/[slug]/settings/GroupSettingsClient.tsx` — UI pattern for radio button privacy cards
- `lib/follows.ts` — `getFollowStatus()` for determining viewer's relationship

## Verification

1. **Migration**: Run `supabase db reset` or apply migration, verify columns exist and RLS policies work
2. **Settings page**: Navigate to `/profile/settings`, toggle privacy, save, verify DB update
3. **Public profile (public user)**: Visit another user's profile — all sections visible, Follow button works and auto-accepts
4. **Public profile (private user)**: Visit a private user's profile — see lock screen, send follow request (shows "Requested"), after acceptance see full profile
5. **Section visibility**: Set a section to "followers only", verify non-followers see lock placeholder, followers see content
6. **Summit logs fix**: Verify other users' summit data actually displays on public profiles (currently broken)
