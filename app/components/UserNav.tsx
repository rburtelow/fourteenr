"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type UserNavProps = {
  user: {
    email: string;
    screen_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="hidden sm:block text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors px-4 py-2"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="bg-[var(--color-brand-primary)] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const initials = user.screen_name
    ? user.screen_name.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-lg transition-shadow"
        title={user.screen_name || user.email}
      >
        {initials}
      </Link>
      <button
        onClick={handleSignOut}
        className="hidden sm:block text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors px-3 py-2"
      >
        Sign Out
      </button>
    </div>
  );
}
