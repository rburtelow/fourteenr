"use server";

import { createClient } from "@/lib/supabase/server";

export async function quickMarkPeaks(
  entries: { peakId: string; summitDate: string }[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to mark peaks." };
  }

  if (!entries.length) {
    return { error: "No peaks selected." };
  }

  // Validate entries
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  for (const entry of entries) {
    if (!entry.peakId || !entry.summitDate) {
      return { error: "Each entry must have a peak and date." };
    }
    const date = new Date(entry.summitDate + "T00:00:00");
    if (isNaN(date.getTime())) {
      return { error: `Invalid date: ${entry.summitDate}` };
    }
    if (date > today) {
      return { error: "Summit dates cannot be in the future." };
    }
  }

  // Bulk upsert into summit_logs
  const rows = entries.map((e) => ({
    user_id: user.id,
    peak_id: e.peakId,
    summit_date: e.summitDate,
  }));

  const { error } = await supabase
    .from("summit_logs")
    .upsert(rows, { onConflict: "user_id,peak_id,summit_date" });

  if (error) {
    console.error("Quick mark error:", error);
    return { error: "Failed to save. Please try again." };
  }

  return { success: true, count: entries.length };
}
