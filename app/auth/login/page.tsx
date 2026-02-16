import Link from "next/link";
import { login, signInWithGoogle } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased flex flex-col">
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
                <NavLink href="/peaks">Peaks</NavLink>
                <NavLink href="/community">Community</NavLink>
              </div>
              <Link
                href="/auth/signup"
                className="bg-[var(--color-brand-primary)] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

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
                  Welcome Back
                </h1>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Sign in to continue your summit journey
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {decodeURIComponent(error)}
                </div>
              )}

              {/* Google Sign In */}
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
                    or sign in with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form action={login} className="space-y-4">
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
                    placeholder="Your password"
                    className="w-full px-4 py-3 bg-[var(--color-surface-subtle)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:bg-white transition-all border border-transparent focus:border-[var(--color-brand-primary)]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full group relative bg-[var(--color-brand-primary)] text-white px-6 py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 md:px-10 py-5 bg-[var(--color-surface-subtle)]/50 border-t border-[var(--color-border-app)] text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-[var(--color-brand-primary)] hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] rounded-full hover:bg-[var(--color-surface-subtle)] transition-all"
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
