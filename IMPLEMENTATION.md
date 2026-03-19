# IMPLEMENTATION.md — Privacy Controls & Follow System

## Epic 1: Database Migration
Status: complete

### Story 1.1: Add privacy columns to profiles table
**As a** developer
**I want** `is_private` and `privacy_settings` columns on the profiles table
**So that** users can store their visibility preferences in the database

**Acceptance Criteria:**
- [x] `is_private boolean not null default false` added to profiles
- [x] `privacy_settings jsonb not null default '{}'::jsonb` added to profiles
- [x] Migration file created at `supabase/migrations/20260320000000_profile_privacy.sql`
- [x] Empty JSONB defaults to "everyone" for all sections (documented in shape)

**Playwright Test:** none (infrastructure story)

---

### Story 1.2: Create is_accepted_follower helper function
**As a** developer
**I want** a SQL helper function `is_accepted_follower(viewer_id, profile_owner_id)`
**So that** RLS policies can check follow status without duplicating logic

**Acceptance Criteria:**
- [x] Function created in migration as `public.is_accepted_follower(uuid, uuid) returns boolean`
- [x] Function uses `security definer` and `stable` attributes
- [x] Returns true only when a row exists in `follows` with status = 'accepted'

**Playwright Test:** none (infrastructure story)

---

### Story 1.3: Update summit_logs RLS to support public visibility
**As a** user
**I want** other users' summit logs to be visible when their profile is public
**So that** viewing someone else's profile actually shows their summit history

**Acceptance Criteria:**
- [x] Old SELECT policy ("Users can view their own summit logs") is dropped
- [x] New SELECT policy allows owner to always see own logs
- [x] New SELECT policy allows others to see logs when `show_summit_history = 'everyone'`
- [x] New SELECT policy allows accepted followers to see logs when `show_summit_history = 'followers'`
- [x] Logs are hidden when `show_summit_history = 'nobody'`

**Playwright Test:** `e2e/epic-1-database.spec.ts` → `"Story 1.3: public summit logs visible on other users' profiles"`

---

### Story 1.4: Update follow request trigger to auto-accept for public profiles
**As a** user
**I want** follows to auto-accept when the target profile is public
**So that** following a public user doesn't require manual approval

**Acceptance Criteria:**
- [x] `on_follow_request` trigger changed from `AFTER INSERT` to `BEFORE INSERT`
- [x] When target `is_private = false`, new follow row gets `status = 'accepted'` and sends "started following you" notification
- [x] When target `is_private = true`, status stays `pending` and sends "wants to follow you" notification

**Playwright Test:** none (trigger behavior is tested via UI in Epic 4)

---

### Story 1.5: Update user_badges RLS for privacy
**As a** user
**I want** badge visibility to respect the profile's `show_badges` setting
**So that** users can control who sees their earned badges

**Acceptance Criteria:**
- [x] SELECT policy on `user_badges` allows owner to always see own badges
- [x] Others can see badges when `show_badges = 'everyone'`
- [x] Accepted followers can see badges when `show_badges = 'followers'`
- [x] Badges hidden when `show_badges = 'nobody'`

**Playwright Test:** none (infrastructure story; UI tested in Epic 4)

---

## Epic 2: TypeScript Types & Utilities
Status: complete

### Story 2.1: Add privacy fields to database types
**As a** developer
**I want** `is_private` and `privacy_settings` reflected in `lib/database.types.ts`
**So that** TypeScript is aware of the new columns

**Acceptance Criteria:**
- [x] `is_private: boolean` added to profiles Row, Insert, and Update types
- [x] `privacy_settings: Json` added to profiles Row, Insert, and Update types

**Playwright Test:** none (infrastructure story)

---

### Story 2.2: Create privacy utility library
**As a** developer
**I want** a `lib/privacy.ts` module with types and a `canViewSection()` helper
**So that** privacy checks are centralized and reusable across server and client code

**Acceptance Criteria:**
- [x] `SectionVisibility` type exported: `"everyone" | "followers" | "nobody"`
- [x] `PrivacySettings` interface exported with `show_stats`, `show_summit_history`, `show_badges`, `show_groups`
- [x] `DEFAULT_PRIVACY` constant exported (all sections set to `"everyone"`)
- [x] `canViewSection(sectionKey, settings, isOwner, isAcceptedFollower)` exported and works correctly for all combinations
- [x] Owner always returns true regardless of settings

**Playwright Test:** none (infrastructure story)

---

### Story 2.3: Add isAcceptedFollower helper to follows library
**As a** developer
**I want** an `isAcceptedFollower(viewerId, ownerId)` function in `lib/follows.ts`
**So that** server components can check follow status in a single call

**Acceptance Criteria:**
- [x] `isAcceptedFollower(viewerId: string, ownerId: string): Promise<boolean>` added to `lib/follows.ts`
- [x] Returns false if either argument is falsy (unauthenticated viewer)
- [x] Queries follows table for accepted row matching viewer → owner

**Playwright Test:** none (infrastructure story)

---

## Epic 3: Privacy Settings Page
Status: complete

### Story 3.1: Create privacy settings server page
**As a** user
**I want** to navigate to `/profile/settings` and see a privacy settings form
**So that** I have a dedicated place to manage my profile visibility

**Acceptance Criteria:**
- [x] `app/profile/settings/page.tsx` created as a server component
- [x] Unauthenticated users are redirected to login
- [x] Page fetches current `is_private` and `privacy_settings` from profile
- [x] Page renders `PrivacySettingsClient` with current values as props

**Playwright Test:** `e2e/epic-3-privacy-settings.spec.ts` → `"Story 3.1: authenticated user can navigate to privacy settings page"`

---

### Story 3.2: Build privacy settings UI (client component)
**As a** user
**I want** to see and change my profile visibility and per-section settings
**So that** I can control who sees different parts of my profile

**Acceptance Criteria:**
- [x] `app/profile/settings/PrivacySettingsClient.tsx` created
- [x] Section A: "Public" vs "Private" radio card options (globe / lock icon)
- [x] Section B: per-section pill radio groups for Stats, Summit History, Badges, Groups (Everyone / Followers Only / Nobody)
- [x] UI follows the same visual pattern as `app/groups/[slug]/settings/GroupSettingsClient.tsx`
- [x] Save button present; submits to server action
- [x] Success feedback shown after save

**Playwright Test:** `e2e/epic-3-privacy-settings.spec.ts` → `"Story 3.2: user can change profile visibility and save settings"`

---

### Story 3.3: Create updatePrivacySettings server action
**As a** user
**I want** my settings saved to the database when I click Save
**So that** my privacy preferences persist

**Acceptance Criteria:**
- [x] `app/profile/settings/actions.ts` created with `updatePrivacySettings` server action
- [x] Action validates the authenticated user
- [x] Updates `is_private` and `privacy_settings` on the user's profile row
- [x] Returns a success/error result usable by the client component

**Playwright Test:** none (tested through Story 3.2 UI)

---

## Epic 4: Public Profile Page Updates
Status: not started

### Story 4.1: Fetch privacy and follow data on public profile
**As a** developer
**I want** the public profile page to load privacy settings and viewer's follow status
**So that** conditional rendering decisions can be made server-side

**Acceptance Criteria:**
- [ ] Profile SELECT in `app/u/[username]/page.tsx` includes `is_private` and `privacy_settings`
- [ ] `getFollowStatus(viewer.id, profile.id)` called for authenticated viewers
- [ ] `isFollower` boolean derived from status === "accepted"
- [ ] `isOwnProfile` check already exists and continues to work

**Playwright Test:** none (infrastructure; tested via Stories 4.3 and 4.4)

---

### Story 4.2: Wire up real FollowButton on public profile
**As a** user
**I want** to click a functional Follow button on another user's profile
**So that** I can send a follow request or start following them

**Acceptance Criteria:**
- [ ] Static/hardcoded follow button replaced with `<FollowButton>` component from `app/components/FollowButton.tsx`
- [ ] `targetUserId={profile.id}` and `initialStatus={followStatus}` passed as props
- [ ] Unauthenticated viewers see a "Log in to follow" link instead
- [ ] Own profile does not show follow button

**Playwright Test:** `e2e/epic-4-public-profile.spec.ts` → `"Story 4.2: follow button is visible on another user's public profile"`

---

### Story 4.3: Conditionally render profile sections based on privacy
**As a** user
**I want** profile sections I've restricted to be hidden from non-authorized viewers
**So that** my privacy settings are actually enforced on my profile

**Acceptance Criteria:**
- [ ] `canViewSection()` gates Stats bar, Badges, Groups, and Summit History sections
- [ ] When hidden, a lock placeholder is shown: "This section is only visible to followers" or "This section is private"
- [ ] Owner always sees all sections regardless of settings
- [ ] Accepted followers see sections set to "followers" or "everyone"
- [ ] Summit logs + routes queries are skipped entirely when `show_summit_history` blocks access

**Playwright Test:** `e2e/epic-4-public-profile.spec.ts` → `"Story 4.3: restricted sections show lock placeholder to non-followers"`

---

### Story 4.4: Show private profile lock screen for non-followers
**As a** user
**I want** to see a lock screen when visiting a private profile I don't follow
**So that** the account holder's privacy is protected

**Acceptance Criteria:**
- [ ] When `is_private = true` and viewer is not an accepted follower (and not the owner): show only avatar, name, screen_name, bio, and "This account is private" message
- [ ] Follow / Requested button still visible on the lock screen
- [ ] All section content (stats, badges, groups, summits) hidden
- [ ] Owner viewing own private profile sees full content

**Playwright Test:** `e2e/epic-4-public-profile.spec.ts` → `"Story 4.4: private profile shows lock screen to non-followers"`

---

## Epic 5: Navigation Updates
Status: not started

### Story 5.1: Add settings link to own profile page
**As a** user
**I want** a Settings link on my own profile page
**So that** I can easily reach `/profile/settings`

**Acceptance Criteria:**
- [ ] Gear icon or "Settings" link added to `app/profile/page.tsx`
- [ ] Link points to `/profile/settings`
- [ ] Link is only visible to the profile owner (already gated by auth on this page)

**Playwright Test:** `e2e/epic-5-navigation.spec.ts` → `"Story 5.1: authenticated user sees settings link on own profile"`

---

### Story 5.2: Add settings link on public profile for own-profile view
**As a** user
**I want** to see a Settings link when viewing my own public profile URL (`/u/[username]`)
**So that** I can manage privacy without navigating away

**Acceptance Criteria:**
- [ ] Settings link added to `app/u/[username]/page.tsx` when `isOwnProfile === true`
- [ ] Link appears near the "Edit Profile" button
- [ ] Link points to `/profile/settings`
- [ ] Link not shown to other viewers

**Playwright Test:** `e2e/epic-5-navigation.spec.ts` → `"Story 5.2: settings link appears on own public profile view"`

---
