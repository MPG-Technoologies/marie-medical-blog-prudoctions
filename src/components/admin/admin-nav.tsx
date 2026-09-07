"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  adminNavGroups,
  resolveAdminRouteState,
  type AdminModuleId,
} from "@/lib/admin/navigation";

export {
  adminNavGroups,
  adminNavItems,
  resolveAdminRouteState,
  type AdminModuleId,
  type AdminNavItem,
  type AdminNavGroup,
} from "@/lib/admin/navigation";

interface AdminNavProps {
  initialActiveModule?: AdminModuleId;
}

function AdminNavContent({ initialActiveModule }: AdminNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { activeModule } = resolveAdminRouteState(pathname || "", searchParams);

  const effectiveActive = activeModule || initialActiveModule || "dashboard";

  return (
    <nav
      aria-label="Admin Navigation"
      className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
    >
      {adminNavGroups.map((group) => (
        <div key={group.label} className="not-first:mt-5">
          <p className="px-3 pb-1.5 text-[0.625rem] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveActive === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none",
                    isActive
                      ? "bg-subtle-field font-semibold text-oxide"
                      : "text-ink-muted hover:bg-subtle-field/50 hover:text-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AdminNavFallback({
  initialActiveModule = "dashboard",
}: AdminNavProps) {
  return (
    <nav
      aria-label="Admin Navigation"
      className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
    >
      {adminNavGroups.map((group) => (
        <div key={group.label} className="not-first:mt-5">
          <p className="px-3 pb-1.5 text-[0.625rem] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = initialActiveModule === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none",
                    isActive
                      ? "bg-subtle-field font-semibold text-oxide"
                      : "text-ink-muted hover:bg-subtle-field/50 hover:text-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminNav({ initialActiveModule }: AdminNavProps) {
  return (
    <React.Suspense
      fallback={<AdminNavFallback initialActiveModule={initialActiveModule} />}
    >
      <AdminNavContent initialActiveModule={initialActiveModule} />
    </React.Suspense>
  );
}

interface AdminHeaderTitleProps {
  initialTitle?: string;
}

function AdminHeaderTitleContent({ initialTitle }: AdminHeaderTitleProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { title } = resolveAdminRouteState(pathname || "", searchParams);

  return (
    <h1 className="font-serif text-xl font-medium tracking-tight text-foreground sm:text-2xl">
      {title || initialTitle || "Dashboard"}
    </h1>
  );
}

export function AdminHeaderTitle({
  initialTitle = "Dashboard",
}: AdminHeaderTitleProps) {
  return (
    <React.Suspense
      fallback={
        <h1 className="font-serif text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          {initialTitle}
        </h1>
      }
    >
      <AdminHeaderTitleContent initialTitle={initialTitle} />
    </React.Suspense>
  );
}
