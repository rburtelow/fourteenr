# Groups Feature Plan

A social groups feature for my14er, enabling hikers to form communities around shared interests — specific mountain ranges, skill levels, trip planning, local chapters, and more. Modeled after Facebook Groups with adaptations for the hiking domain.

---

## Overview

Groups give users a dedicated space to post, discuss, and coordinate around a shared topic. Each group has its own feed, membership list, and settings. Groups integrate with the existing community infrastructure (posts, likes, comments, events, follows, notifications).

---

## Core Concepts

| Concept | Description |
|---|---|
| **Group** | A named community with a description, cover image, privacy setting, and member list |
| **Privacy** | `public` (anyone can see posts and join), `private` (anyone can find the group but must request to join; posts visible to members only) |
| **Roles** | `admin` (creator + promoted members — full control), `moderator` (can approve members, pin/remove posts), `member` (can post and comment) |
| **Group Post** | A `community_post` scoped to a group via `group_id` FK. Uses the same like/comment/save infrastructure |
| **Group Event** | A `community_event` scoped to a group via `group_id` FK. Visible to group members |
| **Pinned Post** | Admins/mods can pin up to 3 posts to the top of the group feed |

---

## Database Schema (New Tables)

### `groups`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | Max 100 chars |
| slug | text UNIQUE NOT NULL | URL-safe, auto-generated from name |
| description | text | Max 500 chars |
| cover_image_url | text | Supabase Storage |
| privacy | enum(`public`, `private`) | Default `public` |
| peak_id | uuid FK → peaks | Optional — links group to a specific 14er |
| category | enum(`general`, `route`, `range`, `skill_level`, `local_chapter`, `trip_planning`, `gear`, `conditions`) | |
| created_by | uuid FK → auth.users | |
| member_count | int | Denormalized counter, default 1 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `group_members`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| group_id | uuid FK → groups | |
| user_id | uuid FK → auth.users | |
| role | enum(`admin`, `moderator`, `member`) | Default `member` |
| status | enum(`active`, `pending`, `banned`) | `pending` for private group requests |
| joined_at | timestamptz | |

Unique constraint: `(group_id, user_id)`

### `group_pinned_posts`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| group_id | uuid FK → groups | |
| post_id | uuid FK → community_posts | |
| pinned_by | uuid FK → auth.users | |
| pinned_at | timestamptz | |

Max 3 per group (enforced via trigger or app logic).

### Modifications to existing tables

- **`community_posts`**: Add nullable `group_id` (uuid FK → groups). NULL = public feed post (existing behavior). Non-null = group-scoped post.
- **`community_events`**: Add nullable `group_id` (uuid FK → groups). NULL = public event. Non-null = group event.
- **`notifications`**: Add `group_id` column. Add new notification types: `group_invite`, `group_join_request`, `group_join_approved`, `group_post`.

### RLS Policies

- Public groups: posts readable by anyone, writable by active members.
- Private groups: posts readable/writable only by active members.
- Group settings editable by admins only.
- Member management (approve/ban/promote) by admins and moderators.

---

## Phase 1: Group CRUD & Membership

**Goal**: Users can create, discover, join, and leave groups. Basic group profile page with member list.

### Story 1.1 — Create a Group
> As a logged-in user, I can create a new group with a name, description, category, optional peak link, and privacy setting so that I can start a community around a topic.

**Acceptance Criteria:**
- Create Group modal accessible from `/community` sidebar and a dedicated `/groups` page
- Name (required, max 100), description (max 500), category dropdown, privacy toggle, optional peak selector
- Slug auto-generated from name (with collision handling)
- Creator automatically becomes `admin` member
- Redirects to the new group page on success

### Story 1.2 — Group Discovery Page
> As a user, I can browse and search for groups so that I can find communities relevant to my interests.

**Acceptance Criteria:**
- `/groups` page with grid/list of groups
- Search by name
- Filter by category and optional peak
- Sort by: newest, most members, recently active
- Each card shows: name, member count, category badge, privacy icon, cover image (or fallback gradient)
- "Create Group" CTA button

### Story 1.3 — Group Profile Page
> As a user, I can view a group's profile page to see its description, member count, and member list.

**Acceptance Criteria:**
- `/groups/[slug]` page with cover image header, group name, description, category, member count
- "Join" / "Request to Join" / "Leave" button depending on membership state and privacy
- Members tab showing avatars + names with role badges (admin/mod)
- For private groups, non-members see only the group name, description, member count, and a "Request to Join" button — no posts or member list

### Story 1.4 — Join, Leave & Membership Requests
> As a user, I can join public groups instantly, request to join private groups, and leave any group I belong to.

**Acceptance Criteria:**
- Public groups: clicking "Join" adds user as `active` member immediately
- Private groups: clicking "Request to Join" creates a `pending` member row; admins/mods see pending requests
- Admins/mods can approve or deny pending requests from a "Requests" tab on the group page
- Approval sends a `group_join_approved` notification to the requester
- "Leave Group" option in group settings (admins cannot leave if they are the only admin — must transfer first)
- Member count updates on join/leave (trigger or server action)

### Story 1.5 — Group Settings & Admin Controls
> As a group admin, I can edit group details, manage member roles, and remove members.

**Acceptance Criteria:**
- Settings page or modal accessible to admins: edit name, description, cover image, category, privacy
- Member management: promote to moderator, demote to member, ban/remove member
- Transfer admin role to another member
- Delete group (with confirmation)

---

## Phase 2: Group Feed & Posts

**Goal**: Each group has its own post feed. Posts in groups use the existing community post infrastructure.

### Story 2.1 — Group Feed
> As a group member, I can view a feed of posts scoped to this group.

**Acceptance Criteria:**
- Group page shows a feed tab with posts where `group_id` matches
- Reuses existing `CommunityFeed` component with a `groupId` prop to filter
- Feed supports the same like/comment/save interactions as the main community feed
- Pinned posts appear at the top with a "Pinned" badge
- Non-members of private groups see no feed content

### Story 2.2 — Post to a Group
> As a group member, I can create a post within the group so that it appears in the group feed.

**Acceptance Criteria:**
- Post composer at the top of the group feed (same UI as community feed composer)
- Posts created here automatically get the group's `group_id`
- Posts can optionally tag a peak (same peak selector)
- Condition report checkbox available
- Group posts do NOT appear in the main community feed (they live only in the group)

### Story 2.3 — Group Posts in Notifications
> As a group member, I receive notifications for activity on my group posts (likes, comments) just like main feed posts.

**Acceptance Criteria:**
- Existing like/comment notification triggers work for group posts (no changes needed — they fire on `community_posts` regardless of `group_id`)
- Notification deeplinks navigate to `/groups/[slug]#post-{id}`
- Group name shown in notification context (e.g., "Alex liked your post in Front Range Hikers")

### Story 2.4 — Pin & Remove Posts
> As a group admin or moderator, I can pin important posts and remove inappropriate posts.

**Acceptance Criteria:**
- "Pin post" option in post dropdown for admins/mods (max 3 pinned per group)
- "Unpin" option on already-pinned posts
- "Remove post" option for admins/mods to delete any post in the group (not just their own)
- Pinned posts render at top of feed with visual indicator

---

## Phase 3: Group Events & Activity

**Goal**: Groups can host events, and group activity surfaces in relevant places.

### Story 3.1 — Group Events
> As a group member, I can create and browse events scoped to this group.

**Acceptance Criteria:**
- "Events" tab on the group page showing upcoming group events
- "Create Event" button opens the existing event creation modal, pre-filled with `group_id`
- Group events appear in both the group's Events tab AND the main `/events` page (with a group badge)
- RSVP works the same as existing events
- Only group members can create events in the group

### Story 3.2 — Group Activity in User Profile
> As a user viewing someone's profile, I can see which public groups they belong to.

**Acceptance Criteria:**
- `/u/[username]` profile page shows a "Groups" section listing public group memberships
- Private group memberships are not shown unless the viewer is also a member
- Each group links to its `/groups/[slug]` page

### Story 3.3 — "My Groups" Sidebar
> As a logged-in user, I can see my groups in the community sidebar for quick access.

**Acceptance Criteria:**
- Community page sidebar shows "My Groups" section with the user's group avatars/names
- Sorted by most recent activity
- "See All" link to `/groups?tab=my-groups`
- Unread indicator if there are new posts since the user last visited

---

## Phase 4: Invites, Recommendations & Polish

**Goal**: Social discovery, invitations, and quality-of-life improvements.

### Story 4.1 — Invite to Group
> As a group member, I can invite people I follow to join the group.

**Acceptance Criteria:**
- "Invite" button on the group page opens a modal with a searchable list of the user's following
- Sending an invite creates a `group_invite` notification for the recipient
- Recipient can accept (joins group) or dismiss the notification
- Already-invited or already-member users are grayed out

### Story 4.2 — Suggested Groups
> As a user, I see group recommendations based on peaks I've climbed and people I follow.

**Acceptance Criteria:**
- `/groups` page shows a "Suggested for You" section
- Recommendations based on: peaks the user has logged summits for (match `peak_id` groups), groups that people the user follows belong to, popular groups in categories the user has interacted with
- Dismissable suggestions

### Story 4.3 — Group Search in Global Search
> As a user, I can find groups from the global search bar.

**Acceptance Criteria:**
- Global search results include a "Groups" section
- Shows group name, member count, category
- Clicking navigates to `/groups/[slug]`

### Story 4.4 — Cover Image Upload
> As a group admin, I can upload a cover image for the group.

**Acceptance Criteria:**
- Image upload in group settings using Supabase Storage (`group-covers` bucket)
- Crop/resize on upload (max 1200×400)
- Default cover is a gradient based on group category

---

## Technical Notes

### Integration with Existing Infrastructure
- Group posts are `community_posts` rows with a non-null `group_id` — the existing like, comment, and save systems work without modification.
- Group events are `community_events` rows with a non-null `group_id` — the existing RSVP system works without modification.
- Realtime subscriptions in `CommunityFeed` can be extended with a `group_id` filter on the channel.
- Notification triggers already fire on `community_posts` inserts — they work for group posts automatically. The notification rendering layer needs updates to include group context.

### Performance Considerations
- `member_count` on `groups` is denormalized and updated via trigger on `group_members` insert/delete to avoid count queries.
- Group feed queries filter `community_posts` by `group_id` with an index on that column.
- "My Groups" sidebar query should be cached or use a materialized view if group count grows large.

### File Structure (Suggested)
```
app/
  groups/
    page.tsx              # Group discovery/browse page
    actions.ts            # Server actions: createGroup, joinGroup, leaveGroup, etc.
    GroupCard.tsx          # Group card for discovery grid
    [slug]/
      page.tsx            # Group profile + feed page
      settings/
        page.tsx          # Group admin settings
      members/
        page.tsx          # Full member list
      GroupFeed.tsx        # Group-scoped feed (wraps CommunityFeed)
      GroupHeader.tsx      # Cover image, name, join button
      MemberList.tsx       # Member grid with role badges
lib/
  groups.ts               # Query helpers: getGroups, getGroupBySlug, getGroupMembers, etc.
  groups.types.ts          # TypeScript types
supabase/
  migrations/
    XXXXXX_create_groups.sql
```
