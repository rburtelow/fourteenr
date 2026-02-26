import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSavedPosts } from "@/lib/community";
import { getBulkFollowStatuses } from "@/lib/follows";
import type { FollowStatus } from "@/lib/follows";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CommunityFeed from "../CommunityFeed";

export default async function SavedPostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [savedPosts, profileResult, allPeaksResult, watchlistResult] =
    await Promise.all([
      getSavedPosts(),
      supabase
        .from("profiles")
        .select("screen_name, full_name, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase.from("peaks").select("id, name, slug, elevation").order("name"),
      supabase
        .from("peak_watchlist")
        .select("peak_id")
        .eq("user_id", user.id),
    ]);

  const userProfile = profileResult.data;
  const allPeaks = allPeaksResult.data || [];
  const watchedPeakIds = watchlistResult.data?.map((w) => w.peak_id) || [];

  let followStatuses: Record<string, FollowStatus> = {};
  const authorIds = [...new Set(savedPosts.map((p) => p.user_id))];
  if (authorIds.length > 0) {
    const statusMap = await getBulkFollowStatuses(user.id, authorIds);
    followStatuses = Object.fromEntries(statusMap);
  }

  const displayName =
    userProfile?.full_name ||
    userProfile?.screen_name ||
    user.email?.split("@")[0] ||
    "Hiker";
  const avatarInitials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const unreadNotificationCount = await getUnreadNotificationCount(user.id);

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={{
          email: user.email || "",
          screen_name: userProfile?.screen_name || null,
          avatar_url: userProfile?.avatar_url || null,
        }}
        userId={user.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={allPeaks}
      />

      <div className="pt-28 pb-8 border-b border-[var(--color-border-app)] bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <Link
            href="/community"
            className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-widest uppercase hover:text-[var(--color-brand-primary)] transition-colors"
          >
            ← Community
          </Link>
          <h1
            className="mt-2 text-3xl lg:text-4xl font-bold text-[var(--color-brand-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Saved Posts
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {savedPosts.length} {savedPosts.length === 1 ? "post" : "posts"} saved
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <CommunityFeed
            posts={savedPosts}
            avatarInitials={avatarInitials}
            isLoggedIn={true}
            currentUserId={user.id}
            initialWatchedPeakIds={watchedPeakIds}
            allPeaks={allPeaks}
            followStatuses={followStatuses}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
