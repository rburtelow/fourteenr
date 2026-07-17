"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";

let _channel: RealtimeChannel | null = null;

/** Join the global presence channel and track the current user. Idempotent. */
export function joinPresenceChannel(userId: string): RealtimeChannel {
  if (_channel) return _channel;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  _channel = supabase.channel("global-presence", {
    config: { presence: { key: userId } },
  });

  _channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await _channel!.track({ user_id: userId, online_at: new Date().toISOString() });
    }
  });

  return _channel;
}

/** Leave the global presence channel. */
export function leavePresenceChannel() {
  if (_channel) {
    _channel.unsubscribe();
    _channel = null;
  }
}
