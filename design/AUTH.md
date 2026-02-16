# Authentication System

## Overview

The application uses Supabase Auth with JWT tokens for session management. Authentication supports both native email/password sign-up and Google OAuth as a social login provider. Sessions are managed via cookies with automatic refresh in middleware.

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260212000000_create_profiles.sql` | Creates the `profiles` table linked to `auth.users` with `screen_name` (unique), `full_name`, `avatar_url`, `bio`, `location`. Includes RLS policies, auto-profile creation trigger on signup, and auto-`updated_at` trigger. |
| `lib/supabase/client.ts` | Browser-side Supabase client using `@supabase/ssr` |
| `lib/supabase/server.ts` | Server-side Supabase client with cookie handling |
| `lib/supabase/middleware.ts` | Middleware helper that refreshes sessions, protects routes, redirects users without a screen name to setup, and redirects logged-in users away from auth pages |
| `middleware.ts` | Next.js middleware wiring up the Supabase session handler |
| `app/auth/actions.ts` | Server actions: `login`, `signup`, `signInWithGoogle`, `signOut`, `setupScreenName` |
| `app/auth/login/page.tsx` | Login page with Google OAuth + email/password |
| `app/auth/signup/page.tsx` | Signup page with Google OAuth + email/password |
| `app/auth/callback/route.ts` | OAuth callback handler that exchanges code for session |
| `app/auth/setup-profile/page.tsx` | Screen name selection page (shown after first login) |
| `app/components/UserNav.tsx` | Shared client component showing Sign In/Get Started for guests, or avatar + Sign Out for authenticated users |

### Modified Files

| File | Changes |
|------|---------|
| `supabase/config.toml` | Added Google OAuth provider config + callback URLs |
| `lib/peaks.ts` | Updated to use new async server client pattern |
| `lib/database.types.ts` | Added `profiles` table types + `Profile` type |
| `.env.local` | Added placeholder `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` |
| `app/page.tsx` | Fetches auth state, uses `UserNav`, buttons link to auth pages |
| `app/peaks/page.tsx` | Passes auth state to `PeaksClient` |
| `app/peaks/PeaksClient.tsx` | Accepts `userNav` prop, uses `UserNav` component |
| `app/peaks/[slug]/page.tsx` | Fetches auth state, uses `UserNav` |
| `app/community/page.tsx` | Fetches auth state, uses `UserNav` |
| `app/profile/page.tsx` | Fetches auth state, uses `UserNav` |

### Deleted Files

| File | Reason |
|------|--------|
| `lib/supabase.ts` | Old singleton client replaced by new SSR-aware clients |

---

## Database Schema

### `profiles` Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | Primary key, references `auth.users(id)` on delete cascade |
| `email` | `text` | Not null |
| `screen_name` | `text` | Unique |
| `full_name` | `text` | Nullable |
| `avatar_url` | `text` | Nullable |
| `location` | `text` | Nullable |
| `bio` | `text` | Nullable |
| `created_at` | `timestamptz` | Default `now()`, not null |
| `updated_at` | `timestamptz` | Default `now()`, not null, auto-updated via trigger |

### Row Level Security Policies

- **Select**: Profiles are viewable by everyone
- **Insert**: Users can only insert their own profile (`auth.uid() = id`)
- **Update**: Users can only update their own profile (`auth.uid() = id`)

### Triggers

- **`on_auth_user_created`**: Auto-creates a profile row when a new user signs up (pulls `full_name` and `avatar_url` from user metadata for OAuth users)
- **`on_profile_updated`**: Auto-updates the `updated_at` timestamp on profile changes

---

## Auth Flow

1. **Public pages** (`/`, `/peaks`, `/peaks/[slug]`) — No auth required. Navigation shows "Sign In" and "Get Started" buttons.
2. **Protected pages** (`/profile`, `/community`) — Middleware redirects unauthenticated users to `/auth/login` with a `redirectTo` parameter.
3. **Sign up** — Email/password or Google OAuth. Auto-creates a profile row via database trigger. Redirects to screen name setup.
4. **Screen name setup** (`/auth/setup-profile`) — Required before accessing the app. Middleware enforces this for authenticated users without a `screen_name`.
5. **Sign in** — Email/password or Google OAuth. If user already has a screen name, proceeds normally. If not, redirects to setup.
6. **OAuth callback** (`/auth/callback`) — Exchanges the authorization code for a session, checks for screen name, then redirects appropriately.
7. **Sign out** — Clears the session and redirects to home.

### Session Management

- JWT tokens stored in HTTP-only cookies via `@supabase/ssr`
- Middleware refreshes tokens on every request to keep sessions alive
- Token expiry: 1 hour (configurable in `supabase/config.toml`)
- Refresh token rotation enabled with 10-second reuse interval

---

## Route Protection

| Route | Auth Required | Behavior |
|-------|--------------|----------|
| `/` | No | Public landing page |
| `/peaks` | No | Public peaks listing |
| `/peaks/[slug]` | No | Public peak detail |
| `/profile` | Yes | Redirects to `/auth/login` if unauthenticated |
| `/community` | Yes | Redirects to `/auth/login` if unauthenticated |
| `/auth/login` | No | Redirects to `/` if already authenticated |
| `/auth/signup` | No | Redirects to `/` if already authenticated |
| `/auth/setup-profile` | Yes | Only accessible to users without a screen name |

---

## Google OAuth Setup

To enable Google sign-in for local development:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application type)
3. Add `http://127.0.0.1:54321/auth/v1/callback` as an authorized redirect URI
4. Create `supabase/.env` with:
   ```
   GOOGLE_OAUTH_CLIENT_ID=your-client-id
   GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
   ```
5. Restart Supabase: `supabase stop && supabase start`

> **Note**: Email/password authentication works immediately with no additional setup. Local Supabase uses Inbucket at `http://127.0.0.1:54324` for email testing (confirmation emails, password resets, etc.).

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.95.3 | Supabase JavaScript client |
| `@supabase/ssr` | 0.8.0 | SSR-compatible Supabase client for Next.js (cookie-based auth) |
