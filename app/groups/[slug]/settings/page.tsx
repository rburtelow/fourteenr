import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getGroupBySlug,
  getGroupMembers,
  getUserMembership,
} from "@/lib/groups";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import GroupSettingsClient from "./GroupSettingsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug);
  if (!group) return { title: "Group Not Found | my14er" };
  return { title: `Settings — ${group.name} | my14er Groups` };
}

export default async function GroupSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?next=/groups/${slug}/settings`);

  const group = await getGroupBySlug(slug);
  if (!group) notFound();

  const membership = await getUserMembership(group.id, user.id);

  // Only admins can access settings
  if (membership?.role !== "admin") redirect(`/groups/${slug}`);

  const [userNavData, members, unreadNotificationCount] = await Promise.all([
    supabase
      .from("profiles")
      .select("screen_name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => ({
        email: user.email || "",
        screen_name: data?.screen_name || null,
        avatar_url: data?.avatar_url || null,
      })),
    getGroupMembers(group.id),
    getUnreadNotificationCount(user.id),
  ]);

  const { data: allPeaks } = await supabase
    .from("peaks")
    .select("id, name, slug, elevation")
    .order("name");

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNavData}
        userId={user.id}
        unreadNotificationCount={unreadNotificationCount}
        peaks={(allPeaks || []).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          elevation: p.elevation,
        }))}
      />

      {/* Page Header */}
      <div className="pt-28 pb-8 border-b border-[var(--color-border-app)] bg-white/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-3">
            <Link href="/groups" className="hover:text-[var(--color-brand-primary)] transition-colors">
              Groups
            </Link>
            <span>/</span>
            <Link href={`/groups/${group.slug}`} className="hover:text-[var(--color-brand-primary)] transition-colors">
              {group.name}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text-primary)]">Settings</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-bold text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Group Settings
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Manage <span className="font-medium text-[var(--color-text-primary)]">{group.name}</span>
              </p>
            </div>
            <Link
              href={`/groups/${group.slug}`}
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              ← Back to Group
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <div className="bg-white rounded-2xl border border-[var(--color-border-app)] px-6 sm:px-8 py-8">
          <GroupSettingsClient
            group={group}
            members={members}
            currentUserId={user.id}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
