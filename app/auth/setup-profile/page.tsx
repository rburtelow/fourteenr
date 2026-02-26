import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setupScreenName } from "../actions";
import Navbar from "@/app/components/Navbar";

export default async function SetupProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // If user already has a screen name, redirect to home
  const { data: profile } = await supabase
    .from("profiles")
    .select("screen_name")
    .eq("id", user.id)
    .single();

  if (profile?.screen_name) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased flex flex-col">
      <Navbar
        user={{ email: user.email || "", screen_name: null, avatar_url: null }}
        userId={user.id}
      />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-[var(--color-border-app)] shadow-xl overflow-hidden">
            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] rounded-2xl mb-6">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h1
                  className="text-3xl font-bold text-[var(--color-brand-primary)] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Choose Your Trail Name
                </h1>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Pick a unique screen name that other hikers will see
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {decodeURIComponent(error)}
                </div>
              )}

              {/* Screen Name Form */}
              <form action={setupScreenName} className="space-y-6">
                <div>
                  <label
                    htmlFor="screen_name"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                  >
                    Screen Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-green)] font-medium">
                      @
                    </span>
                    <input
                      id="screen_name"
                      name="screen_name"
                      type="text"
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="^[a-zA-Z0-9_]+$"
                      placeholder="summit_seeker"
                      className="w-full pl-9 pr-4 py-3.5 bg-[var(--color-surface-subtle)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:bg-white transition-all border border-transparent focus:border-[var(--color-brand-primary)]/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                    3-30 characters. Letters, numbers, and underscores only.
                  </p>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-app)]">
                  <p className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-3">
                    Profile Preview
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white font-bold">
                      {user.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        {user.user_metadata?.full_name || user.email?.split("@")[0] || "Hiker"}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        @your_screen_name
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full group relative bg-[var(--color-brand-primary)] text-white px-6 py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Complete Setup
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
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
        d="M13 7l5 5-5 5M6 12h12"
      />
    </svg>
  );
}
