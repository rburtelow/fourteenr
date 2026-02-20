import Link from "next/link";

function MountainLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-primary)] hover:text-white transition-all"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-app)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--color-brand-primary)] rounded-xl flex items-center justify-center">
                <MountainLogo className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--color-brand-primary)]">
                My14er
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              The definitive platform for Colorado&apos;s high-altitude community.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">Explore</h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">All 58 Peaks</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Trip Reports</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Trail Conditions</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Weather Stations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">Community</h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="/community" className="hover:text-[var(--color-brand-primary)] transition-colors">Forums</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Events</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Leaderboards</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Gear Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Safety Guide</Link></li>
              <li><Link href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--color-brand-primary)] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--color-brand-primary)] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-border-app)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]/60">
            © 2026 My14er. Hike responsibly.
          </p>
          <div className="flex items-center gap-4">
            <SocialLink href="#" label="Instagram">
              <InstagramIcon />
            </SocialLink>
            <SocialLink href="#" label="Twitter">
              <TwitterIcon />
            </SocialLink>
            <SocialLink href="#" label="YouTube">
              <YouTubeIcon />
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
