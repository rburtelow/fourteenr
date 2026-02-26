import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOP_N = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const prevWeekStart = new Date(now);
    prevWeekStart.setDate(prevWeekStart.getDate() - 14);

    const thisWeekStartStr = thisWeekStart.toISOString().slice(0, 10);
    const prevWeekStartStr = prevWeekStart.toISOString().slice(0, 10);
    const nowStr = now.toISOString().slice(0, 10);

    // Query both summit_logs and trip_reports for this week and last week.
    // Summit logs are the primary signal (every logged summit); trip reports
    // are optional detailed write-ups — we count each as one activity unit.
    const [
      { data: summitsThisWeek, error: e1 },
      { data: summitsPrevWeek, error: e2 },
      { data: reportsThisWeek, error: e3 },
      { data: reportsPrevWeek, error: e4 },
    ] = await Promise.all([
      supabase
        .from("summit_logs")
        .select("peak_id")
        .gte("summit_date", thisWeekStartStr)
        .lte("summit_date", nowStr),
      supabase
        .from("summit_logs")
        .select("peak_id")
        .gte("summit_date", prevWeekStartStr)
        .lt("summit_date", thisWeekStartStr),
      supabase
        .from("trip_reports")
        .select("peak_id")
        .gte("hike_date", thisWeekStartStr)
        .lte("hike_date", nowStr),
      supabase
        .from("trip_reports")
        .select("peak_id")
        .gte("hike_date", prevWeekStartStr)
        .lt("hike_date", thisWeekStartStr),
    ]);

    if (e1) throw new Error(`Failed to query summit_logs (this week): ${e1.message}`);
    if (e2) throw new Error(`Failed to query summit_logs (prev week): ${e2.message}`);
    if (e3) throw new Error(`Failed to query trip_reports (this week): ${e3.message}`);
    if (e4) throw new Error(`Failed to query trip_reports (prev week): ${e4.message}`);

    // Combine counts from both sources
    const addCounts = (map: Map<string, number>, rows: { peak_id: string }[]) => {
      for (const row of rows) {
        map.set(row.peak_id, (map.get(row.peak_id) ?? 0) + 1);
      }
    };

    const thisWeekCounts = new Map<string, number>();
    addCounts(thisWeekCounts, summitsThisWeek ?? []);
    addCounts(thisWeekCounts, reportsThisWeek ?? []);

    const prevWeekCounts = new Map<string, number>();
    addCounts(prevWeekCounts, summitsPrevWeek ?? []);
    addCounts(prevWeekCounts, reportsPrevWeek ?? []);

    // Rank peaks by this-week count (descending), take top N
    const ranked = [...thisWeekCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N);

    if (ranked.length === 0) {
      console.log("No summit activity found for this week; skipping cache update.");
      return new Response(
        JSON.stringify({ message: "No data to cache", thisWeekCount: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build cache rows
    const calculatedAt = now.toISOString();
    const cacheRows = ranked.map(([peakId, count], idx) => {
      const prev = prevWeekCounts.get(peakId) ?? 0;
      const trendPct = prev === 0 ? 100 : Math.round(((count - prev) / prev) * 100);
      return {
        peak_id: peakId,
        rank: idx + 1,
        report_count: count,
        prev_report_count: prev,
        trend_pct: trendPct,
        calculated_at: calculatedAt,
      };
    });

    // Replace cache atomically: delete all rows then insert fresh ones
    const { error: deleteError } = await supabase
      .from("trending_peaks_cache")
      .delete()
      .gte("id", 0); // delete all rows

    if (deleteError) {
      throw new Error(`Failed to clear cache: ${deleteError.message}`);
    }

    const { error: insertError } = await supabase
      .from("trending_peaks_cache")
      .insert(cacheRows);

    if (insertError) {
      throw new Error(`Failed to insert cache rows: ${insertError.message}`);
    }

    console.log(`Trend worker done: cached ${cacheRows.length} peaks.`);

    return new Response(
      JSON.stringify({ cached: cacheRows.length, calculatedAt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Trend worker error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
