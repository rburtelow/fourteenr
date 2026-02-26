import Link from "next/link";
import { signup, signInWithGoogle } from "../actions";
import Navbar from "@/app/components/Navbar";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased flex flex-col">
      <Navbar user={null} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl border border-[var(--color-border-app)] shadow-xl overflow-hidden">
            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-surface-subtle)] rounded-2xl mb-6">
                  <MountainLogo className="w-8 h-8 text-[var(--color-brand-primary)]" />
                </div>
                <h1
                  className="text-3xl font-bold text-[var(--color-brand-primary)] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Join the Summit
                </h1>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Create your account and start tracking peaks
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {decodeURIComponent(error)}
                </div>
              )}

              {/* Google Sign Up */}
              <form action={signInWithGoogle}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-[var(--color-border-app-strong)] bg-white text-[var(--color-text-primary)] font-semibold text-sm hover:bg-[var(--color-surface-subtle)] hover:border-[var(--color-brand-primary)]/20 transition-all"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border-app)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-[var(--color-text-muted-green)] font-semibold tracking-wider">
                    or sign up with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form action={signup} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-[var(--color-surface-subtle)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:bg-white transition-all border border-transparent focus:border-[var(--color-brand-primary)]/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 bg-[var(--color-surface-subtle)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:bg-white transition-all border border-transparent focus:border-[var(--color-brand-primary)]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full group relative bg-[var(--color-brand-primary)] text-white px-6 py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
                >
                  <span className="relative z-10">Create Account</span>
                  <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </form>

              <p className="mt-4 text-xs text-center text-[var(--color-text-secondary)]">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 md:px-10 py-5 bg-[var(--color-surface-subtle)]/50 border-t border-[var(--color-border-app)] text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-[var(--color-brand-primary)] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MountainLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
