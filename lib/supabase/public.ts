import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

// Unauthenticated client for use inside unstable_cache — cookies are not
// available in that context, but public (anon-key) reads work fine.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
