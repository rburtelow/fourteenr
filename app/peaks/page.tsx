import { getAllPeaksWithRouteCounts } from "@/lib/peaks";
import { getAllForecastSummaries } from "@/lib/forecasts";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/notifications";
import PeaksClient from "./PeaksClient";

export const revalidate = 3600; // Revalidate every hour

export default async function PeaksPage() {
  const [peaks, forecastSummaries] = await Promise.all([
    getAllPeaksWithRouteCounts(),
    getAllForecastSummaries(),
  ]);

  // Get auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let watchedPeakIds: string[] = [];
  let unreadNotificationCount = 0;

  if (user) {
    const [{ data: profile }, { data: watchlist }, notifCount] = await Promise.all([
      supabase.from("profiles").select("screen_name, avatar_url").eq("id", user.id).single(),
      supabase.from("peak_watchlist").select("peak_id").eq("user_id", user.id),
      getUnreadNotificationCount(user.id),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    watchedPeakIds = watchlist?.map((w) => w.peak_id) || [];
    unreadNotificationCount = notifCount;
  }

  // Build a map of peak_id -> forecast summary for the client
  const forecastMap: Record<string, { risk_level: string | null; current_temp: number | null }> = {};
  for (const f of forecastSummaries) {
    forecastMap[f.peak_id] = { risk_level: f.risk_level, current_temp: f.current_temp };
  }

  return <PeaksClient peaks={peaks} userNav={userNav} userId={user?.id} unreadNotificationCount={unreadNotificationCount} initialWatchedPeakIds={watchedPeakIds} forecasts={forecastMap} />;
}
