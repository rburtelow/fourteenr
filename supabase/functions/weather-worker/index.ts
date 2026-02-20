import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processPeak } from "./pipeline/processPeak.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log(`Processing ${peaks.length} peaks...`);

    // Process all peaks in parallel
    const results = await Promise.allSettled(
      peaks.map(async (peak: {
        id: string;
        latitude: number | null;
        longitude: number | null;
        elevation: number;
        forecast_elevation_ft: number | null;
      }) => {
        try {
          const result = await processPeak(peak, openWeatherKey);

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
          return { peakId: peak.id, status: "success" as const };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`✗ ${peak.id}: ${msg}`);
          return { peakId: peak.id, status: "error" as const, error: msg };
        }
      })
    );

    const processed = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success"
    ).length;
    const errors = results
      .filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && r.value.status === "error")
      )
      .map((r) =>
        r.status === "rejected"
          ? { error: String(r.reason) }
          : r.status === "fulfilled"
            ? r.value
            : null
      );

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
