import { requireRole } from "@/lib/supabase/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";

interface AuditRow {
  id: number;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
}

export default async function AuditLogPage() {
  await requireRole("support");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: entries } = await admin
    .from("admin_audit_log")
    .select("id, actor_id, action, target_type, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100) as { data: AuditRow[] | null };

  const rows = (entries ?? []).map((e) => ({
    id: e.id,
    action: e.action,
    target: e.target_type ? `${e.target_type}:${e.target_id}` : "—",
    actor: e.actor_id.slice(0, 8) + "…",
    when: new Date(e.created_at).toLocaleString(),
  }));

  const columns = [
    { key: "when",   label: "Time"   },
    { key: "action", label: "Action" },
    { key: "target", label: "Target" },
    { key: "actor",  label: "Actor"  },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" description="Every privileged admin action, newest first." />
      <Table columns={columns} rows={rows} emptyMessage="No audit entries yet." />
    </div>
  );
}
