"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserNav from "./UserNav";
import MobileNav from "./MobileNav";
import NotificationBell from "@/app/community/NotificationBell";
import LogSummitButton from "./LogSummitButton";
import GlobalSearch from "./GlobalSearch";

type NavUser = {
  email: string;
  screen_name: string | null;
  avatar_url: string | null;
};

interface NavbarProps {
  user: NavUser | null;
  userId?: string;
  unreadNotificationCount?: number;
  peaks?: { id: string; name: string; slug: string; elevation: number }[];
}

const LOGGED_IN_LINKS = [
  { href: "/", label: "Home" },
  { href: "/peaks", label: "Peaks" },
  { href: "/trailheads", label: "Trailheads" },
  { href: "/community", label: "Community" },
  { href: "/events", label: "Events" },
  { href: "/groups", label: "Groups" },
  { href: "/profile", label: "Profile" },
];

const LOGGED_OUT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/peaks", label: "Peaks" },
  { href: "/trailheads", label: "Trailheads" },
  { href: "/community", label: "Community" },
];

export default function Navbar({
  user,
  userId,
  unreadNotificationCount = 0,
  peaks = [],
}: NavbarProps) {
  const pathname = usePathname();
  const navLinks = user ? LOGGED_IN_LINKS : LOGGED_OUT_LINKS;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-4 mt-4 md:mx-8 md:mt-6">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-[var(--color-border-app)]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[var(--color-brand-primary)] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
                <MountainLogo className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--color-brand-primary)]">
                My14er
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} active={pathname === href}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <GlobalSearch />
              {user && (
                <>
                  <LogSummitButton
                    peaks={peaks}
                    isLoggedIn
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-full hover:bg-[var(--color-brand-accent)] transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Log a Summit
                  </LogSummitButton>
                  {userId && (
                    <NotificationBell
                      initialCount={unreadNotificationCount}
                      userId={userId}
                    />
                  )}
                </>
              )}
              <UserNav user={user} />
              <MobileNav user={user} peaks={peaks} />
            </div>
          </div>
        </div>
      </nav>
    </header>
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-4 h-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}
