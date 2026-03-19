"use server";

import { createClient } from "@/lib/supabase/server";
import type { Route } from "@/lib/database.types";

export async function getRoutesByPeakId(peakId: string): Promise<Route[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("peak_id", peakId)
    .order("distance", { ascending: true })
    .returns<Route[]>();

  if (error) {
    console.error("Error fetching routes:", error);
    return [];
  }
  return data || [];
}
