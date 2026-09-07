import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import {
  AdminNav,
  AdminHeaderTitle,
  type AdminModuleId,
} from "@/components/admin/admin-nav";
import { logoutAction } from "@/app/admin/login/actions";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  activeModule?: AdminModuleId;
  actions?: React.ReactNode;
}

export function AdminShell({
  children,
  title = "Dashboard",
  activeModule = "dashboard",
  actions,
}: AdminShellProps) {
  return (
    <div className="admin-workspace flex min-h-screen bg-parchment font-sans text-foreground">
      <a
        href="#admin-main-content"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-lg transition-transform duration-[var(--admin-motion-fast)] focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:ring-offset-parchment motion-reduce:transition-none"
      >
        Skip to admin content
      </a>

      {/* Desktop Sidebar */}
      <aside
        aria-label="Admin Sidebar"
        className="hidden border-r border-subtle-divider bg-paper xl:fixed xl:inset-y-0 xl:flex xl:w-64 xl:flex-col"
      >
        {/* Brand identity */}
        <div className="flex h-16 items-center justify-between border-b border-[#D2C9BC] px-6">
          <Link
            href="/admin"
            className="flex flex-col rounded-xs focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
          >
            <span className="font-serif text-lg font-medium text-[#242321]">
              Marie Medere
            </span>
            <span className="text-[0.625rem] font-semibold tracking-widest text-[#7B3F35] uppercase">
              Workspace
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View live site"
            className="rounded-xs p-1 text-[#5E5953] transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
          >
            <ArrowUpRight className="size-4" />
            <span className="sr-only">View live publication</span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <AdminNav initialActiveModule={activeModule} />

        {/* User profile footer */}
        <div className="flex items-center justify-between border-t border-[#D2C9BC] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full border border-[#D2C9BC] bg-[#E8E2D7] font-serif text-sm font-medium text-[#7B3F35]">
              M
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-semibold text-[#242321]">
                Marie Medere
              </span>
              <span className="text-[0.625rem] tracking-wider text-[#5E5953] uppercase">
                Writer / Admin
              </span>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="cursor-pointer rounded-xs p-1.5 text-[#5E5953] transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main workspace container */}
      <div className="flex min-w-0 flex-1 flex-col xl:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#D2C9BC] bg-[#F6F1E8]/90 px-5 backdrop-blur-xs sm:px-8">
          <div className="flex items-center gap-3">
            <AdminMobileNav initialActiveModule={activeModule} />
            <AdminHeaderTitle initialTitle={title} />
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Workspace Canvas */}
        <main
          id="admin-main-content"
          tabIndex={-1}
          className="w-full max-w-[1248px] min-w-0 flex-1 p-5 focus:outline-none sm:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
