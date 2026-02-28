import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getGroupBySlug,
  getGroupMembers,
  getPendingMembers,
  getUserMembership,
  getGroupPinnedPostIds,
} from "@/lib/groups";
import { getPosts, getUpcomingEvents } from "@/lib/community";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { getBulkFollowStatuses } from "@/lib/follows";
import type { FollowStatus } from "@/lib/follows";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import MembershipButton from "./MembershipButton";
import MemberList from "./MemberList";
import CommunityFeed from "@/app/community/CommunityFeed";
import GroupEventsTab from "./GroupEventsTab";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/groups.types";
import type { GroupRole } from "@/lib/groups.types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug);
  if (!group) return { title: "Group Not Found | my14er" };
  return {
    title: `${group.name} | my14er Groups`,
    description: group.description ?? `Join ${group.name} on my14er.`,
  };
}

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab = "feed" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const group = await getGroupBySlug(slug);
  if (!group) notFound();

  // Fetch current user's nav data + membership in parallel
  const [userNav, userProfile, membership, unreadNotificationCount] = await Promise.all([
    user
      ? supabase
          .from("profiles")
          .select("screen_name, avatar_url")
          .eq("id", user.id)
          .single()
          .then(({ data }) => ({
            email: user.email || "",
            screen_name: data?.screen_name || null,
            avatar_url: data?.avatar_url || null,
          }))
      : Promise.resolve(null),
    user
      ? supabase
          .from("profiles")
          .select("screen_name, full_name, avatar_url")
          .eq("id", user.id)
          .single()
          .then(({ data }) => data)
      : Promise.resolve(null),
    user ? getUserMembership(group.id, user.id) : Promise.resolve(null),
    user ? getUnreadNotificationCount(user.id) : Promise.resolve(0),
  ]);

  const memberStatus = membership?.status ?? null;
  const memberRole: GroupRole | null = membership?.role ?? null;
  const isActiveMember = memberStatus === "active";
  const canManage = memberRole === "admin" || memberRole === "moderator";

  // Non-members of private groups see no content
  const canViewContent = group.privacy === "public" || isActiveMember;

  // Fetch all peaks for navbar
  const { data: allPeaks } = await supabase
    .from("peaks")
    .select("id, name, slug, elevation")
    .order("name");

  // Fetch tab-specific data
  let groupPosts: Awaited<ReturnType<typeof getPosts>> = [];
  let pinnedPostIds: string[] = [];
  let members: Awaited<ReturnType<typeof getGroupMembers>> = [];
  let pendingMembers: Awaited<ReturnType<typeof getPendingMembers>> = [];
  let followStatuses: Record<string, FollowStatus> = {};
  let groupEvents: Awaited<ReturnType<typeof getUpcomingEvents>> = [];

  if (canViewContent) {
    if (tab === "feed") {
      [groupPosts, pinnedPostIds] = await Promise.all([
        getPosts({ groupId: group.id, limit: 20 }),
        getGroupPinnedPostIds(group.id),
      ]);

      if (user && groupPosts.length > 0) {
        const authorIds = [...new Set(groupPosts.map((p) => p.user_id))];
        const statusMap = await getBulkFollowStatuses(user.id, authorIds);
        followStatuses = Object.fromEntries(statusMap);
      }
    } else if (tab === "events") {
      groupEvents = await getUpcomingEvents({ groupId: group.id, limit: 30 });
    } else {
      [members, pendingMembers] = await Promise.all([
        getGroupMembers(group.id),
        canManage ? getPendingMembers(group.id) : Promise.resolve([]),
      ]);
    }
  }

  const gradientClass =
    CATEGORY_COLORS[group.category] ?? "from-slate-500 to-slate-700";
  const categoryLabel = CATEGORY_LABELS[group.category] ?? group.category;

  const displayName =
    userProfile?.full_name || userProfile?.screen_name || user?.email?.split("@")[0] || "Hiker";
  const avatarInitials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
        userId={user?.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={(allPeaks || []).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          elevation: p.elevation,
        }))}
      />

      {/* Cover Image Header */}
      <div
        className={`relative h-52 sm:h-64 bg-gradient-to-br ${gradientClass} overflow-hidden`}
        style={{ marginTop: "64px" }}
      >
        {group.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.cover_image_url}
            alt={group.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 sm:left-8">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            All Groups
          </Link>
        </div>

        {/* Privacy badge */}
        <div className="absolute top-4 right-4 sm:right-8">
          {group.privacy === "private" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
              <LockIcon className="w-3 h-3" />
              Private
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-medium">
              <GlobeIcon className="w-3 h-3" />
              Public
            </span>
          )}
        </div>

        {/* Group info bottom */}
        <div className="absolute bottom-4 left-4 sm:left-8 right-4 sm:right-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
                {categoryLabel}
              </span>
              <h1
                className="text-2xl sm:text-3xl font-bold text-white leading-tight truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {group.name}
              </h1>
              {group.peaks && (
                <Link
                  href={`/peaks/${group.peaks.slug}`}
                  className="flex items-center gap-1 mt-1 text-xs text-white/70 hover:text-white transition-colors"
                >
                  <MountainIcon className="w-3.5 h-3.5" />
                  {group.peaks.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: About + Actions */}
          <aside className="lg:col-span-1 space-y-5">
            {/* Stats + Join Button */}
            <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
                    {group.member_count.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {group.member_count === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>

              <MembershipButton
                groupId={group.id}
                groupSlug={group.slug}
                groupPrivacy={group.privacy}
                isLoggedIn={!!user}
                memberStatus={memberStatus}
                memberRole={memberRole}
              />

              {memberRole === "admin" && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border-app)]">
                  <Link
                    href={`/groups/${group.slug}/settings`}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Group Settings
                  </Link>
                </div>
              )}
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mb-3">
                About
              </h2>
              {group.description ? (
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {group.description}
                </p>
              ) : (
                <p className="text-sm text-[var(--color-text-secondary)] italic">
                  No description yet.
                </p>
              )}

              <div className="mt-4 space-y-2">
                <InfoRow label="Category" value={categoryLabel} />
                <InfoRow
                  label="Privacy"
                  value={group.privacy === "private" ? "Private" : "Public"}
                />
                <InfoRow
                  label="Created"
                  value={new Date(group.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                />
              </div>
            </div>
          </aside>

          {/* Right: Feed / Members / Private gate */}
          <main className="lg:col-span-2">
            {canViewContent ? (
              <>
                {/* Tab navigation */}
                <div className="flex items-center gap-1 mb-6 border-b border-[var(--color-border-app)]">
                  <Link
                    href={`/groups/${group.slug}?tab=feed`}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                      tab === "feed"
                        ? "text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]"
                        : "text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    Feed
                  </Link>
                  <Link
                    href={`/groups/${group.slug}?tab=events`}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                      tab === "events"
                        ? "text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]"
                        : "text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    Events
                  </Link>
                  <Link
                    href={`/groups/${group.slug}?tab=members`}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                      tab === "members"
                        ? "text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]"
                        : "text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    Members
                    <span className="ml-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-1.5 py-0.5 rounded-full">
                      {group.member_count}
                    </span>
                  </Link>
                </div>

                {tab === "feed" ? (
                  <CommunityFeed
                    posts={groupPosts}
                    avatarInitials={avatarInitials}
                    isLoggedIn={!!user}
                    currentUserId={user?.id}
                    initialWatchedPeakIds={[]}
                    allPeaks={allPeaks || []}
                    followStatuses={followStatuses}
                    groupId={group.id}
                    groupSlug={group.slug}
                    canManage={canManage}
                    pinnedPostIds={pinnedPostIds}
                    showComposer={isActiveMember}
                    className="space-y-6"
                  />
                ) : tab === "events" ? (
                  <GroupEventsTab
                    events={groupEvents}
                    groupId={group.id}
                    groupName={group.name}
                    isActiveMember={isActiveMember}
                    isLoggedIn={!!user}
                    currentUserId={user?.id}
                    allPeaks={allPeaks || []}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-6">
                    <MemberList
                      members={members}
                      pendingMembers={pendingMembers}
                      currentUserRole={memberRole}
                      groupSlug={group.slug}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Private group gate for non-members */
              <div className="bg-white rounded-2xl border border-[var(--color-border-app)] p-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center">
                  <LockIcon className="w-7 h-7 text-[var(--color-text-muted-green)]" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  This group is private
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto mb-6">
                  Only members can see posts and the member list. Request to join to get access.
                </p>
                <MembershipButton
                  groupId={group.id}
                  groupSlug={group.slug}
                  groupPrivacy={group.privacy}
                  isLoggedIn={!!user}
                  memberStatus={memberStatus}
                  memberRole={memberRole}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
