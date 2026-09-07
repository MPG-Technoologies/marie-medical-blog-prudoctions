"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  adminNavItems,
  resolveAdminRouteState,
  type AdminModuleId,
} from "@/lib/admin/navigation";

export {
  adminNavItems,
  resolveAdminRouteState,
  type AdminModuleId,
  type AdminNavItem,
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
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = effectiveActive === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
              isActive
                ? "bg-[#E8E2D7] font-semibold text-[#7B3F35]"
                : "text-[#5E5953] hover:bg-[#E8E2D7]/50 hover:text-[#242321]",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-[#7B3F35]" : "text-[#5E5953]",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
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
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = initialActiveModule === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
              isActive
                ? "bg-[#E8E2D7] font-semibold text-[#7B3F35]"
                : "text-[#5E5953] hover:bg-[#E8E2D7]/50 hover:text-[#242321]",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-[#7B3F35]" : "text-[#5E5953]",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
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
    <h1 className="font-serif text-xl font-medium tracking-tight text-[#242321] sm:text-2xl">
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
        <h1 className="font-serif text-xl font-medium tracking-tight text-[#242321] sm:text-2xl">
          {initialTitle}
        </h1>
      }
    >
      <AdminHeaderTitleContent initialTitle={initialTitle} />
    </React.Suspense>
  );
}
