import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGroups } from "@/lib/groups";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import GroupsClient from "./GroupsClient";

export const metadata = {
  title: "Groups | my14er",
  description: "Find and join communities of Colorado 14er hikers.",
};

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  let unreadNotificationCount = 0;

  if (user) {
    const [{ data: profile }, notifCount] = await Promise.all([
      supabase
        .from("profiles")
        .select("screen_name, avatar_url")
        .eq("id", user.id)
        .single(),
      getUnreadNotificationCount(user.id),
    ]);

    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
    unreadNotificationCount = notifCount;
  }

  // Fetch all peaks for the group creator peak selector
  const { data: allPeaks } = await supabase
    .from("peaks")
    .select("id, name, slug, elevation")
    .order("name");

  // Fetch groups (server-side initial load; client handles filtering)
  const groups = await getGroups({ limit: 100 });

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={(allPeaks || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, elevation: p.elevation }))}
      />

      {/* Page Header */}
      <div className="pt-28 pb-8 border-b border-[var(--color-border-app)] bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-widest uppercase">
                Community
              </span>
              <h1
                className="mt-2 text-3xl lg:text-4xl font-bold text-[var(--color-brand-primary)] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Groups
              </h1>
              <p className="mt-2 text-[var(--color-text-secondary)] text-sm max-w-xl">
                Find your crew. Join communities around the peaks, routes, and topics you love.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/community"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors"
              >
                ← Back to Community
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <GroupsClient
          initialGroups={groups}
          allPeaks={(allPeaks || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, elevation: p.elevation }))}
          isLoggedIn={!!user}
        />
      </div>

      <Footer />
    </div>
  );
}
