import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFollowers, getFollowing, getPendingFollowRequests } from "@/lib/follows";
import UserNav from "../components/UserNav";
import MobileNav from "../components/MobileNav";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("screen_name, avatar_url, full_name")
    .eq("id", user.id)
    .single();

  const userNav = {
    email: user.email || "",
    screen_name: profile?.screen_name || null,
    avatar_url: profile?.avatar_url || null,
  };

  const [pendingRequests, followers, following] = await Promise.all([
    getPendingFollowRequests(user.id),
    getFollowers(user.id),
    getFollowing(user.id),
  ]);

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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium rounded-full transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]"
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
