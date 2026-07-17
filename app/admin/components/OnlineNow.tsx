"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";

export default function OnlineNow({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let ch: RealtimeChannel;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      ch = supabase.channel("global-presence", {
        config: { presence: { key: user.id } },
      });

      const sync = () => {
        const state = ch.presenceState();
        setCount(Object.keys(state).length);
      };

      ch.on("presence", { event: "sync" }, sync)
        .on("presence", { event: "join" }, sync)
        .on("presence", { event: "leave" }, sync)
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await ch.track({ user_id: user.id, online_at: new Date().toISOString() });
            sync();
          }
        });
    });

    return () => {
      ch?.unsubscribe();
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      <span className="text-sm font-semibold text-emerald-700">
        {count} online now
      </span>
    </div>
  );
}
