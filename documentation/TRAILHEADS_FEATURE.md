# Trailheads Feature Plan

Trailheads are the starting points for every 14er route. Currently, trailhead names are stored as a plain `text` field on the `routes` table with no coordinates, elevation, access info, or shared identity. This feature promotes trailheads to first-class entities so hikers can look up driving directions, road conditions, parking, and see all routes that share a trailhead.

---

## Current State

- `routes.trailhead` is a `text` column containing a name like `"Mount Elbert Trailhead"` or `"Nellie Creek Trailhead (4WD)"`
- Multiple routes reference the same trailhead by name string (e.g., North Cottonwood Trailhead serves Harvard + Columbia)
- Trip reports already capture a `trailhead_access_rating` enum (`clear_2wd`, `rough_2wd`, `4wd_required`, `snow_blocked`)
- No coordinates, elevation, parking info, or road details exist anywhere

---

## Stories

### Story 1: Trailheads Table & Migration

**As a** developer
**I want** a dedicated `trailheads` table
**So that** trailhead data is normalized and reusable across routes

#### Acceptance Criteria

- Create migration `20260302000000_create_trailheads.sql`
- Table schema:

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | `uuid_generate_v4()` |
| slug | text UNIQUE NOT NULL | URL-safe identifier |
| name | text NOT NULL | Display name (e.g., "Mount Elbert Trailhead") |
| latitude | numeric(9,6) | |
| longitude | numeric(10,6) | |
| elevation_ft | integer | Trailhead elevation in feet |
| road_type | text | `paved`, `gravel`, `rough_2wd`, `4wd_required`, `4wd_high_clearance` |
| parking_type | text | `lot`, `pulloff`, `dispersed`, `none` |
| parking_capacity | text | `small` (<10), `medium` (10-30), `large` (30+) |
| restrooms | boolean DEFAULT false | |
| fee_required | boolean DEFAULT false | |
| winter_accessible | boolean DEFAULT true | Whether the road is typically open in winter |
| nearest_town | text | Closest town for reference |
| driving_notes | text | Directions/road condition notes |
| description | text | General description |
| created_at | timestamptz DEFAULT now() | |
| updated_at | timestamptz DEFAULT now() | |

- RLS: public read, service-role write (same pattern as `peaks`)
- Indexes on `slug`

#### Technical Notes

- Follow the exact migration pattern from `20260211224023_create_peaks_and_routes.sql`
- The `road_type` field is intentionally `text` (not an enum) for flexibility, matching the pattern used by `difficulty` on routes

---

### Story 2: Link Routes to Trailheads (FK + Migration)

**As a** developer
**I want** routes to reference trailheads via a foreign key
**So that** route-trailhead relationships are reliable and queryable

#### Acceptance Criteria

- Create migration `20260302010000_link_routes_to_trailheads.sql`
- Add `trailhead_id uuid REFERENCES trailheads(id) ON DELETE SET NULL` to `routes`
- Keep the existing `routes.trailhead` text column (don't drop it — it remains as a fallback/display name until all data is migrated)
- Add index on `routes.trailhead_id`

#### Technical Notes

- `ON DELETE SET NULL` so deleting a trailhead doesn't cascade-delete routes
- A future cleanup migration can drop `routes.trailhead` once all consumers use the FK

---

### Story 3: Seed Trailhead Data

**As a** developer
**I want** trailhead records seeded for all existing routes
**So that** the feature launches with complete data

#### Acceptance Criteria

- Create migration `20260302020000_seed_trailheads.sql`
- Deduplicate trailhead names from existing `routes.trailhead` values (~40-50 unique trailheads across all 58 peaks)
- Each trailhead gets: slug, name, lat/lon, elevation, road type, parking info, nearest town
- After inserting trailheads, update `routes.trailhead_id` to link existing routes to their trailhead records using name matching
- Use `ON CONFLICT (slug) DO UPDATE` for idempotency (same pattern as peak seeds)

#### Technical Notes

- Coordinate/elevation data can be sourced from known trailhead databases
- Many trailheads are shared across peaks (e.g., North Cottonwood serves Harvard + Columbia, Halfmoon serves Elbert + Massive)
- Road type should be inferred from existing route descriptions (e.g., "4WD" in trailhead name)

---

### Story 4: TypeScript Types & Data Fetching

**As a** developer
**I want** TypeScript types and lib functions for trailheads
**So that** UI components can consume trailhead data

#### Acceptance Criteria

- Run `pnpm supabase gen types` to regenerate `lib/database.types.ts` (or manually add the types)
- Add convenience type alias: `export type Trailhead = Database["public"]["Tables"]["trailheads"]["Row"]`
- Add `RouteWithTrailhead` type: `Route & { trailhead_detail: Trailhead | null }`
- Add `PeakWithRoutesAndTrailheads` type
- Create `lib/trailheads.ts` with functions:
  - `getTrailheadBySlug(slug: string): Promise<TrailheadWithRoutes | null>` — trailhead + its routes + the peaks those routes belong to
  - `getAllTrailheads(): Promise<Trailhead[]>` — ordered by name
  - `getTrailheadsByPeakSlug(peakSlug: string): Promise<Trailhead[]>` — all trailheads for a peak's routes
- Update `getPeakBySlug()` in `lib/peaks.ts` to join trailhead data when fetching routes (select `routes(*, trailheads(*))`)

#### Technical Notes

- Follow existing patterns in `lib/peaks.ts` and `lib/forecasts.ts`
- Use the server-side Supabase client (cookie-based)
- Supabase PostgREST supports nested selects: `routes(*, trailheads(*))`

---

### Story 5: Trailhead Detail Page

**As a** hiker
**I want** a dedicated trailhead page
**So that** I can see driving directions, parking info, and all routes from this trailhead

#### Acceptance Criteria

- Create `app/trailheads/[slug]/page.tsx` (server component)
- Page displays:
  - Trailhead name as hero heading (Playfair Display)
  - Elevation badge
  - Quick stats row: road type, parking, restrooms, fee, winter access
  - Driving notes section
  - Description
  - **Routes from this trailhead** — list of RouteCards linking to their peak pages
  - **Map placeholder** — a static card showing lat/lon with a "View on Google Maps" link (interactive map is a future enhancement)
  - Sidebar: nearby town, coordinates, related trailheads (other trailheads for the same peaks)
- Follows existing design patterns: `rounded-2xl` cards, `bg-white` surfaces, `animate-fade-up` entrance
- Responsive: single column on mobile, sidebar layout on desktop

#### Technical Notes

- Model after the peak detail page (`app/peaks/[slug]/page.tsx`) for layout patterns
- RouteCard can be extracted as a shared component from the peak detail page
- No auth required to view (public data)
- `revalidate = 3600` for ISR (same as peaks listing)

---

### Story 6: Trailheads Listing Page

**As a** hiker
**I want** to browse all trailheads
**So that** I can find starting points near me or plan by access type

#### Acceptance Criteria

- Create `app/trailheads/page.tsx` (server component) + `app/trailheads/TrailheadsClient.tsx` (client component)
- Grid view of trailhead cards showing: name, elevation, road type badge, route count, nearest peak names
- Filters:
  - Road type: Paved, Gravel, Rough 2WD, 4WD Required
  - Parking: Lot, Pulloff, Dispersed
  - Winter accessible: Yes/No
  - Fee required: Yes/No
- Sort by: Name, Elevation, Route Count
- Search by name or nearest town
- Follows existing patterns from `PeaksClient.tsx` (filter pills, grid/list toggle)

#### Technical Notes

- Fetch all trailheads + route counts in parallel (same pattern as `getAllPeaksWithRouteCounts`)
- Road type badges use the difficulty badge color convention:
  - Paved: `emerald` (easy)
  - Gravel: `sky` (moderate)
  - Rough 2WD: `amber` (harder)
  - 4WD Required: `rose` (hardest)

---

### Story 7: Enhance Peak Detail Page with Trailhead Info

**As a** hiker viewing a peak
**I want** to see trailhead details inline on the peak page
**So that** I can plan my drive without leaving the peak page

#### Acceptance Criteria

- Update the RouteCard component in `app/peaks/[slug]/page.tsx` to show trailhead details:
  - Trailhead name becomes a link to `/trailheads/[slug]`
  - Show road type badge next to trailhead name
  - Show elevation at trailhead
  - Show parking type icon
- Add a **"Trailheads"** section below the routes list:
  - One card per unique trailhead serving this peak
  - Each card shows: name (linked), elevation, road type, parking, driving notes preview (line-clamp-2)
  - "View Details" link to trailhead page

#### Technical Notes

- The data is already available via the updated `getPeakBySlug()` join from Story 4
- Deduplicate trailheads when a peak has multiple routes from the same trailhead

---

### Story 8: Add Trailheads to Navigation

**As a** hiker
**I want** to access trailheads from the main navigation
**So that** I can discover trailheads as a top-level feature

#### Acceptance Criteria

- Add "Trailheads" link to `Navbar.tsx` (between "Peaks" and "Community")
- Available to both logged-in and logged-out users
- Add trailheads to `GlobalSearch.tsx` results (search by trailhead name)

#### Technical Notes

- Navbar link order: Home, Peaks, Trailheads, Community, [Events, Groups — logged-in only]
- GlobalSearch currently only searches groups — extend it to also search trailheads

---

### Story 9: Trailhead Conditions from Trip Reports

**As a** hiker
**I want** to see recent trailhead access conditions reported by other hikers
**So that** I know what road and parking conditions to expect

#### Acceptance Criteria

- On the trailhead detail page, add a "Recent Conditions" section
- Query `trip_reports` that reference routes using this trailhead
- Display the most recent 5 reports' `trailhead_access_rating` as a timeline:
  - Date, reporter name, access rating badge, and any `trailhead_conditions` section text
- Show an aggregate "Current Access" indicator based on the most recent report's rating

#### Technical Notes

- Join path: `trailheads` → `routes.trailhead_id` → `trip_reports.route_id`
- The `trailhead_conditions` section is stored in `trip_reports.sections_json` under the key `trailhead_conditions`
- Access rating badges use the existing color convention from `app/reports/[id]/page.tsx`:
  - `clear_2wd`: emerald
  - `rough_2wd`: amber
  - `4wd_required`: orange
  - `snow_blocked`: rose

---

### Story 10: Trip Report Trailhead Selection Enhancement

**As a** hiker writing a trip report
**I want** the trailhead conditions to auto-populate based on my selected route
**So that** my report is accurately linked to the right trailhead

#### Acceptance Criteria

- In `TripReportModal.tsx`, when a route is selected:
  - Auto-display the trailhead name associated with that route
  - Pre-fill the trailhead conditions section header with the trailhead name
- The `trailhead_access_rating` from the trip report is associated with the trailhead via the route FK chain

#### Technical Notes

- No schema changes needed — the relationship is: `trip_report.route_id` → `route.trailhead_id` → `trailhead`
- This is a UX enhancement only

---

## Implementation Order

The stories are ordered by dependency. Recommended implementation sequence:

1. **Stories 1-3** (Schema + Seed) — Foundation, no UI changes
2. **Story 4** (Types + Fetching) — Data layer, no UI changes
3. **Story 5** (Detail Page) — First visible feature
4. **Story 7** (Peak Page Enhancement) — High-value integration
5. **Story 6** (Listing Page) — Browse experience
6. **Story 8** (Navigation) — Discoverability
7. **Stories 9-10** (Conditions) — Community data integration

---

## Future Enhancements (Not in Scope)

- Interactive map with trailhead markers (Mapbox/Leaflet integration)
- User-submitted trailhead photos
- Real-time road closure alerts (CDOT API integration)
- Trailhead crowding predictions based on historical trip report data
- Offline trailhead info with driving directions
