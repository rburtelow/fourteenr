"use server";

import { createClient } from "@/lib/supabase/server";
import type { TripReportSections } from "@/lib/database.types";

export async function createTripReport(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a trip report." };
  }

  const peakId = formData.get("peakId") as string;
  const routeId = (formData.get("routeId") as string) || null;
  const hikeDate = formData.get("hikeDate") as string;
  const startTime = (formData.get("startTime") as string) || null;
  const endTime = (formData.get("endTime") as string) || null;
  const totalTimeMinutes = formData.get("totalTimeMinutes")
    ? parseInt(formData.get("totalTimeMinutes") as string, 10)
    : null;
  const difficultyRating = parseInt(formData.get("difficultyRating") as string, 10);
  const conditionSeverityScore = parseInt(formData.get("conditionSeverityScore") as string, 10);
  const objectiveRiskScore = parseInt(formData.get("objectiveRiskScore") as string, 10);
  const trailheadAccessRating = (formData.get("trailheadAccessRating") as string) || null;
  const snowPresent = formData.get("snowPresent") === "true";
  const overallRecommendation = formData.get("overallRecommendation") === "true";
  const summary = formData.get("summary") as string;
  const narrative = (formData.get("narrative") as string) || null;

  const sectionsRaw = formData.get("sectionsJson") as string;
  let sectionsJson: TripReportSections | null = null;
  if (sectionsRaw) {
    try {
      sectionsJson = JSON.parse(sectionsRaw);
    } catch {
      return { error: "Invalid sections data." };
    }
  }

  if (!peakId || !hikeDate || !summary) {
    return { error: "Peak, hike date, and summary are required." };
  }

  if (
    difficultyRating < 1 || difficultyRating > 5 ||
    conditionSeverityScore < 1 || conditionSeverityScore > 5 ||
    objectiveRiskScore < 1 || objectiveRiskScore > 5
  ) {
    return { error: "Ratings must be between 1 and 5." };
  }

  const { data: reportData, error } = await supabase.from("trip_reports").insert({
    user_id: user.id,
    peak_id: peakId,
    route_id: routeId,
    hike_date: hikeDate,
    start_time: startTime,
    end_time: endTime,
    total_time_minutes: totalTimeMinutes,
    difficulty_rating: difficultyRating,
    condition_severity_score: conditionSeverityScore,
    objective_risk_score: objectiveRiskScore,
    trailhead_access_rating: trailheadAccessRating,
    snow_present: snowPresent,
    overall_recommendation: overallRecommendation,
    summary,
    narrative,
    sections_json: sectionsJson as unknown as Record<string, unknown>,
  }).select("id").single();

  if (error) {
    return { error: error.message };
  }

  // Also create a summit_log entry so the peak appears as completed
  // and profile stats (summits, elevation, miles, progress) update.
  const weatherNotes = sectionsJson?.weather?.enabled
    ? [
        sectionsJson.weather.data?.summit_temp_f != null && `${sectionsJson.weather.data.summit_temp_f}°F`,
        sectionsJson.weather.data?.wind_mph != null && `${sectionsJson.weather.data.wind_mph} mph wind`,
        sectionsJson.weather.notes,
      ].filter(Boolean).join(", ") || null
    : null;

  const { error: summitError } = await supabase.from("summit_logs").insert({
    user_id: user.id,
    peak_id: peakId,
    route_id: routeId,
    summit_date: hikeDate,
    rating: difficultyRating,
    weather: weatherNotes,
    notes: summary,
  });

  if (summitError) {
    console.error("Failed to create summit log:", summitError.message);
  }

  // Auto-create community feed post for summit
  const { data: peakData } = await supabase
    .from("peaks")
    .select("name, elevation")
    .eq("id", peakId)
    .single();

  const peakName = peakData?.name ?? "a 14er";
  const elevation = peakData?.elevation ?? 14000;

  let routeName: string | null = null;
  if (routeId) {
    const { data: routeData } = await supabase
      .from("routes")
      .select("name")
      .eq("id", routeId)
      .single();
    routeName = routeData?.name ?? null;
  }

  const routeSnippet = routeName ? ` via ${routeName}` : "";
  const postContent = `Summited ${peakName} (${elevation.toLocaleString()}')${routeSnippet}!`;

  const { error: postError } = await supabase.from("community_posts").insert({
    user_id: user.id,
    content: postContent,
    peak_id: peakId,
    is_condition_report: false,
    activity_type: "summit_log",
    activity_metadata: {
      summit_date: hikeDate,
      route_name: routeName,
      trip_report_id: reportData?.id ?? null,
    },
  });

  if (postError) {
    console.error("Failed to create summit activity post:", postError.message);
  }

  return { success: true };
}
