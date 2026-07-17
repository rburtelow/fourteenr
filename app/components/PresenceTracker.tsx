"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function PresenceTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const ch = supabase.channel("global-presence", {
      config: { presence: { key: userId } },
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await ch.track({ user_id: userId, online_at: new Date().toISOString() });
      }
    });

    return () => {
      ch.unsubscribe();
    };
  }, [userId]);

  return null;
}
