import { createClient } from "./supabase/server";
import type { Trailhead } from "./database.types";

export type TrailheadRoute = {
  id: string;
  name: string;
  distance: number | null;
  elevation_gain: number | null;
  difficulty: string | null;
  estimated_time: string | null;
  trailhead: string | null;
  description: string | null;
  peak_id: string;
  peaks: {
    id: string;
    slug: string;
    name: string;
    elevation: number;
    rank: number | null;
  } | null;
};

export type TrailheadWithRoutes = Trailhead & { routes: TrailheadRoute[] };
export type TrailheadWithRouteCount = Trailhead & { routeCount: number };

export async function getTrailheadBySlug(slug: string): Promise<TrailheadWithRoutes | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trailheads")
    .select(
      "*, routes(id, name, distance, elevation_gain, difficulty, estimated_time, trailhead, description, peak_id, peaks(id, slug, name, elevation, rank))"
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as unknown as TrailheadWithRoutes;
}

export async function getAllTrailheads(): Promise<Trailhead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trailheads")
    .select("*")
    .order("name", { ascending: true })
    .returns<Trailhead[]>();

  if (error) {
    console.error("Error fetching trailheads:", error);
    return [];
  }
  return data || [];
}

export async function getAllTrailheadsWithRouteCounts(): Promise<TrailheadWithRouteCount[]> {
  const supabase = await createClient();
  const [{ data: trailheads, error }, { data: routes }] = await Promise.all([
    supabase.from("trailheads").select("*").order("name", { ascending: true }).returns<Trailhead[]>(),
    supabase.from("routes").select("trailhead_id").not("trailhead_id", "is", null),
  ]);

  if (error || !trailheads) {
    console.error("Error fetching trailheads:", error);
    return [];
  }

  const countMap = new Map<string, number>();
  if (routes) {
    for (const route of routes) {
      if (route.trailhead_id) {
        countMap.set(route.trailhead_id, (countMap.get(route.trailhead_id) || 0) + 1);
      }
    }
  }

  return trailheads.map((t) => ({
    ...t,
    routeCount: countMap.get(t.id) || 0,
  }));
}

export type TrailheadConditionReport = {
  id: string;
  hike_date: string;
  trailhead_access_rating: string | null;
  sections_json: unknown;
  profiles: {
    screen_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function getTrailheadConditions(trailheadId: string): Promise<TrailheadConditionReport[]> {
  const supabase = await createClient();

  const { data: routes } = await supabase
    .from("routes")
    .select("id")
    .eq("trailhead_id", trailheadId);

  if (!routes || routes.length === 0) return [];

  const routeIds = routes.map((r) => r.id);

  const { data, error } = await supabase
    .from("trip_reports")
    .select("id, hike_date, trailhead_access_rating, sections_json, profiles(screen_name, full_name, avatar_url)")
    .in("route_id", routeIds)
    .not("trailhead_access_rating", "is", null)
    .order("hike_date", { ascending: false })
    .limit(5);

  if (error || !data) return [];
  return data as unknown as TrailheadConditionReport[];
}

export async function getTrailheadsByPeakSlug(peakSlug: string): Promise<Trailhead[]> {
  const supabase = await createClient();

  const { data: peak } = await supabase
    .from("peaks")
    .select("id")
    .eq("slug", peakSlug)
    .single();

  if (!peak) return [];

  const { data: routes } = await supabase
    .from("routes")
    .select("trailhead_id")
    .eq("peak_id", peak.id)
    .not("trailhead_id", "is", null);

  if (!routes || routes.length === 0) return [];

  const trailheadIds = [...new Set(routes.map((r) => r.trailhead_id as string))];

  const { data, error } = await supabase
    .from("trailheads")
    .select("*")
    .in("id", trailheadIds)
    .order("name")
    .returns<Trailhead[]>();

  if (error) {
    console.error("Error fetching trailheads by peak slug:", error);
    return [];
  }

  return data || [];
}
