import Link from "next/link";

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-page)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-[var(--color-surface-subtle)] flex items-center justify-center mb-6">
          <UserIcon className="w-10 h-10 text-[var(--color-text-secondary)]" />
        </div>
        <h1
          className="text-3xl font-bold text-[var(--color-text-primary)] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          User Not Found
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          The profile you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 text-sm font-semibold text-white bg-[var(--color-brand-primary)] rounded-xl hover:bg-[var(--color-brand-accent)] transition-all shadow-lg shadow-[var(--color-brand-primary)]/20"
          >
            Go Home
          </Link>
          <Link
            href="/community"
            className="px-6 py-3 text-sm font-semibold text-[var(--color-brand-primary)] border-2 border-[var(--color-border-app-strong)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-all"
          >
            Browse Community
          </Link>
        </div>
      </div>
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
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}
