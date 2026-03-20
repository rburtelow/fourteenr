"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SectionVisibility } from "@/lib/privacy";

export async function updatePrivacySettings(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const isPrivate = formData.get("is_private") === "true";

  const toVis = (key: string): SectionVisibility => {
    const val = formData.get(key);
    if (val === "followers" || val === "nobody") return val;
    return "everyone";
  };

  const privacySettings = {
    show_stats: toVis("show_stats"),
    show_summit_history: toVis("show_summit_history"),
    show_badges: toVis("show_badges"),
    show_groups: toVis("show_groups"),
    show_trip_reports: toVis("show_trip_reports"),
    show_events: toVis("show_events"),
  };

  const { error } = await supabase
    .from("profiles")
    .update({ is_private: isPrivate, privacy_settings: privacySettings })
    .eq("id", user.id);

  if (error) return { error: "Failed to save settings. Please try again." };

  revalidatePath("/profile/settings");
  return { success: true };
}

export async function updateAvatarUrl(avatarUrl: string | null): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}
