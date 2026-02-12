import { supabase } from "./supabase";
import type { Peak, Route, PeakWithRoutes } from "./database.types";

export async function getPeakBySlug(slug: string): Promise<PeakWithRoutes | null> {
  // Fetch peak
  const { data: peak, error: peakError } = await supabase
    .from("peaks")
    .select("*")
    .eq("slug", slug)
    .single<Peak>();

  if (peakError || !peak) {
    return null;
  }

  // Fetch routes for this peak
  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("*")
    .eq("peak_id", peak.id)
    .order("distance", { ascending: true })
    .returns<Route[]>();

  if (routesError) {
    console.error("Error fetching routes:", routesError);
  }

  return {
    ...peak,
    routes: routes || [],
  };
}

export async function getAllPeaks(): Promise<Peak[]> {
  const { data, error } = await supabase
    .from("peaks")
    .select("*")
    .order("rank", { ascending: true })
    .returns<Peak[]>();

  if (error) {
    console.error("Error fetching peaks:", error);
    return [];
  }

  return data || [];
}

export type PeakWithRouteCount = Peak & { routeCount: number };

export async function getAllPeaksWithRouteCounts(): Promise<PeakWithRouteCount[]> {
  // Fetch all peaks
  const { data: peaks, error: peakError } = await supabase
    .from("peaks")
    .select("*")
    .order("rank", { ascending: true })
    .returns<Peak[]>();

  if (peakError || !peaks) {
    console.error("Error fetching peaks:", peakError);
    return [];
  }

  // Fetch route counts per peak
  const { data: routeCounts, error: routeError } = await supabase
    .from("routes")
    .select("peak_id");

  if (routeError) {
    console.error("Error fetching routes:", routeError);
  }

  // Count routes per peak
  const countMap = new Map<string, number>();
  if (routeCounts) {
    for (const route of routeCounts) {
      countMap.set(route.peak_id, (countMap.get(route.peak_id) || 0) + 1);
    }
  }

  return peaks.map((peak) => ({
    ...peak,
    routeCount: countMap.get(peak.id) || 0,
  }));
}

export async function getTopPeaks(limit: number = 5): Promise<Peak[]> {
  const { data, error } = await supabase
    .from("peaks")
    .select("*")
    .order("rank", { ascending: true })
    .limit(limit)
    .returns<Peak[]>();

  if (error) {
    console.error("Error fetching top peaks:", error);
    return [];
  }

  return data || [];
}

export async function getPeakSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("peaks")
    .select("slug")
    .returns<{ slug: string }[]>();

  if (error) {
    console.error("Error fetching slugs:", error);
    return [];
  }

  return data?.map((p) => p.slug) || [];
}
