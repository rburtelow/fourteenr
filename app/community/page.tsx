import Image from "next/image";
import Link from "next/link";

const feedPosts = [
  {
    id: 1,
    author: "Sarah Chen",
    handle: "@sarahsummits",
    avatar: "SC",
    timeAgo: "2h",
    content: "Just summited Mount Bierstadt this morning. The sunrise painted the entire Front Range in shades of gold and pink. Already planning my next 14er adventure.",
    image: "/hero.png",
    peak: "Mt. Bierstadt",
    elevation: "14,065'",
    likes: 124,
    comments: 18,
    saves: 7,
  },
  {
    id: 2,
    author: "Marcus Reid",
    handle: "@highaltitude_marcus",
    avatar: "MR",
    timeAgo: "5h",
    content: "Looking for hiking partners for Quandary Peak this Saturday. Planning an alpine start around 4am to catch sunrise from the summit. Intermediate pace, all skill levels welcome.",
    likes: 42,
    comments: 23,
    saves: 2,
  },
  {
    id: 3,
    author: "Elena Voss",
    handle: "@trail_elena",
    avatar: "EV",
    timeAgo: "1d",
    content: "Trail conditions update for Grays & Torreys: Main trail is clear to the saddle. Still some snow patches near the Torreys summit—microspikes recommended. Winds were brutal above treeline yesterday.",
    image: "/hero.png",
    peak: "Grays Peak",
    elevation: "14,270'",
    likes: 89,
    comments: 31,
    saves: 15,
    isConditionReport: true,
  },
];

const trendingPeaks = [
  { name: "Quandary Peak", reports: 23, trend: "+12%" },
  { name: "Mt. Bierstadt", reports: 18, trend: "+8%" },
  { name: "Grays Peak", reports: 15, trend: "+5%" },
];

const upcomingEvents = [
  { title: "14er Sunrise Hike", date: "Feb 15", location: "Mt. Evans", attendees: 24 },
  { title: "Trail Maintenance Day", date: "Feb 22", location: "Quandary", attendees: 12 },
];

const suggestedHikers = [
  { name: "Alex Thompson", summits: 34, mutual: 3 },
  { name: "Jessica Park", summits: 52, mutual: 5 },
  { name: "David Kim", summits: 28, mutual: 2 },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      {/* Navigation - matching landing page */}
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
                <NavLink href="/">Home</NavLink>
                <NavLink href="/community" active>Community</NavLink>
                <NavLink href="#">Peaks</NavLink>
                <NavLink href="#">Gear</NavLink>
              </div>

              <div className="flex items-center gap-3">
                <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors px-4 py-2">
                  <BellIcon className="w-5 h-5" />
                  <span className="sr-only">Notifications</span>
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-lg transition-shadow">
                  YU
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Page Header */}
      <div className="pt-28 pb-8 border-b border-[var(--color-border-app)] bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[var(--color-text-muted-green)] tracking-widest uppercase">
                The Community
              </span>
              <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-[var(--color-brand-primary)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Trail Talk
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors rounded-full hover:bg-[var(--color-surface-subtle)]">
                Latest
              </button>
              <button className="px-4 py-2 text-sm font-medium text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)] rounded-full">
                Following
              </button>
              <button className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors rounded-full hover:bg-[var(--color-surface-subtle)]">
                Conditions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden">
                <div className="h-20 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] relative">
                  <div className="absolute -bottom-8 left-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] border-4 border-white flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      YU
                    </div>
                  </div>
                </div>
                <div className="pt-12 pb-5 px-5">
                  <h3 className="font-semibold text-[var(--color-text-primary)]">Your Name</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">@yourhandle</p>
                  <div className="mt-4 flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xl font-bold text-[var(--color-brand-primary)]">12</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Summits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[var(--color-brand-primary)]">248</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[var(--color-brand-primary)]">89</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Followers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-1">
                  <SidebarLink icon={<CompassIcon />} label="My Hikes" count={12} />
                  <SidebarLink icon={<UsersIcon />} label="Groups" count={4} />
                  <SidebarLink icon={<CalendarIcon />} label="Events" count={2} />
                  <SidebarLink icon={<BookmarkIcon />} label="Saved" count={18} />
                </nav>
              </div>

              {/* Trending Peaks */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Trending This Week
                </h3>
                <div className="space-y-3">
                  {trendingPeaks.map((peak, i) => (
                    <div key={peak.name} className="flex items-center gap-3 group cursor-pointer">
                      <span className="text-sm font-mono text-[var(--color-text-muted-green)] w-5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                          {peak.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {peak.reports} reports
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[var(--color-brand-highlight)]">
                        {peak.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  YU
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share your trail story..."
                    rows={3}
                    className="w-full resize-none bg-[var(--color-surface-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                        <MapPinIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                        <MountainIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button className="bg-[var(--color-brand-primary)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--color-brand-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/20">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Posts */}
            {feedPosts.map((post, index) => (
              <article
                key={post.id}
                className={`bg-white rounded-2xl border border-[var(--color-border-app)] overflow-hidden card-hover animate-fade-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Post Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] flex items-center justify-center text-white font-semibold">
                        {post.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--color-text-primary)]">{post.author}</span>
                          {post.isConditionReport && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--color-amber-glow)]/10 text-[var(--color-amber-glow)] text-xs font-medium">
                              Conditions
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <span>{post.handle}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)]/30" />
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)] transition-all">
                      <MoreIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <p className="mt-4 text-[var(--color-text-primary)] leading-relaxed">
                    {post.content}
                  </p>

                  {/* Peak Tag */}
                  {post.peak && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-subtle)] text-sm">
                      <MountainIcon className="w-4 h-4 text-[var(--color-brand-primary)]" />
                      <span className="font-medium text-[var(--color-text-primary)]">{post.peak}</span>
                      <span className="text-[var(--color-text-secondary)]">•</span>
                      <span className="font-mono text-[var(--color-brand-primary)]">{post.elevation}</span>
                    </div>
                  )}
                </div>

                {/* Image */}
                {post.image && (
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 py-4 border-t border-[var(--color-border-app)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors">
                        <div className="p-2 rounded-lg group-hover:bg-[var(--color-surface-subtle)] transition-colors">
                          <HeartIcon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <button className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors">
                        <div className="p-2 rounded-lg group-hover:bg-[var(--color-surface-subtle)] transition-colors">
                          <CommentIcon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                    </div>
                    <button className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-amber-glow)] transition-colors">
                      <div className="p-2 rounded-lg group-hover:bg-[var(--color-amber-glow)]/10 transition-colors">
                        <BookmarkIcon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">{post.saves}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* Load More */}
            <div className="text-center pt-4">
              <button className="px-6 py-3 text-sm font-semibold text-[var(--color-brand-primary)] border-2 border-[var(--color-border-app-strong)] rounded-xl hover:bg-[var(--color-surface-subtle)] transition-all">
                Load More Stories
              </button>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              {/* Suggested Hikers */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Hikers to Follow
                </h3>
                <div className="space-y-4">
                  {suggestedHikers.map((hiker) => (
                    <div key={hiker.name} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-stone-warm)] to-[var(--color-stone-light)] flex items-center justify-center text-[var(--color-text-primary)] font-semibold text-sm">
                        {hiker.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {hiker.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {hiker.summits} summits • {hiker.mutual} mutual
                        </p>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-primary)] border border-[var(--color-border-app-strong)] rounded-lg hover:bg-[var(--color-surface-subtle)] transition-all">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full text-sm font-medium text-[var(--color-brand-primary)] hover:underline">
                  See All Suggestions
                </button>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-4">
                  Upcoming Events
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.title} className="group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-primary)]/10 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-[var(--color-brand-primary)]">
                            {event.date.split(' ')[0]}
                          </span>
                          <span className="text-sm font-bold text-[var(--color-brand-primary)]">
                            {event.date.split(' ')[1]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {event.location} • {event.attendees} going
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full text-sm font-medium text-[var(--color-brand-primary)] hover:underline">
                  View All Events
                </button>
              </div>

              {/* Weather Widget */}
              <div className="bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-sm font-semibold text-white/70 tracking-wider uppercase mb-3">
                  Summit Weather
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">28°</div>
                  <div className="text-sm text-white/80">
                    <p>Winds 25-35 mph</p>
                    <p>Clear skies</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/60">
                  Mt. Elbert summit forecast
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
        active
          ? 'text-[var(--color-brand-primary)] bg-[var(--color-surface-subtle)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-subtle)]'
      }`}
    >
      {children}
    </Link>
  );
}

function SidebarLink({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--color-surface-subtle)] transition-all group">
      <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-primary)] transition-colors">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
      {count !== undefined && (
        <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polygon fill="currentColor" stroke="none" points="12,6 14,12 12,18 10,12" opacity="0.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
  );
}
