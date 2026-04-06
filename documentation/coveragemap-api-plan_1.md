# Cell Coverage Integration Plan: OpenCelliD API

## Overview

Integrate the OpenCelliD API to fetch and store cellular tower proximity and signal data for all 58 Colorado 14,000 ft peaks. The fetch logic will be implemented as a **Supabase Edge Function** (Deno/TypeScript), invoked manually or on a scheduled cron trigger. For each peak and carrier, the function queries nearby cell towers, picks the closest tower's crowd-sourced average signal reading, and writes coverage tiers persistently for the app to query.

**Why OpenCelliD**: Free (5,000 req/day), no paid account required, per-carrier data, and the `averageSignalStrength` field reflects real-world crowd-sourced measurements — which tend to be more accurate than modeled predictions for remote mountain terrain.

---

## Data Source

- **Provider**: OpenCelliD (opencellid.org) — powered by crowd-sourced GPS + signal measurements
- **Endpoint**: `https://opencellid.org/cell/getInArea`
- **Carriers**: AT&T, T-Mobile, Verizon (US MCC=310)
- **Technologies**: LTE (4G), NR (5G), UMTS (3G) — filtered to LTE/NR
- **Data origin**: Crowd-sourced signal readings submitted by mobile devices worldwide
- **Docs**: https://wiki.opencellid.org/wiki/API
- **Registration**: https://my.opencellid.org/register (free, API key via dashboard)

### US Carrier MNC Codes

| Carrier   | MCC | MNC |
|-----------|-----|-----|
| AT&T      | 310 | 410 |
| T-Mobile  | 310 | 260 |
| Verizon   | 311 | 480 |

---

## API Request & Response

Query towers for a single carrier within a radius of a coordinate:

```
GET https://opencellid.org/cell/getInArea
  ?key=YOUR_API_KEY
  &center_lat=39.3498
  &center_lon=-106.3243
  &radius=20000
  &unit=meter
  &mcc=310
  &mnc=410
  &format=json
```

Response:

```json
{
  "count": 3,
  "cells": [
    {
      "radio": "LTE",
      "mcc": 310,
      "mnc": 410,
      "lac": 21001,
      "cid": 112233,
      "lat": 39.341,
      "lon": -106.318,
      "range": 5200,
      "averageSignalStrength": -108,
      "samples": 14,
      "created": 1680000000,
      "updated": 1700000000
    }
  ]
}
```

- `averageSignalStrength` — average dBm from crowd-sourced measurements near that tower
- `range` — estimated coverage radius of the tower in meters
- `samples` — number of crowd-sourced readings; prefer towers with more samples
- `lat`/`lon` — tower location (not the queried coordinate)

For each peak + carrier, pick the **closest tower** to the peak coordinate. If no towers exist within the search radius, the carrier has no coverage at that peak.

---

## Signal Strength → Coverage Tier Mapping

Use the closest tower's `averageSignalStrength` (dBm) to assign a tier:

| dBm Value         | Coverage Tier |
|-------------------|---------------|
| No towers found   | None          |
| < -115            | None          |
| -115 to -105      | Poor          |
| -105 to -95       | Fair          |
| -95 to -85        | Good          |
| > -85             | Great         |

Apply this mapping **per carrier**. Store the raw dBm value, the computed tier, the distance to the nearest tower, and the number of samples backing that reading.

> **Note**: Mountain summits will realistically return "None" or "Poor" for most carriers. That is expected and useful data for hikers.

---

## API Call Volume

58 peaks × 3 carriers = **174 requests per refresh run** — well under the 5,000/day free limit.

---

## Implementation Steps

### Step 1: Account Setup

1. Register at https://my.opencellid.org/register (free, no credit card)
2. Obtain your API key from the dashboard
3. Store the key as a Supabase secret:

```bash
supabase secrets set OPENCELLID_API_KEY=your_key_here
```

The secret is accessible inside the function as `Deno.env.get('OPENCELLID_API_KEY')`.

---

### Step 2: Peak Data

The Edge Function queries the existing `peaks` table at runtime. The table must have at minimum:

```sql
-- Expected columns on the peaks table
id            INTEGER PRIMARY KEY
name          TEXT
latitude      NUMERIC
longitude     NUMERIC
elevation_ft  INTEGER
```

If the `peaks` table doesn't exist yet, seed it from a trusted source such as:
- 14ers.com
- USGS Geographic Names Information System (GNIS)
- Wikipedia List of Colorado fourteeners

---

### Step 3: Supabase Edge Function

Create the function scaffold:

```bash
supabase functions new refresh-coverage
```

This creates `supabase/functions/refresh-coverage/index.ts`. Implement it as follows:

```typescript
// supabase/functions/refresh-coverage/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENCELLID_API_KEY = Deno.env.get('OPENCELLID_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CARRIERS = [
  { code: 'ATT',      name: 'AT&T',     mcc: 310, mnc: 410 },
  { code: 'TMO',      name: 'T-Mobile', mcc: 310, mnc: 260 },
  { code: 'VZW',      name: 'Verizon',  mcc: 311, mnc: 480 },
]

const SEARCH_RADIUS_M = 20000  // 20 km
const OPENCELLID_BASE = 'https://opencellid.org/cell/getInArea'

// Haversine distance in meters between two lat/lon points
function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function dbmToTier(dbm: number | null): string {
  if (dbm === null || dbm === undefined) return 'None'
  if (dbm < -115) return 'None'
  if (dbm < -105) return 'Poor'
  if (dbm < -95)  return 'Fair'
  if (dbm < -85)  return 'Good'
  return 'Great'
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 1. Load all peaks
  const { data: peaks, error: peaksError } = await supabase
    .from('peaks')
    .select('id, name, latitude, longitude')

  if (peaksError || !peaks?.length) {
    return new Response(JSON.stringify({ error: 'Failed to load peaks', detail: peaksError }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rows = []

  // 2. For each peak × carrier, query OpenCelliD for nearby towers
  for (const peak of peaks) {
    for (const carrier of CARRIERS) {
      const url = new URL(OPENCELLID_BASE)
      url.searchParams.set('key', OPENCELLID_API_KEY)
      url.searchParams.set('center_lat', String(peak.latitude))
      url.searchParams.set('center_lon', String(peak.longitude))
      url.searchParams.set('radius', String(SEARCH_RADIUS_M))
      url.searchParams.set('unit', 'meter')
      url.searchParams.set('mcc', String(carrier.mcc))
      url.searchParams.set('mnc', String(carrier.mnc))
      url.searchParams.set('format', 'json')

      let signalDbm: number | null = null
      let nearestTowerKm: number | null = null
      let towerSamples: number | null = null
      let towerCount = 0

      try {
        const res = await fetch(url.toString())
        if (res.ok) {
          const data = await res.json()
          const cells: Array<{
            lat: number; lon: number
            averageSignalStrength: number
            samples: number
            radio: string
          }> = data.cells ?? []

          towerCount = cells.length

          if (cells.length > 0) {
            // Prefer LTE/NR towers; find the closest one to the peak
            const preferred = cells.filter(c => c.radio === 'LTE' || c.radio === 'NR')
            const pool = preferred.length > 0 ? preferred : cells

            let closest = pool[0]
            let minDist = distanceMeters(peak.latitude, peak.longitude, closest.lat, closest.lon)

            for (const cell of pool.slice(1)) {
              const d = distanceMeters(peak.latitude, peak.longitude, cell.lat, cell.lon)
              if (d < minDist) { minDist = d; closest = cell }
            }

            signalDbm = closest.averageSignalStrength ?? null
            nearestTowerKm = Math.round((minDist / 1000) * 10) / 10
            towerSamples = closest.samples ?? null
          }
        }
      } catch (_) {
        // network error for this carrier/peak — leave nulls, coverage_tier = 'None'
      }

      rows.push({
        peak_id:           peak.id,
        carrier:           carrier.code,
        signal_dbm:        signalDbm,
        coverage_tier:     towerCount === 0 ? 'None' : dbmToTier(signalDbm),
        nearest_tower_km:  nearestTowerKm,
        tower_count:       towerCount,
        tower_samples:     towerSamples,
        fetched_at:        new Date().toISOString(),
      })
    }
  }

  // 3. Upsert — conflict on (peak_id, carrier) replaces existing row
  const { error: upsertError } = await supabase
    .from('peak_coverage')
    .upsert(rows, { onConflict: 'peak_id,carrier' })

  if (upsertError) {
    return new Response(JSON.stringify({ error: 'Upsert failed', detail: upsertError }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 4. Stamp the metadata table with last refresh time
  await supabase
    .from('coverage_metadata')
    .upsert({ key: 'last_refreshed_at', value: new Date().toISOString() })

  return new Response(
    JSON.stringify({ success: true, peaks: peaks.length, rows: rows.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

**Deploy the function:**

```bash
supabase functions deploy refresh-coverage
```

**Invoke manually (curl):**

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/refresh-coverage \
  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"
```

> **Rate limiting**: 174 sequential requests at ~200ms each takes ~35 seconds — well within Edge Function timeout limits. If needed, add a small `await new Promise(r => setTimeout(r, 100))` delay between calls.

---

### Step 4: Database Schema

The schema is simpler than the CoverageMap variant since OpenCelliD doesn't return per-radius signal values. One row per peak + carrier combination.

```sql
CREATE TABLE peak_coverage (
  id                SERIAL PRIMARY KEY,
  peak_id           INTEGER NOT NULL REFERENCES peaks(id),
  carrier           TEXT NOT NULL,        -- 'ATT' | 'TMO' | 'VZW'
  signal_dbm        NUMERIC,              -- averageSignalStrength of nearest tower (dBm)
  coverage_tier     TEXT NOT NULL,        -- 'None' | 'Poor' | 'Fair' | 'Good' | 'Great'
  nearest_tower_km  NUMERIC,              -- distance to the closest tower in km
  tower_count       INTEGER,              -- number of towers found within search radius
  tower_samples     INTEGER,              -- crowd-sourced readings backing the signal value
  fetched_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (peak_id, carrier)
);

CREATE INDEX ON peak_coverage (peak_id);

-- Tracks when coverage data was last refreshed
CREATE TABLE coverage_metadata (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);
```

---

### Step 5: Application Display Logic

Query coverage for a given peak:

```sql
SELECT carrier, signal_dbm, coverage_tier, nearest_tower_km, tower_samples
FROM peak_coverage
WHERE peak_id = $1
ORDER BY carrier;
```

Suggested UI representation:

| Carrier   | Signal    | Coverage | Nearest Tower | Confidence |
|-----------|-----------|----------|---------------|------------|
| AT&T      | -108 dBm  | Poor     | 8.3 km        | 14 samples |
| T-Mobile  | -95 dBm   | Fair     | 5.1 km        | 31 samples |
| Verizon   | —         | None     | —             | —          |

**Best carrier summary**: find the row with the highest (least negative) `signal_dbm` — use as the headline recommendation on peak detail pages.

**Confidence note**: Surface `tower_samples` in the UI or tooltip so hikers know how many real-world readings back the value. A tier supported by 2 samples is less reliable than one with 50.

---

### Step 6: Refresh Cadence

Cell tower data changes slowly. Quarterly refresh is sufficient and keeps API usage minimal.

Use Supabase's `pg_cron` scheduler (Pro plan) to trigger the Edge Function automatically:

```sql
-- Runs on the 1st of Jan, Apr, Jul, Oct at 02:00 UTC
SELECT cron.schedule(
  'refresh-coverage-quarterly',
  '0 2 1 1,4,7,10 *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/refresh-coverage',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

> Store the service role key as a Postgres setting (`app.service_role_key`) or use a Supabase Vault secret.

**Manual trigger** at any time:

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/refresh-coverage \
  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"
```

---

## Summary Checklist

- [ ] Register at https://my.opencellid.org/register and obtain API key
- [ ] Store API key as Supabase secret: `supabase secrets set OPENCELLID_API_KEY=...`
- [ ] Verify/seed `peaks` table with lat/lon for all 58 Colorado 14ers
- [ ] Run schema migrations: `peak_coverage` and `coverage_metadata` tables
- [ ] Scaffold and implement `refresh-coverage` Edge Function
- [ ] Deploy function: `supabase functions deploy refresh-coverage`
- [ ] Test manually with curl against a small subset of peaks
- [ ] Deploy full run against all 58 peaks and verify upsert (174 rows expected)
- [ ] Implement "best carrier" summary query in the app
- [ ] Surface `tower_samples` as a confidence indicator in the UI
- [ ] Set up `pg_cron` quarterly schedule (requires Supabase Pro)
