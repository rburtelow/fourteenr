// supabase/functions/refresh-coverage/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENCELLID_API_KEY = Deno.env.get('OPENCELLID_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CARRIERS = [
  { code: 'ATT', name: 'AT&T',     mcc: 310, mnc: 410 },
  { code: 'TMO', name: 'T-Mobile', mcc: 310, mnc: 260 },
  { code: 'VZW', name: 'Verizon',  mcc: 311, mnc: 480 },
]

const SEARCH_RADIUS_M = 20000
const OPENCELLID_BASE = 'https://opencellid.org/cell/getInArea'

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!OPENCELLID_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OPENCELLID_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 1. Load all peaks with coordinates
  const { data: peaks, error: peaksError } = await supabase
    .from('peaks')
    .select('id, name, latitude, longitude')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  if (peaksError || !peaks?.length) {
    return new Response(
      JSON.stringify({ error: 'Failed to load peaks', detail: peaksError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const rows: Array<{
    peak_id: string
    carrier: string
    signal_dbm: number | null
    coverage_tier: string
    nearest_tower_km: number | null
    tower_count: number
    tower_samples: number | null
    fetched_at: string
  }> = []

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
            // Prefer LTE/NR; find the closest one to the peak
            const preferred = cells.filter(c => c.radio === 'LTE' || c.radio === 'NR')
            const pool = preferred.length > 0 ? preferred : cells

            let closest = pool[0]
            let minDist = distanceMeters(peak.latitude!, peak.longitude!, closest.lat, closest.lon)

            for (const cell of pool.slice(1)) {
              const d = distanceMeters(peak.latitude!, peak.longitude!, cell.lat, cell.lon)
              if (d < minDist) { minDist = d; closest = cell }
            }

            signalDbm = closest.averageSignalStrength ?? null
            nearestTowerKm = Math.round((minDist / 1000) * 10) / 10
            towerSamples = closest.samples ?? null
          }
        }
      } catch (_) {
        // network error — leave nulls, coverage_tier = 'None'
      }

      rows.push({
        peak_id:          peak.id,
        carrier:          carrier.code,
        signal_dbm:       signalDbm,
        coverage_tier:    towerCount === 0 ? 'None' : dbmToTier(signalDbm),
        nearest_tower_km: nearestTowerKm,
        tower_count:      towerCount,
        tower_samples:    towerSamples,
        fetched_at:       new Date().toISOString(),
      })
    }
  }

  // 3. Upsert — conflict on (peak_id, carrier) replaces existing row
  const { error: upsertError } = await supabase
    .from('peak_coverage')
    .upsert(rows, { onConflict: 'peak_id,carrier' })

  if (upsertError) {
    return new Response(
      JSON.stringify({ error: 'Upsert failed', detail: upsertError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // 4. Stamp last refresh time
  await supabase
    .from('coverage_metadata')
    .upsert({ key: 'last_refreshed_at', value: new Date().toISOString() })

  return new Response(
    JSON.stringify({ success: true, peaks: peaks.length, rows: rows.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
