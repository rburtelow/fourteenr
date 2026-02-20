import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllBadges, getUserBadges } from "@/lib/badges";
import UserNav from "../components/UserNav";
import Footer from "../components/Footer";
import BadgeExplainer, { AllBadgesCount } from "../components/badges/BadgeExplainer";
import { BadgeCategoryGrid } from "../components/badges/BadgeGrid";

export const metadata = {
  title: "Badges | My14er",
  description: "Explore all badges you can earn by summiting Colorado 14ers",
};

export default async function BadgesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("screen_name, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  const userNav = user
    ? {
        email: user.email || "",
        screen_name: profile?.screen_name || null,
        avatar_url: profile?.avatar_url || null,
      }
    : null;

  // Fetch badge data
  const [allBadges, userBadges] = user
    ? await Promise.all([getAllBadges(), getUserBadges(user.id)])
    : [await getAllBadges(), []];

  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="mx-4 mt-4 md:mx-8 md:mt-6">
          <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-[var(--color-border-app)]">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-[var(--color-brand-primary)] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
                  <MountainLogo className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[var(--color-brand-primary)]">
                  My14er
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/community">Community</NavLink>
                <NavLink href="/peaks">Peaks</NavLink>
              </div>

              <UserNav user={userNav} />
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-subtle)] text-sm font-medium text-[var(--color-text-muted-green)] mb-6">
              <TrophyIcon className="w-4 h-4" />
              Achievement System
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Badges & Achievements
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Track your progress and celebrate your accomplishments as you conquer
              Colorado&apos;s magnificent 14ers.
            </p>
          </div>

          {/* Progress Card */}
          {user && (
            <div className="max-w-xl mx-auto mb-12">
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[var(--color-text-primary)]">
                    Your Progress
                  </h2>
                  <span className="text-sm font-medium text-[var(--color-brand-primary)]">
                    {earnedCount} / {totalCount} earned
                  </span>
                </div>
                <div className="h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-amber-glow)] to-[var(--color-brand-highlight)] rounded-full transition-all duration-500"
                    style={{
                      width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <BadgeCategoryGrid allBadges={allBadges} earnedBadges={userBadges} />
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center mb-12">
            <AllBadgesCount />
          </div>
        </div>
      </div>

      {/* Badge Explainer */}
      <div className="px-4 sm:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-[var(--color-border-app)] p-8 md:p-12 shadow-xl">
            <BadgeExplainer />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
        active
          ? "text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]"
      }`}
    >
      {children}
    </Link>
  );
}

function MountainLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M7.73 9.728a6.726 6.726 0 002.748 1.35m3.044 0a6.726 6.726 0 002.748-1.35m-8.592 0c-.623.134-1.27.218-1.933.254A4.492 4.492 0 013 8.25c0-1.177.45-2.247 1.188-3.052M16.27 9.728c.623.134 1.27.218 1.933.254A4.492 4.492 0 0021 8.25c0-1.177-.45-2.247-1.188-3.052"
      />
    </svg>
  );
}
