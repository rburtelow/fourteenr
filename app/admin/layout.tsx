import { type ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin";
import Pill from "./components/Pill";

const NAV_ITEMS = [
  { href: "/admin/overview",            label: "Overview",    minRole: "support"     },
  { href: "/admin/users",               label: "Users",       minRole: "support"     },
  { href: "/admin/moderation",          label: "Moderation",  minRole: "moderator"   },
  { href: "/admin/content",             label: "Content",     minRole: "support"     },
  { href: "/admin/events",              label: "Events",      minRole: "moderator"   },
  { href: "/admin/groups",              label: "Groups",      minRole: "moderator"   },
  { href: "/admin/analytics",           label: "Analytics",   minRole: "support"     },
  { href: "/admin/operations",          label: "Operations",  minRole: "super_admin" },
] as const;

type AdminRole = "super_admin" | "moderator" | "support";
const RANK: Record<AdminRole, number> = { support: 1, moderator: 2, super_admin: 3 };

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  moderator: "Moderator",
  support: "Support",
};

const ROLE_PILL: Record<AdminRole, "purple" | "blue" | "green"> = {
  super_admin: "purple",
  moderator: "blue",
  support: "green",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, role } = await requireAdmin();
  const visibleNav = NAV_ITEMS.filter(
    (item) => RANK[role as AdminRole] >= RANK[item.minRole as AdminRole]
  );

  return (
    <div className="min-h-screen bg-[var(--color-page)] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 left-0 bg-white border-r border-[var(--color-border-app)] z-40">
        <div className="px-5 py-5 border-b border-[var(--color-border-app)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[var(--color-brand-primary)] rounded-lg flex items-center justify-center">
              <MountainIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold text-[var(--color-brand-primary)]">My14er</span>
          </Link>
          <p className="text-[10px] font-semibold text-[var(--color-text-muted-green)] tracking-wider uppercase mt-1 ml-0.5">
            Admin
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => (
            <SidebarLink key={item.href} href={item.href}>
              {item.label}
            </SidebarLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-[var(--color-border-app)]">
          <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
            {(user.user_metadata?.screen_name as string | undefined) ?? user.email}
          </p>
          <Pill variant={ROLE_PILL[role as AdminRole]} className="mt-1">
            {ROLE_LABELS[role as AdminRole]}
          </Pill>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[var(--color-border-app)] px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
            Admin Dashboard
          </span>
          <Link
            href="/"
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            ← Back to site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-brand-primary)] transition-colors"
    >
      {children}
    </Link>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 22h20L12 2zm0 5.5L17.5 19h-11L12 7.5z" />
    </svg>
  );
}
