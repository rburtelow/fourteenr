import { getAllTrailheadsWithRouteCounts } from "@/lib/trailheads";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/notifications";
import TrailheadsClient from "./TrailheadsClient";

export const revalidate = 3600;

export default async function TrailheadsPage() {
  const trailheads = await getAllTrailheadsWithRouteCounts();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let navPeaks: { id: string; name: string; slug: string; elevation: number }[] = [];
  let unreadNotificationCount = 0;

  if (user) {
    const [{ data: profile }, { data: peaksData }, notifCount] = await Promise.all([
      supabase.from("profiles").select("screen_name, avatar_url").eq("id", user.id).single(),
      supabase.from("peaks").select("id, name, slug, elevation").order("name"),
      getUnreadNotificationCount(user.id),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    navPeaks = peaksData || [];
    unreadNotificationCount = notifCount;
  }

  return (
    <TrailheadsClient
      trailheads={trailheads}
      userNav={userNav}
      userId={user?.id}
      navPeaks={navPeaks}
      unreadNotificationCount={unreadNotificationCount}
    />
  );
}
