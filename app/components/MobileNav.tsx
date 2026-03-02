"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import LogSummitButton from "./LogSummitButton";

type MobileNavProps = {
  user: {
    email: string;
    screen_name: string | null;
    avatar_url: string | null;
  } | null;
  peaks?: { id: string; name: string; slug: string; elevation: number }[];
};

export default function MobileNav({ user, peaks = [] }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-subtle)] transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-5 h-5 text-[var(--color-text-secondary)]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={closeMenu}
        />
      )}

      {/* Menu */}
      <div
        className={`fixed top-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-[var(--color-border-app)] z-50 overflow-hidden transition-all duration-200 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="p-2">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </Link>
          <Link
            href="/peaks"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <MountainIcon className="w-5 h-5" />
            <span className="font-medium">Peaks</span>
          </Link>
          <Link
            href="/trailheads"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <TrailheadIcon className="w-5 h-5" />
            <span className="font-medium">Trailheads</span>
          </Link>
          <Link
            href="/community"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <UsersIcon className="w-5 h-5" />
            <span className="font-medium">Community</span>
          </Link>
          {user && (
            <>
              <Link
                href="/events"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
              >
                <CalendarIcon className="w-5 h-5" />
                <span className="font-medium">Events</span>
              </Link>
              <Link
                href="/groups"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
              >
                <GroupIcon className="w-5 h-5" />
                <span className="font-medium">Groups</span>
              </Link>
            </>
          )}
        </nav>

        {user ? (
          <div className="border-t border-[var(--color-border-app)] p-2">
            <LogSummitButton
              peaks={peaks}
              isLoggedIn
              className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-1 rounded-xl bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-accent)] transition-colors font-medium"
            >
              Log a Summit
            </LogSummitButton>
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <SignOutIcon className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="border-t border-[var(--color-border-app)] p-2">
            <Link
              href="/auth/login"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-1 rounded-xl bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-accent)] transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function TrailheadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l4-12 5 7 3-5 6 10H3z" />
      <circle cx="18" cy="5" r="2" />
      <path strokeLinecap="round" d="M16 7l-2 4" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function GroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
