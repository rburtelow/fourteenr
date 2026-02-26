import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFollowers, getFollowing, getPendingFollowRequests } from "@/lib/follows";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FriendsManager from "./FriendsManager";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: profile }, { data: peaksData }, notifCount, pendingRequests, followers, following] = await Promise.all([
    supabase.from("profiles").select("screen_name, avatar_url, full_name").eq("id", user.id).single(),
    supabase.from("peaks").select("id, name, slug, elevation").order("name"),
    getUnreadNotificationCount(user.id),
    getPendingFollowRequests(user.id),
    getFollowers(user.id),
    getFollowing(user.id),
  ]);

  const userNav = {
    email: user.email || "",
    screen_name: profile?.screen_name || null,
    avatar_url: profile?.avatar_url || null,
  };
  const navPeaks = peaksData || [];
  const unreadNotificationCount = notifCount;

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={navPeaks}
      />

      {/* Page Header */}
      <div className="pt-28 pb-8 border-b border-[var(--color-border-app)] bg-white/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/community"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              Community
            </Link>
            <span className="text-[var(--color-text-secondary)]">/</span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-bold text-[var(--color-brand-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Friends
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Manage your followers, people you follow, and pending requests.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <FriendsManager
          initialRequests={pendingRequests}
          initialFollowers={followers}
          initialFollowing={following}
        />
      </div>

      <Footer />
    </div>
  );
}

