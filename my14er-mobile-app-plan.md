# My14er Mobile App — Build Plan

**Project:** Native mobile companion to My14er web app (`../my14er`)
**Date:** March 2026
**Target Platforms:** iOS & Android

---

## 1. Technology Stack Recommendation

### Framework: React Native + Expo (SDK 52+)

Given that the web app is already React/TypeScript, **React Native with Expo** is the clear choice:

- Re-use all existing Supabase backend, auth logic, and data services from `lib/` with minimal modification
- TypeScript types from `lib/database.types.ts` transfer directly
- Server actions become Supabase client calls — no rewrite needed
- The team already knows React patterns
- Expo's managed workflow handles iOS/Android builds, push notifications, and OTA updates without Xcode/Android Studio for day-to-day work

### Core Dependencies

| Package | Purpose |
|---|---|
| `expo` (SDK 52+) | Base framework, build system |
| `expo-router` | File-based navigation (mirrors Next.js App Router mental model) |
| `@supabase/supabase-js` | Database, auth — same version as web app |
| `@supabase/ssr` → `@supabase/auth-helpers-react-native` | Auth session handling on mobile |
| `react-native-mmkv` | Fast key-value storage for session persistence |
| `expo-notifications` | Push notifications |
| `expo-location` | GPS for trailhead proximity, peak distance |
| `expo-image` | Optimized image loading (replaces Next.js `<Image>`) |
| `react-native-maps` | Mapview for peaks, trailheads, trails |
| `@shopify/flash-list` | High-perf list rendering (replaces `map()` over large datasets) |
| `react-native-reanimated` v3 | Gesture-driven animations, shared element transitions |
| `react-native-gesture-handler` | Swipe interactions, pull-to-refresh |
| `nativewind` v4 | Tailwind CSS utility classes on React Native — mirrors web styling |
| `expo-font` | DM Sans + Playfair Display (same as web) |
| `expo-haptics` | Tactile feedback for key actions (summit log, like) |
| `expo-secure-store` | Secure credential storage |
| `react-native-svg` | SVG icons (react-icons parity) |

---

## 2. Design System — Web to Mobile Mapping

The web app's design tokens translate directly into a React Native theme file. No color or typographic decisions need to be made — just lift them from `globals.css`.

### Color Tokens

```typescript
// theme/colors.ts
export const colors = {
  // Brand
  brandPrimary:   '#064E3B',  // Forest green — primary actions, nav active
  brandAccent:    '#065F46',  // Darker green — hover/press states
  brandHighlight: '#11D432',  // Lime — badges, success, CTAs

  // Backgrounds
  page:           '#F6F8F6',  // App background
  surface:        '#FFFFFF',  // Cards, modals, sheets
  surfaceSubtle:  '#E7F3E9',  // Tinted inputs, secondary rows

  // Text
  textPrimary:    '#0D1B10',
  textSecondary:  '#334155',
  textMutedGreen: '#4C9A59',
  textOnBrand:    '#FFFFFF',

  // Borders
  borderApp:      '#E7F3E9',
  borderStrong:   '#CFE7D3',

  // Accents
  stoneWarm:      '#D4C4B0',
  amberGlow:      '#E8A838',
  mint:           '#7FE3D2',
  lime:           '#B9D60F',
};
```

### Typography

```typescript
// theme/typography.ts
// Same fonts as web — load via expo-font
export const fonts = {
  dmSans:           'DMSans',
  dmSansMedium:     'DMSans-Medium',
  dmSansSemibold:   'DMSans-SemiBold',
  dmSansBold:       'DMSans-Bold',
  playfair:         'PlayfairDisplay',
  playfairBold:     'PlayfairDisplay-Bold',
  playfairBlack:    'PlayfairDisplay-Black',
};

export const typography = {
  hero:     { fontFamily: fonts.playfairBlack, fontSize: 36, lineHeight: 44 },
  h1:       { fontFamily: fonts.playfairBold,  fontSize: 28, lineHeight: 36 },
  h2:       { fontFamily: fonts.dmSansBold,    fontSize: 22, lineHeight: 30 },
  h3:       { fontFamily: fonts.dmSansSemibold,fontSize: 18, lineHeight: 26 },
  body:     { fontFamily: fonts.dmSans,        fontSize: 16, lineHeight: 24 },
  caption:  { fontFamily: fonts.dmSans,        fontSize: 13, lineHeight: 20 },
  label:    { fontFamily: fonts.dmSansSemibold,fontSize: 12, lineHeight: 18 },
};
```

### Spacing & Radii

```typescript
export const spacing = { 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64 };
export const radii   = { sm:8, md:12, lg:16, xl:20, xxl:24, pill:9999 };
```

---

## 3. App Architecture

```
my14er-mobile/
├── app/                          # expo-router file-based routing
│   ├── _layout.tsx               # Root layout (fonts, providers, auth guard)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── setup-profile.tsx
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar config (5 tabs)
│   │   ├── index.tsx             # Home / Feed
│   │   ├── peaks.tsx             # Peaks directory
│   │   ├── log.tsx               # Log Summit (CTA tab)
│   │   ├── events.tsx            # Events & groups
│   │   └── profile.tsx           # User profile
│   ├── peaks/
│   │   └── [slug].tsx            # Peak detail (routes, forecast, trip reports)
│   ├── trailheads/
│   │   └── [slug].tsx            # Trailhead detail
│   ├── reports/
│   │   └── [id].tsx              # Trip report detail
│   ├── u/
│   │   └── [username].tsx        # Public user profile
│   ├── events/
│   │   └── [id].tsx              # Event detail
│   ├── groups/
│   │   └── [slug].tsx            # Group detail
│   ├── friends.tsx               # Follows management
│   ├── badges.tsx                # Badge showcase
│   ├── notifications.tsx         # Notifications center
│   └── search.tsx                # Global search
├── components/
│   ├── ui/                       # Primitives (Button, Card, Badge, Input, Avatar, etc.)
│   ├── peaks/                    # PeakCard, ForecastCard, RouteRow, WatchButton
│   ├── community/                # PostCard, CommentThread, NotificationBell
│   ├── profile/                  # ProfileHeader, StatRow, TripReportRow
│   ├── events/                   # EventCard, RSVPButton, AttendeeList
│   ├── groups/                   # GroupCard, MemberRow
│   ├── badges/                   # BadgeIcon, BadgeGrid, EarnedBadge
│   ├── navigation/               # TabBar, HeaderRight, BackButton
│   └── layout/                   # ScreenContainer, Divider, SectionHeader
├── lib/                          # Shared logic — largely copied/adapted from web
│   ├── supabase.ts               # Mobile Supabase client
│   ├── peaks.ts                  # Peak queries (same as web)
│   ├── community.ts              # Community queries
│   ├── notifications.ts          # Notification queries + push token registration
│   ├── badges.ts
│   ├── groups.ts
│   ├── follows.ts
│   ├── trailheads.ts
│   ├── forecasts.ts
│   └── database.types.ts         # Symlink or copy from web app
├── hooks/
│   ├── useAuth.ts                # Current user session
│   ├── usePeaks.ts               # Peaks with real-time updates
│   ├── useFeed.ts                # Paginated community feed
│   ├── useNotifications.ts       # Notification count + list
│   └── useLocation.ts            # GPS position
├── stores/
│   └── authStore.ts              # Zustand store for user session
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   └── index.ts
└── constants/
    └── peaks.ts                  # Static peak list for offline/fast load
```

---

## 4. Navigation Structure

### Bottom Tab Bar (5 tabs)

| Tab | Icon | Screen | Web Equivalent |
|---|---|---|---|
| **Home** | House | Community feed + trending peaks | `/community` |
| **Peaks** | Mountain | Peak directory + map | `/peaks` |
| **Log** | Plus (center, large, accent) | Log summit / create post | Log Summit Button |
| **Events** | Calendar | Events + groups | `/events`, `/groups` |
| **Profile** | User | Personal profile | `/profile` |

The center **Log** tab should use a raised button with the lime highlight (`#11D432`) to make it the obvious primary action — matching `LogSummitButton` on web.

### Navigation Patterns

- **Stack navigation** within each tab for detail screens
- **Bottom sheet** for: filter panels, quick post composer, trip report modal
- **Modal stack** for: login/signup, photo viewer, map fullscreen
- **Shared element transitions** between peak cards → peak detail using Reanimated

---

## 5. Key Mobile-Native Additions

These features go beyond the web app and leverage native device capabilities:

### GPS & Location
- Show distance to trailhead parking from user's current location
- "Peaks Near Me" — filter peaks within X miles on map
- Background location tracking during active hikes (opt-in)

### Push Notifications
- New post from followed user
- Follow request received / accepted
- Badge earned
- Event RSVP reminder (day before)
- Forecast alert for watched peaks (high-risk conditions)

Uses Expo Push Notifications + Supabase Edge Function for server-side scheduling.

### Offline Support
- Cache peak data, routes, and trailhead info locally with `react-native-mmkv`
- Queue summit logs and posts when offline, sync on reconnect
- Cached forecasts show "last updated" timestamp

### Camera Integration
- Photo attachment in trip reports via `expo-camera` / `expo-image-picker`
- Upload directly to Supabase Storage bucket
- Optional GPS EXIF tagging on summit photos

### Haptics
- Subtle haptic on: like, save, summit log submit, RSVP, badge earn animation

---

## 6. Supabase Integration on Mobile

The existing backend requires **zero changes**. The mobile app connects to the same Supabase project.

### Authentication
Replace Next.js cookie-based auth with `react-native-mmkv` for token persistence:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Push Notification Token Registration
Store Expo push token in profiles table (add `push_token` column):

```sql
ALTER TABLE profiles ADD COLUMN push_token text;
```

### Real-time Subscriptions

```typescript
supabase
  .channel('community_posts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' },
    handleNewPost)
  .subscribe();
```

---

## 7. Development Phases

### Phase 1 — Foundation (Weeks 1–3)
- Expo project setup with TypeScript, NativeWind, expo-router
- Supabase client + auth flow (login, signup, profile setup, Google OAuth)
- Theme system (colors, typography, spacing)
- Bottom tab navigation shell
- Core UI primitives (Button, Card, Avatar, Input, Badge, Skeleton loaders)

### Phase 2 — Core Content (Weeks 4–6)
- Peaks directory with search/filter
- Peak detail with routes, forecast, watchlist
- Trailhead detail with map + directions
- Trip report detail view (read-only)
- Home feed (read-only, paginated, FlashList)

### Phase 3 — Social & Interaction (Weeks 7–9)
- Like / comment / save on posts
- Post composer (text + photo)
- Notifications center + push notification registration
- User profiles (own + public)
- Follow / unfollow with request flow
- Friends / followers screen

### Phase 4 — Logging & Badges (Weeks 10–11)
- Log Summit wizard (full trip report creation)
- Badge showcase + earned badge animations
- Personal hike timeline

### Phase 5 — Events, Groups & Map (Weeks 12–14)
- Events listing + RSVP
- Groups directory + detail
- Peaks map view (react-native-maps)
- Events map view
- GPS features (distance to trailhead, "near me" filter)

### Phase 6 — Polish & Launch (Weeks 15–16)
- Offline caching for peaks/trailheads
- Post queue for offline summit logging
- Performance profiling
- App Store / Play Store assets
- TestFlight / Internal Track beta testing

---

## 8. Recommended MCPs

### Supabase MCP — High Priority
The web app already uses Supabase as its entire backend. Connect to your live project to inspect tables, run migrations, manage auth users, check RLS policies, and analyze query performance for mobile use cases. You'll need it to add the `push_token` column to `profiles`.

### Figma MCP — High Priority
If you create mobile mockups in Figma, this gives Claude direct access to extract color tokens, component specs, and layout dimensions — and generate React Native component code directly from your designs.

### Context7 MCP — Medium Priority
Provides up-to-date documentation for any library you're using. Expo SDK, NativeWind v4, and Supabase's React Native auth helpers all update frequently. Ensures Claude references current APIs rather than outdated training data.

---

## 9. Repository Layout

```
rmbdigital/
├── my14er/              # Existing web app (Next.js)
└── my14er-mobile/       # New mobile app (Expo)
    ├── lib/
    │   └── database.types.ts   # Symlink → ../my14er/lib/database.types.ts
    └── ...
```

Symlinking `database.types.ts` ensures both apps stay in sync as the schema evolves. All other `lib/` query files can be copied and minimally adapted — remove `{ next: { revalidate } }` cache hints and replace server-only patterns with direct client calls.

---

## 10. Quick-Start Commands

```bash
# Initialize
npx create-expo-app my14er-mobile --template blank-typescript
cd my14er-mobile
npx expo install expo-router expo-font expo-image expo-location \
  expo-notifications expo-haptics expo-camera expo-image-picker \
  expo-secure-store react-native-maps react-native-reanimated \
  react-native-gesture-handler react-native-mmkv \
  @supabase/supabase-js @shopify/flash-list nativewind \
  react-native-svg zustand

# Copy and adapt lib/ from web app
cp ../my14er/lib/database.types.ts ./lib/
cp ../my14er/lib/peaks.ts ./lib/
# Adapt each file: remove next/cache imports, use mobile supabase client

# Dev
npx expo start
```
