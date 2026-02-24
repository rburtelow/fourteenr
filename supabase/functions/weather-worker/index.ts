import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processPeak } from "./pipeline/processPeak.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OpenWeather free tier: 60 calls/minute. Each peak makes 2 calls, so process
// 10 peaks (20 calls) per batch with a 1-second pause between batches.
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000;

type PeakRow = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number;
  forecast_elevation_ft: number | null;
};

type PeakResult =
  | { peakId: string; status: "success" }
  | { peakId: string; status: "error"; error: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openWeatherKey = Deno.env.get("OPENWEATHERMAP_API_KEY");

    if (!openWeatherKey) {
      return new Response(
        JSON.stringify({ error: "OPENWEATHERMAP_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load all peaks
    const { data: peaks, error: peaksError } = await supabase
      .from("peaks")
      .select("id, latitude, longitude, elevation, forecast_elevation_ft");

    if (peaksError || !peaks) {
      return new Response(
        JSON.stringify({ error: "Failed to load peaks", details: peaksError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${peaks.length} peaks in batches of ${BATCH_SIZE}...`);

    async function processSinglePeak(peak: PeakRow): Promise<PeakResult> {
      try {
        const result = await processPeak(peak, openWeatherKey!);

        const { error: upsertError } = await supabase
          .from("peak_forecasts")
          .upsert(
            {
              peak_id: result.peakId,
              raw_forecast: result.rawForecast,
              adjusted_forecast: result.adjustedForecast,
              hourly_risk: result.hourlyRisk,
              summit_window: result.summitWindow,
              risk_score: result.riskScore,
              risk_level: result.riskLevel,
              condition_flags: result.conditionFlags,
              storm_eta: result.stormEta
                ? new Date(result.stormEta * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "peak_id" }
          );

        if (upsertError) {
          throw new Error(`Upsert failed: ${upsertError.message}`);
        }

        console.log(`✓ ${peak.id} processed`);
        return { peakId: peak.id, status: "success" };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`✗ ${peak.id}: ${msg}`);
        return { peakId: peak.id, status: "error", error: msg };
      }
    }

    // Process peaks in batches to stay within OpenWeather rate limits
    const allResults: PeakResult[] = [];
    for (let i = 0; i < peaks.length; i += BATCH_SIZE) {
      const batch = peaks.slice(i, i + BATCH_SIZE) as PeakRow[];
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(peaks.length / BATCH_SIZE);
      console.log(`Batch ${batchNum}/${totalBatches}: ${batch.length} peaks`);

      const batchResults = await Promise.all(batch.map(processSinglePeak));
      allResults.push(...batchResults);

      // Pause between batches (skip delay after the last batch)
      if (i + BATCH_SIZE < peaks.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const processed = allResults.filter((r) => r.status === "success").length;
    const errors = allResults.filter((r) => r.status === "error");

    const summary = {
      processed,
      total: peaks.length,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`Done: ${processed}/${peaks.length} succeeded`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Worker error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
