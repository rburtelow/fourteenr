import { getAllPeaksWithRouteCounts } from "@/lib/peaks";
import { createClient } from "@/lib/supabase/server";
import PeaksClient from "./PeaksClient";

export const revalidate = 3600; // Revalidate every hour

export default async function PeaksPage() {
  const peaks = await getAllPeaksWithRouteCounts();

  // Get auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let watchedPeakIds: string[] = [];

  if (user) {
    const [{ data: profile }, { data: watchlist }] = await Promise.all([
      supabase
        .from("profiles")
        .select("screen_name, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("peak_watchlist")
        .select("peak_id")
        .eq("user_id", user.id),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    watchedPeakIds = watchlist?.map((w) => w.peak_id) || [];
  }

  return <PeaksClient peaks={peaks} userNav={userNav} initialWatchedPeakIds={watchedPeakIds} />;
}
