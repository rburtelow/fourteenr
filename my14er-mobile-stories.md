# My14er Mobile App — User Stories

Stories are organized by the 6 development phases. Each story is sized to be completable in 1–3 days by a single developer.

---

## Phase 1 — Foundation

### SETUP-001 · Initialize Expo project
**As a** developer
**I want** a new Expo SDK 52 project with TypeScript, expo-router, and NativeWind configured
**So that** the team has a working baseline to build on

**Acceptance Criteria:**
- `npx expo start` boots without errors on iOS and Android simulators
- TypeScript strict mode is on
- NativeWind v4 utility classes render correctly on a test screen
- ESLint + Prettier are configured and pass on all files

---

### SETUP-002 · Configure design tokens
**As a** developer
**I want** all brand colors, typography, spacing, and radii from the web app defined as a theme module
**So that** all components reference a single source of truth that matches the web design system

**Acceptance Criteria:**
- `theme/colors.ts` contains all hex values from `globals.css` (Forest Green, Lime, off-white page, etc.)
- `theme/typography.ts` defines Hero, H1–H3, Body, Caption, Label styles using DM Sans + Playfair Display
- `theme/spacing.ts` and `theme/radii.ts` match the web scale
- A storybook-style DevScreen renders one swatch for each token

---

### SETUP-003 · Load custom fonts
**As a** user
**I want** the app to use DM Sans and Playfair Display
**So that** the visual experience matches the web app

**Acceptance Criteria:**
- Both font families (including Bold and Black weights) are loaded via `expo-font` before any screen renders
- A splash screen is shown until fonts are ready
- No unstyled text flash occurs on cold launch

---

### SETUP-004 · Configure Supabase client for mobile
**As a** developer
**I want** a Supabase client configured for React Native with MMKV session storage
**So that** auth sessions persist across app restarts without using AsyncStorage

**Acceptance Criteria:**
- `lib/supabase.ts` creates a client using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env`
- Sessions are persisted using `react-native-mmkv`
- `autoRefreshToken: true` is set
- Environment variable types are declared in `env.d.ts`

---

### SETUP-005 · Bottom tab navigation shell
**As a** user
**I want** a bottom tab bar with Home, Peaks, Log, Events, and Profile tabs
**So that** I can navigate to the main sections of the app

**Acceptance Criteria:**
- Five tabs render with correct icons from `react-native-svg` / icon library
- The center Log tab has a raised pill button styled in Lime (`#11D432`)
- Active tab tint uses Forest Green (`#064E3B`)
- Each tab shows a placeholder screen with its title
- Tab bar background is white with a subtle top border

---

### SETUP-006 · Auth guard and routing
**As a** user
**I want** to be redirected to Login if I'm not signed in when accessing protected screens
**So that** unauthenticated users can't reach content that requires an account

**Acceptance Criteria:**
- Root `_layout.tsx` checks session state on mount
- Unauthenticated users are redirected to `/(auth)/login`
- Authenticated users are redirected away from auth screens to `/(tabs)`
- A loading indicator is shown while the session check is in progress
- Deep links to protected screens redirect to login then back after auth

---

### AUTH-001 · Login screen
**As a** returning user
**I want** to log in with my email and password
**So that** I can access my account

**Acceptance Criteria:**
- Email and password inputs with correct keyboard types
- "Sign In" button calls `supabase.auth.signInWithPassword`
- Inline error message shown for invalid credentials
- Loading state on button during request
- Link to Signup screen
- Matches web login page color scheme (white card on green background)

---

### AUTH-002 · Google OAuth login
**As a** returning user
**I want** to sign in with my Google account
**So that** I don't need to remember a password

**Acceptance Criteria:**
- "Continue with Google" button triggers `supabase.auth.signInWithOAuth`
- OAuth flow opens in an in-app browser via `expo-web-browser`
- Deep link callback `myapp://auth/callback` returns user to app and completes session
- Errors are surfaced as an inline message

---

### AUTH-003 · Signup screen
**As a** new user
**I want** to create an account with my email and password
**So that** I can start using the app

**Acceptance Criteria:**
- Email, password, and confirm password fields
- Client-side validation: email format, password min length, passwords match
- Calls `supabase.auth.signUp` on submit
- Success navigates to Setup Profile screen
- Error cases shown inline (email already in use, weak password)

---

### AUTH-004 · Setup profile screen
**As a** new user
**I want** to set my display name and location after signing up
**So that** my profile is ready for the community

**Acceptance Criteria:**
- Screen is only reachable immediately after signup (or if `screen_name` is null)
- Fields: Full Name, Screen Name (username), Location (optional)
- Screen name uniqueness validated against `profiles` table
- On submit, upserts `profiles` row and navigates to home tab
- "Skip for now" option that navigates with default values

---

### AUTH-005 · Sign out
**As a** signed-in user
**I want** to sign out of the app
**So that** I can protect my account on shared devices

**Acceptance Criteria:**
- Sign out option accessible from Profile tab → Settings
- Calls `supabase.auth.signOut`, clears MMKV session
- Redirects to Login screen after signing out
- Confirmation alert shown before signing out

---

### UI-001 · Core UI primitives — Button
**As a** developer
**I want** a `Button` component with Primary, Secondary, Ghost, and Danger variants
**So that** all action buttons are consistent throughout the app

**Acceptance Criteria:**
- Primary: Forest Green background, white text, pill shape
- Secondary: white background, Forest Green border + text
- Ghost: transparent background, muted text
- Danger: red background, white text
- Loading state replaces label with `ActivityIndicator`
- Disabled state has reduced opacity and no press feedback

---

### UI-002 · Core UI primitives — Card, Avatar, Badge chip
**As a** developer
**I want** Card, Avatar, and Badge chip primitives
**So that** content surfaces have a consistent look across all screens

**Acceptance Criteria:**
- Card: white background, `radius-xl`, shadow-sm matching web shadow tokens
- Avatar: circular, supports image URL with initials fallback, sizes: sm / md / lg
- Badge chip: pill shape, supports color variants (green, amber, red, grey)
- All support a `style` prop for overrides

---

### UI-003 · Skeleton loaders
**As a** user
**I want** placeholder skeleton animations while content loads
**So that** the app feels fast and responsive

**Acceptance Criteria:**
- `SkeletonCard` and `SkeletonRow` components using animated shimmer effect
- Color matches surface-subtle (`#E7F3E9`)
- Used in at minimum: feed, peaks list, and profile screens
- Transitions to real content without layout shift

---

## Phase 2 — Core Content

### PEAKS-001 · Peaks directory list
**As a** user
**I want** to browse all 58 Colorado 14ers in a scrollable list
**So that** I can discover and explore peaks

**Acceptance Criteria:**
- Fetches all peaks via `getAllPeaks()` adapted for mobile Supabase client
- Displays peak name, elevation, rank, and mountain range
- Sorted by rank by default
- `FlashList` used for performance (not FlatList)
- Pull-to-refresh updates the list
- Skeleton loaders shown on first load

---

### PEAKS-002 · Peak search and filter
**As a** user
**I want** to search peaks by name and filter by range or difficulty
**So that** I can find specific peaks quickly

**Acceptance Criteria:**
- Search input filters list in real time (client-side, no API call per keystroke)
- Filter bottom sheet: Mountain Range multi-select, Sort By (rank / elevation / alpha / trending)
- Active filter count shown on filter button
- Clearing filters restores full list
- Empty state shown if no peaks match

---

### PEAKS-003 · Forecast risk badge on peak cards
**As a** user
**I want** to see the current forecast risk level on each peak card
**So that** I can quickly identify safe summiting conditions

**Acceptance Criteria:**
- Fetches `peak_forecasts` for all peaks alongside peak data
- Risk badge shows: Low (green) / Moderate (amber) / High (orange) / Extreme (red)
- Current temperature shown alongside risk badge
- Condition flags (wind, lightning, snow) shown as small icons when active
- Badge is omitted gracefully if forecast data is unavailable

---

### PEAKS-004 · Peak detail — header and overview
**As a** user
**I want** to tap a peak and see its key stats and description
**So that** I know what I'm planning to climb

**Acceptance Criteria:**
- Hero image (or gradient placeholder) with peak name overlay
- Stats row: Elevation, Rank, Prominence
- Mountain range and location
- Shared element transition from list card to detail header
- Watchlist star button in top-right header
- "Log This Summit" sticky CTA at bottom

---

### PEAKS-005 · Peak detail — routes tab
**As a** user
**I want** to see all available routes for a peak
**So that** I can choose the right path for my skill level

**Acceptance Criteria:**
- Lists all routes from `routes` table for the peak
- Each route shows: name, distance, elevation gain, difficulty, estimated time
- Difficulty uses color-coded chip (green / amber / orange / red)
- Trailhead name links to Trailhead detail screen
- Empty state if no routes are recorded

---

### PEAKS-006 · Peak detail — forecast tab
**As a** user
**I want** to see a detailed weather forecast for a peak
**So that** I can plan a safe summit attempt

**Acceptance Criteria:**
- Risk score and risk level prominently displayed
- Condition flags shown as icon+label chips (Wind Risk, Lightning, Snow, Whiteout, Extreme Cold)
- Hourly forecast as a horizontal scroll: time, temperature, wind speed, precipitation chance
- "Last updated" timestamp shown
- Graceful empty state if forecast is unavailable

---

### PEAKS-007 · Peak watchlist
**As a** user
**I want** to add and remove peaks from my watchlist
**So that** I can track peaks I'm planning to summit

**Acceptance Criteria:**
- Watch/Unwatch star button on peak detail header
- Tapping inserts/deletes from `peak_watchlist` table
- Button state reflects current watch status immediately (optimistic update)
- Watchlist accessible from Profile tab
- Haptic feedback on toggle

---

### PEAKS-008 · Trailhead detail
**As a** user
**I want** to view trailhead information including location and access notes
**So that** I can plan how to get to the start of a route

**Acceptance Criteria:**
- Displays trailhead name, parking info, and access notes
- Map showing trailhead pin (react-native-maps)
- "Get Directions" button opens Apple Maps / Google Maps with coordinates
- Lists associated routes with links to peak detail
- Distance from user's current location shown if location permission granted

---

### REPORTS-001 · Trip report detail view
**As a** user
**I want** to read a detailed trip report written by another hiker
**So that** I can learn about conditions and what to expect on a route

**Acceptance Criteria:**
- Displays: hike date, peak, route, difficulty rating, weather, conditions
- Sections rendered with headings and body text
- Photos shown in a horizontally scrollable image strip
- Tapping a photo opens it fullscreen with pinch-to-zoom
- Author name + avatar link to their public profile
- Back navigation returns to whatever screen linked here

---

## Phase 3 — Social & Interaction

### FEED-001 · Home feed — read-only posts
**As a** user
**I want** to see a scrollable feed of posts from the community
**So that** I can stay up to date on what other hikers are doing

**Acceptance Criteria:**
- Paginated feed via `getPosts()` with cursor-based pagination
- Post types rendered: status update, condition report, badge earned, summit log
- Author avatar + name, timestamp, peak tag (if any), post body, optional image
- `FlashList` for performance
- Pull-to-refresh loads newest posts
- Skeleton loaders on initial load

---

### FEED-002 · Trending peaks strip on Home
**As a** user
**I want** to see trending peaks at the top of my home feed
**So that** I can discover what the community is excited about

**Acceptance Criteria:**
- Horizontal scroll of up to 5 trending peak cards above the feed
- Each card shows peak name, rank badge, and trend percentage
- Tapping a card navigates to Peak detail
- Data from `trending_peaks_cache` table
- Refreshes with the feed on pull-to-refresh

---

### FEED-003 · Like a post
**As a** user
**I want** to like posts in the feed
**So that** I can show appreciation for other hikers' content

**Acceptance Criteria:**
- Heart icon on each post card
- Tapping toggles like status (insert/delete `post_likes`)
- Like count updates immediately (optimistic)
- Icon fills when liked (Forest Green or Lime)
- Haptic feedback on like
- Requires authentication; unauthenticated users are prompted to log in

---

### FEED-004 · Save a post
**As a** user
**I want** to save posts to read later
**So that** I can bookmark useful condition reports and trip ideas

**Acceptance Criteria:**
- Bookmark icon on each post card
- Toggles save status (insert/delete `post_saves`)
- Count updates immediately (optimistic)
- Saved posts accessible from Profile tab → Saved
- Haptic feedback on save

---

### FEED-005 · Comment on a post
**As a** user
**I want** to add a comment to a post
**So that** I can engage with the community

**Acceptance Criteria:**
- Tap comment icon opens a comment thread bottom sheet
- Shows existing comments with author avatar, name, timestamp
- Text input at bottom of sheet with "Send" button
- Submitting inserts into `post_comments`, comment appears immediately
- Comment count on post card updates after submission
- Keyboard avoidance keeps input visible when keyboard opens

---

### FEED-006 · New post composer
**As a** user
**I want** to write and publish a post to the community feed
**So that** I can share updates and condition reports with other hikers

**Acceptance Criteria:**
- Accessible via "+" FAB on the Home tab
- Free text area for post body
- Optional peak tag selector (searchable list)
- Toggle for "Condition Report" flag
- Photo attachment: up to 4 photos from camera or library
- Photos upload to Supabase Storage, URLs stored in `image_urls`
- Submit creates row in `community_posts`, new post appears at top of feed
- Character count shown

---

### FEED-007 · Real-time new post indicator
**As a** user
**I want** to see a "New posts" pill appear when new posts arrive
**So that** I can read fresh content without losing my scroll position

**Acceptance Criteria:**
- Supabase Realtime subscription on `community_posts` INSERT
- When new post arrives, a pill ("↑ 2 new posts") appears at top of feed
- Tapping the pill scrolls to top and dismisses it
- Pill is styled in Forest Green with white text

---

### NOTIF-001 · Notifications screen
**As a** user
**I want** to see a list of my notifications
**So that** I know when someone likes my post, follows me, or I earn a badge

**Acceptance Criteria:**
- Full-screen list of notifications from `notifications` table
- Notification types: like, comment, badge, follow_request, follow_accepted, group_join_approved
- Unread notifications have a subtle green left border highlight
- Tapping a notification deep-links to the relevant post / profile / group
- "Mark all as read" button in header
- Unread count badge on bell icon in Home tab header

---

### NOTIF-002 · Push notification registration
**As a** user
**I want** to receive push notifications from the app
**So that** I get real-time alerts even when the app is backgrounded

**Acceptance Criteria:**
- On first launch after login, request push notification permission via `expo-notifications`
- Expo push token saved to `profiles.push_token` column in Supabase
- Token is refreshed and re-saved if it changes
- If permission is denied, the app functions normally without push
- `expo-notifications` handler processes foreground notifications with a native banner

---

### SOCIAL-001 · View a user's public profile
**As a** user
**I want** to tap on a username and view their public profile
**So that** I can learn about other hikers and see their activity

**Acceptance Criteria:**
- Screen at `/u/[username]` shows: avatar, display name, location, bio
- Stats row: summit count, badge count, follower count, following count
- Recent trip reports list (up to 5)
- Badge grid (earned badges)
- Follow / Unfollow button (see SOCIAL-002)
- Loading state with skeleton

---

### SOCIAL-002 · Follow and unfollow users
**As a** user
**I want** to follow other hikers
**So that** their posts appear in my feed

**Acceptance Criteria:**
- "Follow" button on public profiles creates a `follows` row with `status: pending` (if user is private) or `status: accepted` (if public)
- Button changes to "Following" after accepted, "Requested" if pending
- "Unfollow" on a following removes the row with a confirmation alert
- Follower/following counts update immediately (optimistic)
- `FollowButton` component reusable across profile screens and community cards

---

### SOCIAL-003 · Follow requests management
**As a** user
**I want** to accept or decline follow requests
**So that** I control who sees my activity

**Acceptance Criteria:**
- Follow requests section visible in Profile tab → Friends/Followers
- Shows pending requests with requester avatar, name, and mutual follow count
- Accept button updates `follows.status` to `accepted`
- Decline button deletes the `follows` row
- Notification sent to requester on accept (via existing `notifications` insert)
- Badge count on Profile tab updates when new requests arrive

---

### SOCIAL-004 · Friends & followers screen
**As a** user
**I want** to see my followers and the people I follow
**So that** I can manage my social connections

**Acceptance Criteria:**
- Two tabs: Followers / Following
- Each row: avatar, name, username, Follow/Following button
- Search input filters the list
- Tapping a user navigates to their public profile
- Unfollow inline from Following tab with confirmation

---

## Phase 4 — Logging & Badges

### LOG-001 · Log summit — Step 1: select peak and route
**As a** user
**I want** to select which peak and route I summited as the first step of logging
**So that** my summit is attached to the correct peak

**Acceptance Criteria:**
- Searchable peak selector (all 58 peaks)
- After peak selection, route selector shows available routes for that peak
- "Unknown route" option available
- Selected peak and route shown as confirmation chips
- "Next" button disabled until both are selected

---

### LOG-002 · Log summit — Step 2: hike date and time
**As a** user
**I want** to set the date and start/end time of my hike
**So that** my summit log has accurate timing information

**Acceptance Criteria:**
- Date picker defaulting to today
- Optional start time and end time pickers
- Duration calculated and shown if both times are set
- "Next" button advances to step 3

---

### LOG-003 · Log summit — Step 3: conditions
**As a** user
**I want** to record the weather and trail conditions I experienced
**So that** others can benefit from current conditions information

**Acceptance Criteria:**
- Weather selector: Sunny, Partly Cloudy, Overcast, Rain, Snow, Wind, Thunderstorm (multi-select chips)
- Snow level: None, Patchy, Moderate, Heavy (single select)
- Trail surface: Dry, Wet, Icy, Muddy (multi-select chips)
- All fields optional
- "Next" advances to step 4

---

### LOG-004 · Log summit — Step 4: difficulty and safety ratings
**As a** user
**I want** to rate the difficulty and safety of my hike
**So that** the community has data to calibrate their expectations

**Acceptance Criteria:**
- Difficulty rating: 1–5 star selector with labels (Easy → Extreme)
- Risk assessment: Low / Moderate / High / Extreme (radio buttons)
- Optional free text for risk notes
- All fields optional
- "Next" advances to step 5

---

### LOG-005 · Log summit — Step 5: notes
**As a** user
**I want** to write free-form notes about my hike
**So that** I can share detailed information with the community

**Acceptance Criteria:**
- Multi-section notes (matches web TripReportModal sections): Overview, Trail Conditions, Gear, Other Notes
- Each section has a collapsible header and expandable text area
- Character count per section
- Sections are optional — collapsed if empty
- "Next" advances to step 6

---

### LOG-006 · Log summit — Step 6: photos
**As a** user
**I want** to attach photos to my summit log
**So that** my report is more useful and engaging

**Acceptance Criteria:**
- Tap to add photos from camera or photo library via `expo-image-picker`
- Up to 8 photos
- Photos shown as thumbnail grid with remove (×) button
- Photos upload to Supabase Storage on submit (not on add)
- Upload progress shown per photo during final submit

---

### LOG-007 · Log summit — submit and publish
**As a** user
**I want** to submit my completed summit log
**So that** it's saved to my profile and optionally shared with the community

**Acceptance Criteria:**
- Review step shows a summary of all entered data
- "Share to community feed" toggle (on by default)
- Submit creates: `summit_logs` row + `trip_reports` row + `community_posts` row (if toggle on)
- Success screen with confetti/animation and a "View Report" button
- Haptic success feedback on completion
- Loading/progress state during submission
- Error handling with retry option

---

### BADGE-001 · Badge showcase screen
**As a** user
**I want** to browse all available badges and see which ones I've earned
**So that** I know what achievements to work towards

**Acceptance Criteria:**
- Grid of all badges from `badge_definitions`
- Earned badges shown in full color with an earned date
- Unearned badges shown in grayscale with a lock icon
- Filter by category (summit milestones, community, skill, etc.)
- Tapping a badge shows a bottom sheet with name, description, and earn criteria

---

### BADGE-002 · Badge earn animation
**As a** user
**I want** an animation to play when I earn a new badge
**So that** earning badges feels rewarding

**Acceptance Criteria:**
- After a summit log submit or post action that triggers a badge, a full-screen modal animates in
- Badge icon scales in with a glow/shimmer effect using Reanimated
- "You earned a badge!" message with badge name and description
- Dismiss by tapping or waiting 3 seconds
- Haptic success feedback

---

### PROFILE-001 · My profile screen
**As a** user
**I want** to view my own profile with my stats and history
**So that** I can review my progress and manage my presence

**Acceptance Criteria:**
- Avatar, full name, screen name, location, bio
- Edit profile button (navigates to edit screen)
- Stats: total summits, badges earned, followers, following
- Horizontal scroll of earned badges (top 5)
- Hike timeline: vertical list of summit logs with date, peak, route
- "View all trip reports" navigates to full list

---

### PROFILE-002 · Edit profile
**As a** user
**I want** to edit my display name, bio, location, and avatar
**So that** my profile accurately represents me

**Acceptance Criteria:**
- Fields: Full Name, Screen Name, Bio (max 160 chars with count), Location
- Avatar tap opens image picker; selected image uploads to Supabase Storage and saves URL to `profiles.avatar_url`
- Screen name uniqueness re-validated on change
- Save button upserts `profiles` row
- Changes reflected immediately on profile screen after save

---

### PROFILE-003 · My saved posts
**As a** user
**I want** to view all posts I've saved
**So that** I can revisit useful condition reports and trip ideas

**Acceptance Criteria:**
- Accessible from Profile tab → Saved
- List of saved posts using standard PostCard component
- Pull-to-refresh
- Unsave inline via long-press context menu or bookmark icon toggle
- Empty state with prompt to start saving posts

---

## Phase 5 — Events, Groups & Map

### EVENTS-001 · Events listing
**As a** user
**I want** to browse upcoming community hiking events
**So that** I can find group hikes to join

**Acceptance Criteria:**
- List of upcoming events from `community_events` table
- Each card: title, date, location, peak tag, attendee count, RSVP status
- Default sorted by date ascending
- Filter options: date range, location (peak / trailhead), group
- "This Weekend" quick filter chip
- Empty state for no upcoming events

---

### EVENTS-002 · RSVP to an event
**As a** user
**I want** to RSVP to a community event
**So that** organizers know I'm coming and I get reminders

**Acceptance Criteria:**
- RSVP button on event cards and event detail
- Tapping inserts/deletes `event_attendees` row
- Attendee count updates immediately (optimistic)
- At capacity state disables RSVP if `max_attendees` reached
- Haptic feedback on RSVP

---

### EVENTS-003 · Event detail screen
**As a** user
**I want** to see full details of an event including attendees
**So that** I know exactly what to expect before committing

**Acceptance Criteria:**
- Title, description, date/time, location, peak link
- Organizer avatar + name
- Attendee count and scrollable attendee list (avatar + name)
- RSVP button (see EVENTS-002)
- Map pin showing event location
- "Add to Calendar" button via `expo-calendar`

---

### GROUPS-001 · Groups directory
**As a** user
**I want** to browse and search hiking groups
**So that** I can find a community that matches my interests

**Acceptance Criteria:**
- List of groups from `getGroups()` with member count
- Category filter chips: General, Route Beta, Skill Level, Local Chapter, Trip Planning, Gear, Conditions
- Search by group name
- Joined groups shown with a "Joined" badge
- Suggested groups section at top for logged-in users

---

### GROUPS-002 · Join and leave a group
**As a** user
**I want** to join public groups and request to join private groups
**So that** I can participate in group discussions

**Acceptance Criteria:**
- Join button on group cards and group detail
- Public groups: join immediately, button changes to "Leave"
- Private groups: request sent, button changes to "Requested"
- Leave triggers a confirmation alert
- Member count updates optimistically

---

### GROUPS-003 · Group detail screen
**As a** user
**I want** to see a group's details, members, and discussion feed
**So that** I can decide whether to join and participate

**Acceptance Criteria:**
- Group name, description, category, privacy, member count
- Cover image (or placeholder gradient)
- Join/Leave button
- Member list (top 5 avatars + count)
- Group post feed using standard PostCard component
- Peak association shown if group is linked to a peak

---

### MAP-001 · Peaks map view
**As a** user
**I want** to see all 58 peaks plotted on a Colorado map
**So that** I can visually explore peaks by geography

**Acceptance Criteria:**
- Map centered on Colorado using `react-native-maps`
- Each peak plotted as a custom marker (mountain icon, color-coded by risk level)
- Tapping a marker shows a callout with peak name and elevation
- Tapping the callout navigates to Peak detail
- Toggle between list and map view on the Peaks tab
- User location shown if permission granted

---

### MAP-002 · Distance to trailhead
**As a** user
**I want** to see how far I am from a trailhead
**So that** I can plan my drive and logistics

**Acceptance Criteria:**
- Requests location permission on first access
- Trailhead detail screen shows driving distance calculated from GPS coordinates
- "Get Directions" button passes coordinates to Maps app
- Gracefully omits distance if location permission is denied
- Distance shown in miles with one decimal place

---

### MAP-003 · Events map view
**As a** user
**I want** to see upcoming events on a map
**So that** I can find events near me

**Acceptance Criteria:**
- Toggle between list and map view on the Events tab
- Events with location data plotted as pins
- Tapping a pin shows event title, date, and RSVP count in a callout
- Tapping callout navigates to Event detail

---

## Phase 6 — Polish & Launch

### PERF-001 · Offline peak cache
**As a** user
**I want** peak and trailhead data to be available when I have no signal
**So that** I can reference route info while in the backcountry

**Acceptance Criteria:**
- All peaks and trailheads cached to MMKV on first successful load
- Cached data used when network is unavailable
- "Last updated" timestamp shown when using cached data
- Cache invalidated and refreshed on successful network reconnect
- Cache size bounded (peaks + trailheads only, not feed/events)

---

### PERF-002 · Offline summit log queue
**As a** user
**I want** to submit a summit log even when offline
**So that** I can log my hike immediately after summiting without cell service

**Acceptance Criteria:**
- Submit attempt when offline adds the log to a local queue in MMKV
- A banner informs the user "Saved locally — will post when connected"
- On network reconnect, queued logs are submitted automatically
- If submission fails after reconnect, user is notified and given retry option
- Queued items visible in Profile tab with "Pending" status

---

### A11Y-001 · Accessibility pass
**As a** user with accessibility needs
**I want** the app to work with VoiceOver (iOS) and TalkBack (Android)
**So that** the app is usable regardless of ability

**Acceptance Criteria:**
- All interactive elements have `accessibilityLabel` and `accessibilityRole`
- Minimum touch target size of 44×44pt on all tappable elements
- Color is not the sole means of conveying information (icons + text alongside color chips)
- Dynamic text size (large accessibility fonts) does not break layouts
- Screen reader announces state changes (liked, saved, followed)

---

### STORE-001 · App Store and Play Store assets
**As a** developer
**I want** all required store assets prepared and submitted
**So that** the app can go live on both platforms

**Acceptance Criteria:**
- App icon designed and exported at all required sizes (1024×1024 master)
- Splash screen configured in `app.json`
- iOS: 6.7" and 6.1" screenshots captured for all 5 required screens
- Android: Phone and 7" tablet screenshots captured
- App description, keywords, and privacy policy URL ready
- EAS Build configured for production signing
- TestFlight (iOS) and Internal Test (Android) build distributed for beta testing

---

### STORE-002 · Push notifications for watched peaks
**As a** user
**I want** to receive a push notification when a watched peak has high-risk forecast conditions
**So that** I can avoid planning a summit on a dangerous day

**Acceptance Criteria:**
- Supabase Edge Function runs daily and checks `peak_watchlist` + `peak_forecasts`
- Push sent via Expo Push API when a watched peak transitions to High or Extreme risk
- Notification body: "[Peak Name] is showing [Risk Level] conditions for tomorrow"
- Tapping notification deep-links to the peak's forecast tab
- Users can disable this notification type in app Settings → Notifications
