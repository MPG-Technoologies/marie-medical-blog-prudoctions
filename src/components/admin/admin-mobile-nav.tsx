"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { logoutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";
import {
  adminNavItems,
  resolveAdminRouteState,
  type AdminModuleId,
} from "@/components/admin/admin-nav";

interface AdminMobileNavProps {
  initialActiveModule?: AdminModuleId | string;
}

function AdminMobileNavContent({ initialActiveModule }: AdminMobileNavProps) {
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
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-[#D2C9BC] bg-card text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none md:hidden"
            aria-label="Open admin navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col justify-between">
        <div>
          <SheetHeader>
            <SheetTitle className="font-serif text-lg">Workspace</SheetTitle>
            <p className="text-xs tracking-wider text-[#5E5953] uppercase">
              Marie Medere
            </p>
          </SheetHeader>

          <nav
            aria-label="Admin Mobile Navigation"
            className="mt-6 flex flex-col space-y-1"
          >
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveActive === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
                    isActive
                      ? "bg-[#E8E2D7] font-semibold text-[#7B3F35]"
                      : "text-[#5E5953] hover:bg-[#E8E2D7]/60 hover:text-[#242321]",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-[#7B3F35]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-[#D2C9BC] bg-card text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none md:hidden"
            aria-label="Open admin navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col justify-between">
        <div>
          <SheetHeader>
            <SheetTitle className="font-serif text-lg">Workspace</SheetTitle>
            <p className="text-xs tracking-wider text-[#5E5953] uppercase">
              Marie Medere
            </p>
          </SheetHeader>

          <nav
            aria-label="Admin Mobile Navigation"
            className="mt-6 flex flex-col space-y-1"
          >
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = initialActiveModule === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
                    isActive
                      ? "bg-[#E8E2D7] font-semibold text-[#7B3F35]"
                      : "text-[#5E5953] hover:bg-[#E8E2D7]/60 hover:text-[#242321]",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-[#7B3F35]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
