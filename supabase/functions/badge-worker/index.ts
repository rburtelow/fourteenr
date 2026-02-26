import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { evaluateBadge } from "./evaluators.ts";
import type { BadgeDefinition, Peak, SummitLog, Route, UserData } from "./types.ts";

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load all badge definitions
    const { data: badges, error: badgesError } = await supabase
      .from("badge_definitions")
      .select("*")
      .eq("is_active", true);

    if (badgesError || !badges) {
      return new Response(
        JSON.stringify({ error: "Failed to load badge definitions", details: badgesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load all peaks for reference data
    const { data: peaks, error: peaksError } = await supabase
      .from("peaks")
      .select("id, slug, name, range, difficulty");

    if (peaksError || !peaks) {
      return new Response(
        JSON.stringify({ error: "Failed to load peaks", details: peaksError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build lookup maps for peaks
    const peakMap = new Map<string, Peak>(peaks.map((p: Peak) => [p.id, p]));

    // Build peaks by range map
    const peaksByRange = new Map<string, string[]>();
    for (const peak of peaks) {
      if (peak.range) {
        const existing = peaksByRange.get(peak.range) || [];
        existing.push(peak.id);
        peaksByRange.set(peak.range, existing);
      }
    }

    // Build peaks by difficulty map
    const peaksByDifficulty = new Map<string, string[]>();
    for (const peak of peaks) {
      if (peak.difficulty) {
        const existing = peaksByDifficulty.get(peak.difficulty) || [];
        existing.push(peak.id);
        peaksByDifficulty.set(peak.difficulty, existing);
      }
    }

    // Get all unique users with summit logs
    const { data: userIds, error: usersError } = await supabase
      .from("summit_logs")
      .select("user_id")
      .limit(10000);

    if (usersError) {
      return new Response(
        JSON.stringify({ error: "Failed to load users", details: usersError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uniqueUserIds = [...new Set((userIds || []).map((r: { user_id: string }) => r.user_id))];
    console.log(`Processing ${uniqueUserIds.length} users with summit logs...`);

    // Load all existing user badges to avoid duplicates
    const { data: existingBadges, error: existingError } = await supabase
      .from("user_badges")
      .select("user_id, badge_id");

    if (existingError) {
      return new Response(
        JSON.stringify({ error: "Failed to load existing badges", details: existingError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingBadgeSet = new Set(
      (existingBadges || []).map((b: { user_id: string; badge_id: string }) => `${b.user_id}:${b.badge_id}`)
    );

    // Load all routes for elevation/distance calculations
    const { data: routes, error: routesError } = await supabase
      .from("routes")
      .select("id, distance, elevation_gain");

    if (routesError) {
      return new Response(
        JSON.stringify({ error: "Failed to load routes", details: routesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const routeMap = new Map<string, Route>(
      (routes || []).map((r: Route) => [r.id, r])
    );

    // Process each user
    const newBadges: { user_id: string; badge_id: string; trigger_peak_id: string | null }[] = [];
    let processedUsers = 0;
    let errorCount = 0;

    for (const userId of uniqueUserIds) {
      try {
        // Get user's summit logs
        const { data: summitLogs, error: logsError } = await supabase
          .from("summit_logs")
          .select("id, user_id, peak_id, route_id, summit_date, weather")
          .eq("user_id", userId);

        if (logsError || !summitLogs) {
          console.error(`Failed to load logs for user ${userId}:`, logsError);
          errorCount++;
          continue;
        }

        // Build user data object
        const summitedPeakIds = new Set(summitLogs.map((l: SummitLog) => l.peak_id));
        const summitedPeakSlugs = new Set<string>();
        for (const peakId of summitedPeakIds) {
          const peak = peakMap.get(peakId);
          if (peak) {
            summitedPeakSlugs.add(peak.slug);
          }
        }

        // Calculate total elevation and miles
        let totalElevation = 0;
        let totalMiles = 0;
        for (const log of summitLogs) {
          if (log.route_id) {
            const route = routeMap.get(log.route_id);
            if (route) {
              totalElevation += route.elevation_gain || 0;
              totalMiles += route.distance || 0;
            }
          }
        }

        const userData: UserData = {
          userId,
          summitLogs,
          summitedPeakIds,
          summitedPeakSlugs,
          totalElevation,
          totalMiles,
        };

        // Evaluate each badge
        for (const badge of badges as BadgeDefinition[]) {
          const badgeKey = `${userId}:${badge.id}`;

          // Skip if already earned
          if (existingBadgeSet.has(badgeKey)) {
            continue;
          }

          const result = evaluateBadge(badge, userData, peakMap, peaksByRange, peaksByDifficulty);

          if (result.earned) {
            newBadges.push({
              user_id: userId,
              badge_id: badge.id,
              trigger_peak_id: result.triggerPeakId || null,
            });
            existingBadgeSet.add(badgeKey); // Prevent duplicate inserts in this run
          }
        }

        processedUsers++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error processing user ${userId}: ${msg}`);
        errorCount++;
      }
    }

    // Batch insert new badges
    if (newBadges.length > 0) {
      const { error: insertError } = await supabase.from("user_badges").insert(newBadges);

      if (insertError) {
        console.error("Failed to insert badges:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to insert badges", details: insertError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Awarded ${newBadges.length} new badges`);

      // Create community feed posts for each new badge
      const badgeById = new Map(
        (badges as BadgeDefinition[]).map((b: BadgeDefinition) => [b.id, b])
      );

      const activityPosts = newBadges.map((nb) => {
        const badge = badgeById.get(nb.badge_id);
        const badgeName = badge?.name ?? "a badge";
        return {
          user_id: nb.user_id,
          content: `Earned the "${badgeName}" badge! ${badge?.description ?? ""}`.trim(),
          peak_id: nb.trigger_peak_id,
          is_condition_report: false,
          activity_type: "badge_earned",
          activity_metadata: {
            badge_id: nb.badge_id,
            badge_slug: badge?.slug ?? null,
            badge_name: badge?.name ?? null,
            badge_icon_name: badge?.icon_name ?? null,
            badge_description: badge?.description ?? null,
            badge_category: badge?.category ?? null,
          },
        };
      });

      const { error: postError } = await supabase
        .from("community_posts")
        .insert(activityPosts);

      if (postError) {
        console.error("Failed to create badge activity posts:", postError);
        // Non-fatal: badges were already awarded
      }
    }

    const summary = {
      processedUsers,
      totalUsers: uniqueUserIds.length,
      newBadgesAwarded: newBadges.length,
      errors: errorCount > 0 ? errorCount : undefined,
    };

    console.log(`Done: ${processedUsers}/${uniqueUserIds.length} users processed, ${newBadges.length} badges awarded`);

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
