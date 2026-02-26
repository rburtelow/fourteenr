import { createClient } from "@/lib/supabase/server";
import { getUpcomingEvents } from "@/lib/community";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import EventsClient from "./EventsClient";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string; peak?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let unreadNotificationCount = 0;

  if (user) {
    const [{ data: profile }, notifCount] = await Promise.all([
      supabase.from("profiles").select("screen_name, avatar_url").eq("id", user.id).single(),
      getUnreadNotificationCount(user.id),
    ]);
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    unreadNotificationCount = notifCount;
  }

  const filter = (params.filter as "upcoming" | "this_week" | "this_month" | "past") || "upcoming";
  const sort = (params.sort as "soonest" | "popular" | "newest") || "soonest";
  const peakId = params.peak || undefined;

  const events = await getUpcomingEvents({ filter, sort, peakId, limit: 30 });

  const { data: allPeaks } = await supabase
    .from("peaks")
    .select("id, name, slug, elevation")
    .order("name");

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={(allPeaks || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, elevation: p.elevation }))}
      />

      {/* Content */}
      <div className="pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <EventsClient
            initialEvents={events}
            allPeaks={allPeaks || []}
            isLoggedIn={!!user}
            currentUserId={user?.id}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

