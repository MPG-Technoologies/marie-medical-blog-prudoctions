"use client";

import * as React from "react";
import { LayoutTemplate, SlidersHorizontal } from "lucide-react";

import type { AdminSiteMediaPlacement } from "@/lib/admin/site-media";
import type {
  HeroMediaSlot,
  SiteMediaSlot,
} from "@/lib/admin/site-media-validation";
import { cn } from "@/lib/utils";
import { SiteMediaPlacements } from "./site-media-placements";
import { HeroSectionEditor } from "./hero-section-editor";

interface Props {
  initialPlacements: AdminSiteMediaPlacement[];
}

type WorkspaceTab = "public-images" | "hero-editor";

export function SiteMediaWorkspace({ initialPlacements }: Props) {
  const [activeTab, setActiveTab] =
    React.useState<WorkspaceTab>("public-images");
  const [placements, setPlacements] =
    React.useState<AdminSiteMediaPlacement[]>(initialPlacements);
  const [targetSlot, setTargetSlot] = React.useState<SiteMediaSlot | null>(
    null,
  );

  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handlePlacementChange = React.useCallback(
    (updatedPlacement: AdminSiteMediaPlacement) => {
      setPlacements((current) =>
        current.map((item) =>
          item.slot === updatedPlacement.slot ? updatedPlacement : item,
        ),
      );
    },
    [],
  );

  function handleSwitchToPicker(slot?: HeroMediaSlot) {
    if (slot) {
      setTargetSlot(slot);
    }
    setActiveTab("public-images");
  }

  function handleTabKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const tabsCount = 2;
    let nextIndex = -1;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabsCount;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabsCount) % tabsCount;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabsCount - 1;
    }

    if (nextIndex >= 0) {
      e.preventDefault();
      tabsRef.current[nextIndex]?.focus();
      if (nextIndex === 0) {
        setActiveTab("public-images");
      } else {
        setActiveTab("hero-editor");
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="border-b border-subtle-divider">
        <div
          role="tablist"
          aria-label="Website media management"
          className="flex items-center gap-2"
        >
          <button
            ref={(el) => {
              tabsRef.current[0] = el;
            }}
            id="tab-public-images"
            type="button"
            role="tab"
            aria-selected={activeTab === "public-images"}
            aria-controls="panel-public-images"
            tabIndex={activeTab === "public-images" ? 0 : -1}
            onClick={() => setActiveTab("public-images")}
            onKeyDown={(e) => handleTabKeyDown(e, 0)}
            className={cn(
              "flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
              activeTab === "public-images"
                ? "border-oxide text-ink"
                : "border-transparent text-ink-muted hover:border-subtle-divider hover:text-ink",
            )}
          >
            <LayoutTemplate className="size-4" />
            Public Image Editor
          </button>

          <button
            ref={(el) => {
              tabsRef.current[1] = el;
            }}
            id="tab-hero-editor"
            type="button"
            role="tab"
            aria-selected={activeTab === "hero-editor"}
            aria-controls="panel-hero-editor"
            tabIndex={activeTab === "hero-editor" ? 0 : -1}
            onClick={() => setActiveTab("hero-editor")}
            onKeyDown={(e) => handleTabKeyDown(e, 1)}
            className={cn(
              "flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
              activeTab === "hero-editor"
                ? "border-oxide text-ink"
                : "border-transparent text-ink-muted hover:border-subtle-divider hover:text-ink",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Hero Section Editor
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div
        id="panel-public-images"
        role="tabpanel"
        aria-labelledby="tab-public-images"
        hidden={activeTab !== "public-images"}
      >
        <SiteMediaPlacements
          placements={placements}
          onPlacementChange={handlePlacementChange}
          targetSlot={targetSlot}
        />
      </div>

      <div
        id="panel-hero-editor"
        role="tabpanel"
        aria-labelledby="tab-hero-editor"
        hidden={activeTab !== "hero-editor"}
      >
        <HeroSectionEditor
          placements={placements}
          onPlacementChange={handlePlacementChange}
          onSwitchToImageEditor={handleSwitchToPicker}
        />
      </div>
    </div>
  );
}
