import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitRuleProps extends React.HTMLAttributes<HTMLDivElement> {
  oxideWidthClass?: string;
  decorative?: boolean;
  reveal?: boolean;
}

export function SplitRule({
  oxideWidthClass = "w-8 sm:w-12",
  decorative = true,
  reveal = false,
  className,
  ...props
}: SplitRuleProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      className={cn("flex w-full items-center", className)}
      {...props}
    >
      <div
        className={cn(
          "h-[2px] shrink-0 bg-[#7B3F35]",
          oxideWidthClass,
          reveal &&
            "origin-left transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        )}
      />
      <div
        className={cn(
          "h-[1px] w-full bg-[#D2C9BC]",
          reveal &&
            "origin-left transition-opacity duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        )}
      />
    </div>
  );
}
