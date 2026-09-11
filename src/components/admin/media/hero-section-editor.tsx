"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  Crosshair,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Move,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { updateSiteMediaPresentationAction } from "@/app/admin/media/site-actions";
import {
  HERO_MEDIA_SLOTS,
  SITE_MEDIA_SLOT_META,
  type HeroMediaSlot,
} from "@/lib/admin/site-media-validation";
import type { AdminSiteMediaPlacement } from "@/lib/admin/site-media";
import type { PublicSiteMediaPlacement } from "@/lib/public-site-media";
import { HeroMediaPresentation } from "@/components/public/hero-media-presentation";
import { cn } from "@/lib/utils";

interface Props {
  placements: AdminSiteMediaPlacement[];
  onPlacementChange: (placement: AdminSiteMediaPlacement) => void;
  onSwitchToImageEditor: (slot?: HeroMediaSlot) => void;
}

type Viewport = "desktop" | "tablet" | "mobile";
type EditMode = "subject" | "feather";

const FOCAL_PRESETS = [
  { label: "Top Left", x: 20, y: 20 },
  { label: "Top", x: 50, y: 20 },
  { label: "Top Right", x: 80, y: 20 },
  { label: "Left", x: 20, y: 50 },
  { label: "Center", x: 50, y: 50 },
  { label: "Right", x: 80, y: 50 },
  { label: "Bottom Left", x: 20, y: 80 },
  { label: "Bottom", x: 50, y: 80 },
  { label: "Bottom Right", x: 80, y: 80 },
] as const;

export function HeroSectionEditor({
  placements,
  onPlacementChange,
  onSwitchToImageEditor,
}: Props) {
  const [activeSlot, setActiveSlot] =
    React.useState<HeroMediaSlot>("home_hero");

  const placement = React.useMemo(() => {
    return placements.find((p) => p.slot === activeSlot) ?? null;
  }, [placements, activeSlot]);

  return (
    <div className="space-y-6">
      {/* Hero Slot Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle-divider pb-4">
        <nav
          aria-label="Select hero section"
          className="flex flex-wrap items-center gap-2"
        >
          {HERO_MEDIA_SLOTS.map((slot) => {
            const isSelected = activeSlot === slot;
            const meta = SITE_MEDIA_SLOT_META[slot];
            const hasAssignedImage = placements.some(
              (p) => p.slot === slot && p.storagePath,
            );

            return (
              <button
                key={slot}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveSlot(slot)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                  isSelected
                    ? "bg-subtle-field font-bold text-oxide shadow-2xs"
                    : "border border-subtle-divider bg-paper text-ink-muted hover:bg-subtle-field/50 hover:text-ink",
                )}
              >
                <span>{meta.label}</span>
                {hasAssignedImage ? (
                  <span
                    className="size-1.5 rounded-full bg-emerald-600"
                    title="Image assigned"
                  />
                ) : (
                  <span
                    className="size-1.5 rounded-full bg-amber-500"
                    title="No image assigned"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <HeroSlotEditorInner
        key={`${activeSlot}-${placement?.storagePath}`}
        activeSlot={activeSlot}
        placement={placement}
        onPlacementChange={onPlacementChange}
        onSwitchToImageEditor={onSwitchToImageEditor}
      />
    </div>
  );
}

function HeroSlotEditorInner({
  activeSlot,
  placement,
  onPlacementChange,
  onSwitchToImageEditor,
}: {
  activeSlot: HeroMediaSlot;
  placement: AdminSiteMediaPlacement | null;
  onPlacementChange: (placement: AdminSiteMediaPlacement) => void;
  onSwitchToImageEditor: (slot?: HeroMediaSlot) => void;
}) {
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [mode, setMode] = React.useState<EditMode>("subject");
  const [showSafeArea, setShowSafeArea] = React.useState(true);

  // Working presentation state initialized directly from placement prop
  const [desktopFocalX, setDesktopFocalX] = React.useState(
    placement?.desktopFocalX ?? 50,
  );
  const [desktopFocalY, setDesktopFocalY] = React.useState(
    placement?.desktopFocalY ?? 50,
  );
  const [mobileFocalX, setMobileFocalX] = React.useState(
    placement?.mobileFocalX ?? 50,
  );
  const [mobileFocalY, setMobileFocalY] = React.useState(
    placement?.mobileFocalY ?? 50,
  );

  const [desktopZoom, setDesktopZoom] = React.useState(
    placement?.desktopZoom ?? 100,
  );
  const [mobileZoom, setMobileZoom] = React.useState(
    placement?.mobileZoom ?? 100,
  );

  const [desktopFeatherStart, setDesktopFeatherStart] = React.useState(
    placement?.desktopFeatherStart ?? 0,
  );
  const [desktopFeatherWidth, setDesktopFeatherWidth] = React.useState(
    placement?.desktopFeatherWidth ?? 100,
  );
  const [desktopFeatherStrength, setDesktopFeatherStrength] = React.useState(
    placement?.desktopFeatherStrength ?? 0,
  );

  const [mobileFeatherStart, setMobileFeatherStart] = React.useState(
    placement?.mobileFeatherStart ?? 0,
  );
  const [mobileFeatherWidth, setMobileFeatherWidth] = React.useState(
    placement?.mobileFeatherWidth ?? 100,
  );
  const [mobileFeatherStrength, setMobileFeatherStrength] = React.useState(
    placement?.mobileFeatherStrength ?? 0,
  );

  const [saving, setSaving] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const lastPersistedRef = React.useRef(placement);

  React.useEffect(() => {
    if (placement && placement !== lastPersistedRef.current) {
      const prev = lastPersistedRef.current;
      lastPersistedRef.current = placement;

      const hasExternalChanges =
        !prev ||
        placement.desktopFocalX !== prev.desktopFocalX ||
        placement.desktopFocalY !== prev.desktopFocalY ||
        placement.mobileFocalX !== prev.mobileFocalX ||
        placement.mobileFocalY !== prev.mobileFocalY ||
        placement.desktopZoom !== prev.desktopZoom ||
        placement.mobileZoom !== prev.mobileZoom ||
        placement.desktopFeatherStart !== prev.desktopFeatherStart ||
        placement.desktopFeatherWidth !== prev.desktopFeatherWidth ||
        placement.desktopFeatherStrength !== prev.desktopFeatherStrength ||
        placement.mobileFeatherStart !== prev.mobileFeatherStart ||
        placement.mobileFeatherWidth !== prev.mobileFeatherWidth ||
        placement.mobileFeatherStrength !== prev.mobileFeatherStrength;

      if (hasExternalChanges) {
        setDesktopFocalX(placement.desktopFocalX);
        setDesktopFocalY(placement.desktopFocalY);
        setMobileFocalX(placement.mobileFocalX);
        setMobileFocalY(placement.mobileFocalY);
        setDesktopZoom(placement.desktopZoom ?? 100);
        setMobileZoom(placement.mobileZoom ?? 100);
        setDesktopFeatherStart(placement.desktopFeatherStart ?? 0);
        setDesktopFeatherWidth(placement.desktopFeatherWidth ?? 100);
        setDesktopFeatherStrength(placement.desktopFeatherStrength ?? 0);
        setMobileFeatherStart(placement.mobileFeatherStart ?? 0);
        setMobileFeatherWidth(placement.mobileFeatherWidth ?? 100);
        setMobileFeatherStrength(placement.mobileFeatherStrength ?? 0);
      }
    }
  }, [placement]);

  // Check if current values differ from saved placement
  const isDirty = React.useMemo(() => {
    if (!placement) return false;
    return (
      desktopFocalX !== placement.desktopFocalX ||
      desktopFocalY !== placement.desktopFocalY ||
      mobileFocalX !== placement.mobileFocalX ||
      mobileFocalY !== placement.mobileFocalY ||
      desktopZoom !== (placement.desktopZoom ?? 100) ||
      mobileZoom !== (placement.mobileZoom ?? 100) ||
      desktopFeatherStart !== (placement.desktopFeatherStart ?? 0) ||
      desktopFeatherWidth !== (placement.desktopFeatherWidth ?? 100) ||
      desktopFeatherStrength !== (placement.desktopFeatherStrength ?? 0) ||
      mobileFeatherStart !== (placement.mobileFeatherStart ?? 0) ||
      mobileFeatherWidth !== (placement.mobileFeatherWidth ?? 100) ||
      mobileFeatherStrength !== (placement.mobileFeatherStrength ?? 0)
    );
  }, [
    placement,
    desktopFocalX,
    desktopFocalY,
    mobileFocalX,
    mobileFocalY,
    desktopZoom,
    mobileZoom,
    desktopFeatherStart,
    desktopFeatherWidth,
    desktopFeatherStrength,
    mobileFeatherStart,
    mobileFeatherWidth,
    mobileFeatherStrength,
  ]);

  // Current active viewport focal and zoom targets
  const isMobile = viewport === "mobile";
  const activeFocalX = isMobile ? mobileFocalX : desktopFocalX;
  const activeFocalY = isMobile ? mobileFocalY : desktopFocalY;
  const setActiveFocal = React.useCallback(
    (x: number, y: number) => {
      const clampedX = Math.max(0, Math.min(100, Math.round(x)));
      const clampedY = Math.max(0, Math.min(100, Math.round(y)));
      if (isMobile) {
        setMobileFocalX(clampedX);
        setMobileFocalY(clampedY);
      } else {
        setDesktopFocalX(clampedX);
        setDesktopFocalY(clampedY);
      }
    },
    [isMobile],
  );

  const activeZoom = isMobile ? mobileZoom : desktopZoom;
  const setActiveZoom = React.useCallback(
    (val: number) => {
      const clamped = Math.max(100, Math.min(180, Math.round(val)));
      if (isMobile) {
        setMobileZoom(clamped);
      } else {
        setDesktopZoom(clamped);
      }
    },
    [isMobile],
  );

  const activeFeatherStart = isMobile
    ? mobileFeatherStart
    : desktopFeatherStart;
  const setActiveFeatherStart = React.useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(val)));
      if (isMobile) setMobileFeatherStart(clamped);
      else setDesktopFeatherStart(clamped);
    },
    [isMobile],
  );

  const activeFeatherWidth = isMobile
    ? mobileFeatherWidth
    : desktopFeatherWidth;
  const setActiveFeatherWidth = React.useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(val)));
      if (isMobile) setMobileFeatherWidth(clamped);
      else setDesktopFeatherWidth(clamped);
    },
    [isMobile],
  );

  const activeFeatherStrength = isMobile
    ? mobileFeatherStrength
    : desktopFeatherStrength;
  const setActiveFeatherStrength = React.useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(val)));
      if (isMobile) setMobileFeatherStrength(clamped);
      else setDesktopFeatherStrength(clamped);
    },
    [isMobile],
  );

  // Drag-to-position on preview container
  const [isDragging, setIsDragging] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mode !== "subject") return;
    if (!previewRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFocalFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || mode !== "subject") return;
    updateFocalFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored if pointer was already lost
      }
    }
  };

  const updateFocalFromPointer = (clientX: number, clientY: number) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const xPercent = ((clientX - rect.left) / rect.width) * 100;
    const yPercent = ((clientY - rect.top) / rect.height) * 100;
    setActiveFocal(xPercent, yPercent);
  };

  // Keyboard focal adjustments
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (mode !== "subject") return;
    const step = e.shiftKey ? 5 : 1;
    let dx = 0;
    let dy = 0;

    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else return;

    e.preventDefault();
    setActiveFocal(activeFocalX + dx, activeFocalY + dy);
  };

  // Resets
  const handleResetPosition = () => {
    setActiveFocal(50, 50);
    setActiveZoom(100);
  };

  const handleResetFeather = () => {
    setActiveFeatherStart(0);
    setActiveFeatherWidth(100);
    setActiveFeatherStrength(0);
  };

  const handleResetAll = () => {
    handleResetPosition();
    handleResetFeather();
  };

  const handleRevert = () => {
    if (placement) {
      setDesktopFocalX(placement.desktopFocalX);
      setDesktopFocalY(placement.desktopFocalY);
      setMobileFocalX(placement.mobileFocalX);
      setMobileFocalY(placement.mobileFocalY);
      setDesktopZoom(placement.desktopZoom ?? 100);
      setMobileZoom(placement.mobileZoom ?? 100);
      setDesktopFeatherStart(placement.desktopFeatherStart ?? 0);
      setDesktopFeatherWidth(placement.desktopFeatherWidth ?? 100);
      setDesktopFeatherStrength(placement.desktopFeatherStrength ?? 0);
      setMobileFeatherStart(placement.mobileFeatherStart ?? 0);
      setMobileFeatherWidth(placement.mobileFeatherWidth ?? 100);
      setMobileFeatherStrength(placement.mobileFeatherStrength ?? 0);
    }
  };

  // Save handler
  const handleSave = async () => {
    if (!placement) return;
    setSaving(true);
    setStatusMessage(null);

    const result = await updateSiteMediaPresentationAction({
      slot: activeSlot,
      altText: placement.altText,
      isDecorative: placement.isDecorative,
      desktopFocalX,
      desktopFocalY,
      mobileFocalX,
      mobileFocalY,
      desktopZoom,
      mobileZoom,
      desktopFeatherStart,
      desktopFeatherWidth,
      desktopFeatherStrength,
      mobileFeatherStart,
      mobileFeatherWidth,
      mobileFeatherStrength,
    });

    setSaving(false);

    if (result.success && result.placement) {
      const updatedPlacement = result.placement;
      lastPersistedRef.current = updatedPlacement;
      onPlacementChange(updatedPlacement);
      setStatusMessage({
        type: "success",
        text: `Saved presentation settings for ${placement.label}.`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: result.error ?? "Unable to save hero presentation settings.",
      });
    }
  };

  // Construct synthetic preview media placement object for HeroMediaPresentation
  const previewMedia: PublicSiteMediaPlacement | null = React.useMemo(() => {
    if (!placement?.previewUrl) return null;
    return {
      slot: activeSlot,
      publicUrl: placement.previewUrl,
      altText: placement.altText ?? "",
      isDecorative: placement.isDecorative,
      desktopFocalX,
      desktopFocalY,
      mobileFocalX,
      mobileFocalY,
      desktopZoom,
      mobileZoom,
      desktopFeatherStart,
      desktopFeatherWidth,
      desktopFeatherStrength,
      mobileFeatherStart,
      mobileFeatherWidth,
      mobileFeatherStrength,
    };
  }, [
    placement,
    activeSlot,
    desktopFocalX,
    desktopFocalY,
    mobileFocalX,
    mobileFocalY,
    desktopZoom,
    mobileZoom,
    desktopFeatherStart,
    desktopFeatherWidth,
    desktopFeatherStrength,
    mobileFeatherStart,
    mobileFeatherWidth,
    mobileFeatherStrength,
  ]);

  const hasImage = Boolean(placement?.storagePath && placement?.previewUrl);

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {statusMessage ? (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-md p-3 text-sm",
            statusMessage.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-red-200 bg-red-50 text-red-900",
          )}
        >
          {statusMessage.type === "success" ? (
            <Check className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      ) : null}

      {/* Empty State when slot has no assigned image */}
      {!hasImage ? (
        <div className="rounded-lg border-2 border-dashed border-subtle-divider bg-subtle-field/30 p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EEE6DA] text-ink-muted">
            <ImageIcon className="size-6" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
            No image assigned to {placement?.label ?? "this hero"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            The Hero Section Editor configures live presentation, positioning,
            and feathering. Choose or upload an image in the Public Image Editor
            first.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => onSwitchToImageEditor(activeSlot)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-oxide px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-[var(--admin-motion-fast)] hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
            >
              <ImageIcon className="size-4" />
              Choose image in Public Image Editor
            </button>
          </div>
        </div>
      ) : (
        /* Active Editor Workspace: Preview + Controls */
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Live Responsive Preview (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            {/* Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-md border border-subtle-divider bg-paper px-4 py-2.5 shadow-2xs">
              {/* Viewport switcher */}
              <div className="flex items-center gap-1">
                <span className="mr-2 text-xs font-semibold text-ink-muted">
                  Preview:
                </span>
                {(
                  [
                    { id: "desktop", label: "Desktop (1440)" },
                    { id: "tablet", label: "Tablet (768)" },
                    { id: "mobile", label: "Mobile (390)" },
                  ] as const
                ).map((vp) => (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => setViewport(vp.id)}
                    className={cn(
                      "rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                      viewport === vp.id
                        ? "bg-oxide text-paper"
                        : "bg-subtle-field text-ink-muted hover:text-ink",
                    )}
                  >
                    {vp.label}
                  </button>
                ))}
              </div>

              {/* Safe Area Guide Toggle */}
              <button
                type="button"
                onClick={() => setShowSafeArea((prev) => !prev)}
                aria-pressed={showSafeArea}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                  showSafeArea
                    ? "bg-subtle-field font-semibold text-[#7B3F35]"
                    : "text-ink-muted hover:text-ink",
                )}
                title="Toggle editorial text safe area overlay"
              >
                {showSafeArea ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
                <span>Safe Area</span>
              </button>
            </div>

            {/* Interactive Preview Canvas */}
            <div
              className={cn(
                "relative mx-auto overflow-hidden rounded-b-md border border-t-0 border-subtle-divider bg-[#EFE9DF] p-3 shadow-sm transition-all duration-200",
                viewport === "desktop" && "w-full",
                viewport === "tablet" && "w-full max-w-[640px]",
                viewport === "mobile" && "w-full max-w-[340px]",
              )}
            >
              {/* Interactive Frame with Pointer Capture */}
              <div
                ref={previewRef}
                tabIndex={0}
                role="application"
                aria-label={`${placement?.label} live interactive preview. Drag with mouse or touch, or use Arrow keys to adjust focal point. Shift plus arrow for larger steps.`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown}
                className={cn(
                  "relative mx-auto overflow-hidden border border-subtle-divider select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-oxide",
                  mode === "subject" ? "cursor-move" : "cursor-default",
                  viewport === "desktop" && "aspect-[16/9] w-full",
                  viewport === "tablet" && "aspect-[4/3] w-full",
                  viewport === "mobile" && "aspect-[3/4] w-full",
                )}
              >
                {previewMedia ? (
                  <HeroMediaPresentation
                    media={previewMedia}
                    viewport={viewport}
                    showSafeArea={showSafeArea}
                    slot={activeSlot}
                  />
                ) : null}

                {/* Subtle Focal Crosshair Marker (Visible only in Subject mode) */}
                {mode === "subject" ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                    style={{
                      left: `${activeFocalX}%`,
                      top: `${activeFocalY}%`,
                    }}
                  >
                    <div className="relative flex size-9 items-center justify-center">
                      <div className="size-8 rounded-full border-2 border-white/90 bg-black/25 shadow-md ring-1 ring-black/40 backdrop-blur-xs" />
                      <div className="absolute size-2 rounded-full bg-white shadow-xs" />
                      <div className="absolute h-6 w-[1.5px] bg-white/80" />
                      <div className="absolute h-[1.5px] w-6 bg-white/80" />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Canvas Footer Hint */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
                <span className="flex items-center gap-1">
                  <Crosshair className="size-3" />
                  {mode === "subject"
                    ? "Drag canvas or focus and use Arrow keys (Shift for 5%)"
                    : "Parchment feather preview active"}
                </span>
                <span>
                  Focal X: {activeFocalX}% | Y: {activeFocalY}% | Zoom:{" "}
                  {activeZoom}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Presentation Controls (5 cols) */}
          <div className="space-y-6 rounded-lg border border-subtle-divider bg-paper p-5 shadow-2xs lg:col-span-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 rounded-md bg-subtle-field p-1">
              <button
                type="button"
                onClick={() => setMode("subject")}
                aria-pressed={mode === "subject"}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-sm text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                  mode === "subject"
                    ? "bg-paper font-bold text-oxide shadow-2xs"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <Move className="size-3.5" />
                Image Subject
              </button>

              <button
                type="button"
                onClick={() => setMode("feather")}
                aria-pressed={mode === "feather"}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-sm text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                  mode === "feather"
                    ? "bg-paper font-bold text-oxide shadow-2xs"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <Sparkles className="size-3.5" />
                Feather Effect
              </button>
            </div>

            {/* Viewport Scope Banner */}
            <div className="flex items-center justify-between rounded-md border border-subtle-divider bg-subtle-field/40 px-3 py-2 text-xs text-ink-muted">
              <span>
                Targeting:{" "}
                <strong className="text-ink uppercase">
                  {viewport === "tablet" ? "Desktop / Tablet" : viewport}
                </strong>
              </span>
              {viewport === "tablet" ? (
                <span className="text-[10px] text-[#7B3F35] italic">
                  (Inherits desktop values)
                </span>
              ) : null}
            </div>

            {/* Mode A: Image Subject Controls */}
            {mode === "subject" ? (
              <div className="space-y-5">
                {/* Numeric Position Display */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-subtle-divider bg-subtle-field/20 p-3">
                    <label className="text-[11px] font-semibold text-ink-muted uppercase">
                      Focal X (Horizontal)
                    </label>
                    <div className="mt-1 flex items-center justify-between">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={activeFocalX}
                        onChange={(e) =>
                          setActiveFocal(Number(e.target.value), activeFocalY)
                        }
                        className="w-16 rounded-sm border border-subtle-divider bg-paper px-2 py-1 font-mono text-sm text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      />
                      <span className="text-xs text-ink-muted">%</span>
                    </div>
                  </div>

                  <div className="rounded-md border border-subtle-divider bg-subtle-field/20 p-3">
                    <label className="text-[11px] font-semibold text-ink-muted uppercase">
                      Focal Y (Vertical)
                    </label>
                    <div className="mt-1 flex items-center justify-between">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={activeFocalY}
                        onChange={(e) =>
                          setActiveFocal(activeFocalX, Number(e.target.value))
                        }
                        className="w-16 rounded-sm border border-subtle-divider bg-paper px-2 py-1 font-mono text-sm text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      />
                      <span className="text-xs text-ink-muted">%</span>
                    </div>
                  </div>
                </div>

                {/* 3x3 Quick Presets */}
                <div>
                  <label className="text-xs font-semibold text-ink">
                    Quick Focal Presets
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {FOCAL_PRESETS.map((preset) => {
                      const isSelected =
                        activeFocalX === preset.x && activeFocalY === preset.y;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setActiveFocal(preset.x, preset.y)}
                          className={cn(
                            "rounded-sm border px-2 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                            isSelected
                              ? "border-oxide bg-oxide font-semibold text-paper"
                              : "border-subtle-divider bg-paper text-ink-muted hover:border-ink hover:text-ink",
                          )}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zoom Slider */}
                <div className="rounded-md border border-subtle-divider bg-subtle-field/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="hero-zoom-slider"
                      className="flex items-center gap-1.5 font-semibold text-ink"
                    >
                      <Maximize2 className="size-3.5" />
                      Presentation Zoom
                    </label>
                    <span className="font-mono text-sm font-semibold text-oxide">
                      {activeZoom}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[11px] text-ink-muted">100%</span>
                    <input
                      id="hero-zoom-slider"
                      type="range"
                      min={100}
                      max={180}
                      step={1}
                      value={activeZoom}
                      onChange={(e) => setActiveZoom(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer accent-oxide"
                    />
                    <span className="text-[11px] text-ink-muted">180%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Anchored around focal point. Scale without exposing empty
                    space.
                  </p>
                </div>

                {/* Reset Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetPosition}
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  >
                    <RotateCcw className="size-3" />
                    Reset Image Position (50/50, 100% Zoom)
                  </button>
                </div>
              </div>
            ) : (
              /* Mode B: Feather Effect Controls */
              <div className="space-y-5">
                {/* Direction Notification */}
                <div className="rounded-md border border-[#D2C9BC] bg-[#FFFDF9] p-3 text-xs">
                  <span className="font-semibold text-[#7B3F35]">
                    Feather Direction:
                  </span>
                  <p className="mt-0.5 text-ink-muted">
                    Parchment LEFT → Photograph RIGHT (All Viewports)
                  </p>
                </div>

                {/* Feather Strength */}
                <div className="rounded-md border border-subtle-divider bg-subtle-field/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="feather-strength-slider"
                      className="font-semibold text-ink"
                    >
                      Feather Strength
                    </label>
                    <span className="font-mono text-sm font-semibold text-oxide">
                      {activeFeatherStrength}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[11px] text-ink-muted">0 (Off)</span>
                    <input
                      id="feather-strength-slider"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={activeFeatherStrength}
                      onChange={(e) =>
                        setActiveFeatherStrength(Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer accent-oxide"
                    />
                    <span className="text-[11px] text-ink-muted">100%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    0% disables feathering completely. Higher values create a
                    deeper Evidence Folio parchment transition.
                  </p>
                </div>

                {/* Feather Start */}
                <div className="rounded-md border border-subtle-divider bg-subtle-field/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="feather-start-slider"
                      className="font-semibold text-ink"
                    >
                      Feather Start Stop
                    </label>
                    <span className="font-mono text-sm font-semibold text-oxide">
                      {activeFeatherStart}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[11px] text-ink-muted">0%</span>
                    <input
                      id="feather-start-slider"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={activeFeatherStart}
                      onChange={(e) =>
                        setActiveFeatherStart(Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer accent-oxide"
                    />
                    <span className="text-[11px] text-ink-muted">100%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Horizontal distance from the left edge before the parchment
                    gradient begins softening into photo.
                  </p>
                </div>

                {/* Feather Width */}
                <div className="rounded-md border border-subtle-divider bg-subtle-field/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="feather-width-slider"
                      className="font-semibold text-ink"
                    >
                      Feather Width (Span)
                    </label>
                    <span className="font-mono text-sm font-semibold text-oxide">
                      {activeFeatherWidth}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[11px] text-ink-muted">0%</span>
                    <input
                      id="feather-width-slider"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={activeFeatherWidth}
                      onChange={(e) =>
                        setActiveFeatherWidth(Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer accent-oxide"
                    />
                    <span className="text-[11px] text-ink-muted">100%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Horizontal width across which parchment blends into the
                    clear photo.
                  </p>
                </div>

                {/* Reset Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFeather}
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  >
                    <RotateCcw className="size-3" />
                    Reset Feather (Disabled)
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="space-y-3 border-t border-subtle-divider pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                >
                  Reset All
                </button>

                {isDirty ? (
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="text-xs text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  >
                    Revert to Saved
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-paper transition-colors duration-[var(--admin-motion-fast)] focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                  isDirty
                    ? "bg-oxide hover:bg-oxide-link"
                    : "cursor-not-allowed bg-subtle-divider text-ink-muted opacity-60",
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving presentation...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>Save Presentation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
