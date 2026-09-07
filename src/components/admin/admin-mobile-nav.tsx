"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, ArrowUpRight, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  adminNavGroups,
  resolveAdminRouteState,
  type AdminModuleId,
} from "@/lib/admin/navigation";
import { logoutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

interface AdminMobileNavProps {
  initialActiveModule?: AdminModuleId;
}

function AdminMobileNavContent({
  initialActiveModule = "dashboard",
}: AdminMobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { activeModule } = resolveAdminRouteState(pathname || "", searchParams);
  const effectiveActive = activeModule || initialActiveModule || "dashboard";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open admin navigation menu"
            className="inline-flex size-11 items-center justify-center rounded-xs text-[#5E5953] transition-colors duration-[var(--admin-motion-fast)] hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none xl:hidden"
          >
            <Menu className="size-6" />
          </button>
        }
      />

      <SheetContent
        side="left"
        className="flex w-72 flex-col justify-between border-r border-subtle-divider bg-paper p-6"
      >
        <div className="space-y-6">
          <SheetHeader className="border-b border-[#D2C9BC] pb-4 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-lg font-medium text-[#242321]">
                Marie Medere
              </SheetTitle>
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
            <p className="text-[0.625rem] font-semibold tracking-widest text-[#7B3F35] uppercase">
              Workspace
            </p>
          </SheetHeader>

          {/* Navigation links */}
          <nav aria-label="Admin Navigation" className="space-y-4">
            {adminNavGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 pb-1 text-[0.625rem] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = effectiveActive === item.id;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none",
                        isActive
                          ? "bg-subtle-field font-semibold text-oxide"
                          : "text-ink-muted hover:bg-subtle-field/60 hover:text-ink",
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-oxide" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-[#D2C9BC] pt-4 text-xs text-[#5E5953]">
          <div>
            <p className="font-semibold text-[#242321]">Marie Medere</p>
            <p>Writer / Admin</p>
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
      </SheetContent>
    </Sheet>
  );
}

function AdminMobileNavFallback({
  initialActiveModule = "dashboard",
}: AdminMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open admin navigation menu"
            className="inline-flex size-11 items-center justify-center rounded-xs text-[#5E5953] transition-colors duration-[var(--admin-motion-fast)] hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none xl:hidden"
          >
            <Menu className="size-6" />
          </button>
        }
      />

      <SheetContent
        side="left"
        className="flex w-72 flex-col justify-between border-r border-subtle-divider bg-paper p-6"
      >
        <div className="space-y-6">
          <SheetHeader className="border-b border-[#D2C9BC] pb-4 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-lg font-medium text-[#242321]">
                Marie Medere
              </SheetTitle>
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
            <p className="text-[0.625rem] font-semibold tracking-widest text-[#7B3F35] uppercase">
              Workspace
            </p>
          </SheetHeader>

          {/* Navigation links */}
          <nav aria-label="Admin Navigation" className="space-y-4">
            {adminNavGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 pb-1 text-[0.625rem] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = initialActiveModule === item.id;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none",
                        isActive
                          ? "bg-subtle-field font-semibold text-oxide"
                          : "text-ink-muted hover:bg-subtle-field/60 hover:text-ink",
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-oxide" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-[#D2C9BC] pt-4 text-xs text-[#5E5953]">
          <div>
            <p className="font-semibold text-[#242321]">Marie Medere</p>
            <p>Writer / Admin</p>
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
      </SheetContent>
    </Sheet>
  );
}

export function AdminMobileNav({ initialActiveModule }: AdminMobileNavProps) {
  return (
    <React.Suspense
      fallback={
        <AdminMobileNavFallback initialActiveModule={initialActiveModule} />
      }
    >
      <AdminMobileNavContent initialActiveModule={initialActiveModule} />
    </React.Suspense>
  );
}
