import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingEvents } from "@/lib/community";
import Footer from "../components/Footer";
import UserNav from "../components/UserNav";
import MobileNav from "../components/MobileNav";
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

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("screen_name, avatar_url")
      .eq("id", user.id)
      .single();

    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
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
                <NavLink href="/peaks">Peaks</NavLink>
                <NavLink href="/community">Community</NavLink>
                <NavLink href="/events" active>Events</NavLink>
                <NavLink href="/profile">Profile</NavLink>
              </div>

              <div className="flex items-center gap-2">
                <UserNav user={userNav} />
                <MobileNav user={userNav} />
              </div>
            </div>
          </div>
        </nav>
      </header>

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

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
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
