import "server-only";
import { createClient as createSb } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getServerUser } from "./server";
import type { Database } from "../database.types";

export function createAdminClient() {
  return createSb<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

type AdminRole = "super_admin" | "moderator" | "support";

const ROLE_RANK: Record<AdminRole, number> = { support: 1, moderator: 2, super_admin: 3 };

export async function requireRole(min: AdminRole = "support") {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?redirectTo=/admin");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data } = await admin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single() as { data: { role: AdminRole } | null };
  const role = data?.role;
  if (!role || ROLE_RANK[role] < ROLE_RANK[min]) redirect("/");
  return { user, role };
}

export const requireAdmin = () => requireRole("support");
