"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
}

interface SiteNavLinksProps {
  links: NavLink[];
}

export function SiteNavLinks({ links }: SiteNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main Navigation"
      className="ml-auto hidden items-center gap-[clamp(1.25rem,2.2vw,2.75rem)] lg:flex"
    >
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative rounded-xs py-1 font-sans text-sm font-medium transition-colors duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
              isActive
                ? "text-[#242321]"
                : "text-[#5E5953] hover:text-[#242321]",
            )}
          >
            <span>{link.label}</span>
            <span
              aria-hidden="true"
              className={cn(
                "absolute right-0 bottom-0 left-0 h-[1.5px] origin-left bg-[#7B3F35] transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                isActive
                  ? "scale-x-100 opacity-100"
                  : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-85",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
