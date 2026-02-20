"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter

 } from "next/navigation";

type MobileNavProps = {
  user: {
    email: string;
    screen_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function MobileNav({ user }: MobileNavProps) {
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
            href="/community"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <UsersIcon className="w-5 h-5" />
            <span className="font-medium">Community</span>
          </Link>
          <Link
            href="/peaks"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <MountainIcon className="w-5 h-5" />
            <span className="font-medium">Peaks</span>
          </Link>
          {user && (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
          )}
        </nav>

        {user ? (
          <div className="border-t border-[var(--color-border-app)] p-2">
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
