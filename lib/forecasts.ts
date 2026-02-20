import { createClient } from "./supabase/server";
import type { PeakForecast } from "./database.types";

export async function getForecastByPeakId(
  peakId: string
): Promise<PeakForecast | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("peak_forecasts")
    .select("*")
    .eq("peak_id", peakId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PeakForecast;
}

export async function getForecastByPeakSlug(
  slug: string
): Promise<PeakForecast | null> {
  const supabase = await createClient();

  // First get the peak ID from the slug
  const { data: peak } = await supabase
    .from("peaks")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!peak) {
    return null;
  }

  const { data, error } = await supabase
    .from("peak_forecasts")
    .select("*")
    .eq("peak_id", peak.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PeakForecast;
}

export interface ForecastSummary {
  peak_id: string;
  risk_score: number | null;
  risk_level: string | null;
  condition_flags: {
    windRisk: boolean;
    thunderstormRisk: boolean;
    snowRisk: boolean;
    whiteoutRisk: boolean;
    extremeColdRisk: boolean;
  } | null;
  current_temp: number | null;
  updated_at: string | null;
}

export async function getAllForecastSummaries(): Promise<ForecastSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("peak_forecasts")
    .select("peak_id, risk_score, risk_level, condition_flags, adjusted_forecast, updated_at");

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    // Get current temp from the first adjusted hour
    const adjustedForecast = row.adjusted_forecast as
      | { temp: number }[]
      | null;
    const currentTemp = adjustedForecast?.[0]?.temp ?? null;

    return {
      peak_id: row.peak_id,
      risk_score: row.risk_score,
      risk_level: row.risk_level,
      condition_flags: row.condition_flags as ForecastSummary["condition_flags"],
      current_temp: currentTemp !== null ? Math.round(currentTemp) : null,
      updated_at: row.updated_at,
    };
  });
}
