import Image from "next/image";
import Link from "next/link";
import { getTopPeaks } from "@/lib/peaks";
import { createClient } from "@/lib/supabase/server";
import UserNav from "./components/UserNav";
import Footer from "./components/Footer";

const stats = [
  { value: "58", label: "Fourteeners", suffix: "" },
  { value: "14", label: "Minimum Elevation", suffix: ",000 ft" },
  { value: "12K", label: "Active Hikers", suffix: "+" },
];

const tripReports = [
  {
    title: "First Light on Longs",
    author: "Sarah Chen",
    timeAgo: "3h",
    elevation: "14,255'",
    imageSrc: "/hero.png",
  },
  {
    title: "Winter Traverse",
    author: "Marcus Reid",
    timeAgo: "8h",
    elevation: "14,067'",
    imageSrc: "/hero.png",
  },
  {
    title: "Cloud Inversion",
    author: "Elena Voss",
    timeAgo: "1d",
    elevation: "14,270'",
    imageSrc: "/hero.png",
  },
];

export default async function LandingPage() {
  const peaks = await getTopPeaks(5);

  // Get auth state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userNav: { email: string; screen_name: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("screen_name, avatar_url")
      .eq("id", user.id)
      .single();
    userNav = {
      email: user.email || "",
      screen_name: profile?.screen_name || null,
      avatar_url: profile?.avatar_url || null,
    };
  }

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased overflow-x-hidden">
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
                <NavLink href="/community">Community</NavLink>
                <NavLink href="/peaks">Peaks</NavLink>
                <NavLink href="/profile">Profile</NavLink>
              </div>

              <UserNav user={userNav} />
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[100vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/hero.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              quality={70}
              unoptimized={process.env.NODE_ENV === "development"}
              className="object-cover"
            />
            {/* Gradient overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-page)]/60 via-transparent to-[var(--color-page)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-primary)]/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Typography */}
              <div className="text-center lg:text-left">
                <div className="animate-fade-up">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs font-semibold text-[var(--color-brand-primary)] tracking-wider uppercase mb-8 border border-[var(--color-border-app)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-highlight)] animate-pulse" />
                    Colorado&apos;s 58 Peaks
                  </span>
                </div>

                <h1 className="animate-fade-up delay-100">
                  <span className="block font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-[var(--color-brand-primary)] leading-[0.9] tracking-tight">
                    Conquer
                  </span>
                  <span className="block font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                    the Clouds
                  </span>
                </h1>

                <p className="animate-fade-up delay-200 mt-8 text-lg text-[var(--color-text-secondary)] max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Track summits. Share stories. Join a community of high-altitude adventurers pushing above 14,000 feet.
                </p>

                <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/auth/signup" className="group relative bg-[var(--color-brand-primary)] text-white px-8 py-4 rounded-2xl font-semibold text-base overflow-hidden transition-all hover:shadow-2xl hover:shadow-[var(--color-brand-primary)]/30 inline-block text-center">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Start Your Journey
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  <Link href="/peaks" className="px-8 py-4 rounded-2xl font-semibold text-base text-[var(--color-text-secondary)] border-2 border-[var(--color-border-app-strong)] bg-white/50 backdrop-blur-sm hover:bg-white hover:border-[var(--color-brand-primary)]/20 transition-all inline-block text-center">
                    Explore Peaks
                  </Link>
                </div>
              </div>

              {/* Right: Stats Card */}
              <div className="animate-fade-up delay-400 hidden lg:block">
                <div className="relative">
                  {/* Floating accent shapes */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-[var(--color-amber-glow)]/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[var(--color-brand-primary)]/10 rounded-full blur-3xl" />

                  <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-border-app)]">
                      <div className="w-12 h-12 bg-[var(--color-surface-subtle)] rounded-2xl flex items-center justify-center">
                        <Compass className="w-6 h-6 text-[var(--color-brand-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-text-muted-green)] font-medium">Your Dashboard</p>
                        <p className="text-[var(--color-text-primary)] font-semibold">Summit Tracker</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="text-3xl font-bold text-[var(--color-brand-primary)]">
                            {stat.value}
                            <span className="text-sm font-normal text-[var(--color-text-muted-green)]">{stat.suffix}</span>
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--color-border-app)]">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-surface-subtle)] to-[var(--color-border-app-strong)] border-2 border-white flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)]"
                            >
                              {String.fromCharCode(64 + i)}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          <span className="font-semibold text-[var(--color-brand-primary)]">2,847</span> online now
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-up delay-700">
            <div className="flex flex-col items-center gap-2 text-[var(--color-text-secondary)]/60">
              <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
              <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1.5">
                <div className="w-1.5 h-3 rounded-full bg-current animate-bounce" />
              </div>
            </div>
          </div>
        </section>

        {/* Peaks Grid Section */}
        <section className="relative py-24 lg:py-32 topo-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-widest uppercase">
                  The Collection
                </span>
                <h2 className="mt-3 text-4xl lg:text-5xl font-bold text-[var(--color-brand-primary)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Colorado&apos;s Highest
                </h2>
              </div>
              <p className="text-[var(--color-text-secondary)] max-w-md lg:text-right leading-relaxed">
                Fifty-eight peaks above 14,000 feet. Each one a story waiting to be written.
              </p>
            </div>

            {/* Peaks Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-[var(--color-border-app)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border-app)]">
                      <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">Peak</th>
                      <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden sm:table-cell">Region</th>
                      <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase">Elevation</th>
                      <th className="text-left px-6 py-5 text-xs font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase hidden md:table-cell">Class</th>
                      <th className="px-6 py-5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {peaks.map((peak) => (
                      <tr
                        key={peak.id}
                        className="border-b border-[var(--color-border-app)] last:border-0 hover:bg-[var(--color-surface-subtle)]/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <Link href={`/peaks/${peak.slug}`} className="flex items-center gap-4">
                            <span className="text-sm font-mono text-[var(--color-text-muted-green)]">
                              {String(peak.rank ?? 0).padStart(2, '0')}
                            </span>
                            <span className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {peak.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-5 text-sm text-[var(--color-text-secondary)] hidden sm:table-cell">
                          <Link href={`/peaks/${peak.slug}`}>{peak.range}</Link>
                        </td>
                        <td className="px-6 py-5">
                          <Link href={`/peaks/${peak.slug}`} className="font-mono text-[var(--color-brand-primary)] font-medium">
                            {peak.elevation.toLocaleString()}&apos;
                          </Link>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <Link href={`/peaks/${peak.slug}`} className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
                            {peak.difficulty}
                          </Link>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link href={`/peaks/${peak.slug}`}>
                            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted-green)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all inline-block" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-5 bg-[var(--color-surface-subtle)]/30 flex items-center justify-between">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Showing <span className="font-semibold">{peaks.length}</span> of <span className="font-semibold">58</span> peaks
                </p>
                <Link href="/peaks" className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline flex items-center gap-2 group">
                  View All Peaks
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trip Reports Section */}
        <section className="py-24 lg:py-32 bg-[var(--color-brand-primary)] relative overflow-hidden grain-overlay">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-amber-glow)]/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs font-semibold text-white/50 tracking-widest uppercase">
                  From the Field
                </span>
                <h2 className="mt-3 text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Recent Dispatches
                </h2>
              </div>
              <Link
                href="#"
                className="text-sm font-semibold text-white/80 hover:text-white flex items-center gap-2 group transition-colors"
              >
                All Trip Reports
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {tripReports.map((report) => (
                <article
                  key={report.title}
                  className="group card-hover bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={report.imageSrc}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
                        <Mountain className="w-3 h-3" />
                        {report.elevation}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[var(--color-amber-glow)] transition-colors">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span>{report.author}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span>{report.timeAgo} ago</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-widest uppercase">
                Why My14er
              </span>
              <h2 className="mt-3 text-4xl lg:text-5xl font-bold text-[var(--color-brand-primary)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Built for the Summit
              </h2>
              <p className="mt-6 text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Everything you need for your journey above 14,000 feet, crafted by hikers who know the terrain.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<MapIcon />}
                title="Precision Trail Data"
                description="High-resolution topographic maps, GPS waypoints, and real-time trail conditions from our network of weather stations."
              />
              <FeatureCard
                icon={<UsersIcon />}
                title="Active Community"
                description="Connect with fellow peak baggers, share trip reports, and get conditions from hikers who were there this morning."
              />
              <FeatureCard
                icon={<BadgeIcon />}
                title="Track Your Legacy"
                description="Digital summit logs, progress badges, and a personal record of every peak you've conquered on your 14er journey."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="relative bg-[var(--color-stone-light)] rounded-[2.5rem] p-12 lg:p-20 overflow-hidden">
              {/* Decorative mountain silhouette */}
              <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
                <svg viewBox="0 0 1200 200" fill="var(--color-brand-primary)" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0,200 L0,120 L200,60 L400,100 L500,40 L700,80 L900,20 L1100,70 L1200,50 L1200,200 Z" />
                </svg>
              </div>

              <div className="relative text-center">
                <h2 className="text-4xl lg:text-6xl font-bold text-[var(--color-brand-primary)] tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                  Ready for the climb?
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
                  Join thousands of Colorado hikers already tracking their summits and sharing their stories.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup" className="group relative bg-[var(--color-brand-primary)] text-white px-10 py-5 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-[var(--color-brand-primary)]/30 inline-block text-center">
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-[var(--color-brand-accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  <Link href="/peaks" className="px-10 py-5 rounded-2xl font-semibold text-lg text-[var(--color-text-secondary)] border-2 border-[var(--color-stone-warm)] hover:border-[var(--color-brand-primary)]/20 hover:bg-white/50 transition-all inline-block text-center">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] rounded-full hover:bg-[var(--color-surface-subtle)] transition-all"
    >
      {children}
    </Link>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-8 rounded-3xl bg-white border border-[var(--color-border-app)] card-hover">
      <div className="w-14 h-14 bg-[var(--color-surface-subtle)] rounded-2xl flex items-center justify-center mb-6 text-[var(--color-brand-primary)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">{title}</h3>
      <p className="text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

// Icons
function MountainLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
    </svg>
  );
}

function Compass({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polygon fill="currentColor" stroke="none" points="12,2 15,12 12,22 9,12" opacity="0.3" />
      <polygon fill="currentColor" stroke="none" points="12,6 14,12 12,18 10,12" />
    </svg>
  );
}

function Mountain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21l4-10 4 10M12 11V3" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
