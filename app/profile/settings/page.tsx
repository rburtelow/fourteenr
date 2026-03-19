import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/notifications";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PrivacySettingsClient from "./PrivacySettingsClient";
import { DEFAULT_PRIVACY } from "@/lib/privacy";
import type { PrivacySettings } from "@/lib/privacy";

export const metadata = {
  title: "Privacy Settings | my14er",
};

export default async function PrivacySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/profile/settings");

  const [{ data: profile }, unreadNotificationCount, { data: allPeaks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("screen_name, avatar_url, is_private, privacy_settings")
      .eq("id", user.id)
      .single(),
    getUnreadNotificationCount(user.id),
    supabase.from("peaks").select("id, name, slug, elevation").order("name"),
  ]);

  const userNav = {
    email: user.email || "",
    screen_name: profile?.screen_name || null,
    avatar_url: profile?.avatar_url || null,
  };

  const isPrivate = profile?.is_private ?? false;
  const privacySettings: PrivacySettings = {
    ...DEFAULT_PRIVACY,
    ...(profile?.privacy_settings as Partial<PrivacySettings> | null ?? {}),
  };

  return (
    <div className="min-h-screen bg-[var(--color-page)] antialiased">
      <Navbar
        user={userNav}
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
            <Link href="/profile" className="hover:text-[var(--color-brand-primary)] transition-colors">
              Profile
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text-primary)]">Privacy Settings</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-bold text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Privacy Settings
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Control who can see your profile and activity
              </p>
            </div>
            <Link
              href="/profile"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <div className="bg-white rounded-2xl border border-[var(--color-border-app)] px-6 sm:px-8 py-8">
          <PrivacySettingsClient isPrivate={isPrivate} privacySettings={privacySettings} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
