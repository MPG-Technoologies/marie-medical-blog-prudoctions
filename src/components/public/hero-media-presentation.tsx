import * as React from "react";
import Image from "next/image";
import type { PublicSiteMediaPlacement } from "@/lib/public-site-media";
import { cn } from "@/lib/utils";

export interface HeroMediaPresentationProps {
  media: PublicSiteMediaPlacement;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  /**
   * Optional viewport override for admin live preview.
   * When omitted, uses responsive media queries for public Server Components.
   */
  viewport?: "desktop" | "tablet" | "mobile";
  /**
   * Admin editor only: show layout text-safe zone guide
   */
  showSafeArea?: boolean;
  slot?:
    "home_hero" | "about_hero" | "portfolio_hero" | "contact_hero" | string;
}

export function getFeatherGradient(
  start: number,
  width: number,
  strength: number,
  direction: "to right" = "to right",
): string {
  if (strength <= 0) return "none";

  const maxAlpha = (strength / 100).toFixed(3);
  const midAlpha = ((strength / 100) * 0.75).toFixed(3);
  const lowAlpha = ((strength / 100) * 0.25).toFixed(3);

  const startStop = Math.max(0, Math.min(100, start));
  const endStop = Math.max(startStop, Math.min(100, start + width));
  const span = endStop - startStop;

  // Gentle eased stops for editorial parchment feathering without visible hard seams
  const stop1 = (startStop + span * 0.25).toFixed(1);
  const stop2 = (startStop + span * 0.55).toFixed(1);
  const stop3 = (startStop + span * 0.82).toFixed(1);

  return `linear-gradient(${direction}, rgba(246, 241, 232, ${maxAlpha}) 0%, rgba(246, 241, 232, ${maxAlpha}) ${startStop}%, rgba(246, 241, 232, ${midAlpha}) ${stop1}%, rgba(246, 241, 232, ${lowAlpha}) ${stop2}%, rgba(246, 241, 232, 0.05) ${stop3}%, rgba(246, 241, 232, 0) ${endStop}%, rgba(246, 241, 232, 0) 100%)`;
}

export function HeroMediaPresentation({
  media,
  priority = false,
  sizes = "100vw",
  className,
  imageClassName,
  viewport,
  showSafeArea = false,
  slot,
}: HeroMediaPresentationProps) {
  // Viewport mode handling
  const isMobileMode = viewport === "mobile";
  const isResponsive = !viewport;

  // Tablet inherits desktop presentation values
  const desktopFocal = { x: media.desktopFocalX, y: media.desktopFocalY };
  const desktopZoom = media.desktopZoom;
  const desktopFeather = {
    start: media.desktopFeatherStart,
    width: media.desktopFeatherWidth,
    strength: media.desktopFeatherStrength,
  };

  const mobileFocal = { x: media.mobileFocalX, y: media.mobileFocalY };
  const mobileZoom = media.mobileZoom;
  const mobileFeather = {
    start: media.mobileFeatherStart,
    width: media.mobileFeatherWidth,
    strength: media.mobileFeatherStrength,
  };

  // Fixed viewport styles (for Admin Editor live preview)
  // All viewports use horizontal LEFT -> RIGHT feathering to blend parchment into photo
  const activeFocal = isMobileMode ? mobileFocal : desktopFocal;
  const activeZoom = isMobileMode ? mobileZoom : desktopZoom;
  const activeFeatherGradient = isMobileMode
    ? getFeatherGradient(
        mobileFeather.start,
        mobileFeather.width,
        mobileFeather.strength,
        "to right",
      )
    : getFeatherGradient(
        desktopFeather.start,
        desktopFeather.width,
        desktopFeather.strength,
        "to right",
      );

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#F6F1E8]",
        className,
      )}
      style={
        isResponsive
          ? ({
              "--desk-fx": `${desktopFocal.x}%`,
              "--desk-fy": `${desktopFocal.y}%`,
              "--desk-scale": `${desktopZoom / 100}`,
              "--desk-feather": getFeatherGradient(
                desktopFeather.start,
                desktopFeather.width,
                desktopFeather.strength,
                "to right",
              ),

              "--mob-fx": `${mobileFocal.x}%`,
              "--mob-fy": `${mobileFocal.y}%`,
              "--mob-scale": `${mobileZoom / 100}`,
              "--mob-feather": getFeatherGradient(
                mobileFeather.start,
                mobileFeather.width,
                mobileFeather.strength,
                "to right",
              ),
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Zoomable & Focally-positioned Image Container */}
      <div
        className="absolute inset-0 h-full w-full"
        style={
          !isResponsive
            ? {
                transformOrigin: `${activeFocal.x}% ${activeFocal.y}%`,
                transform: `scale(${activeZoom / 100})`,
              }
            : undefined
        }
      >
        <Image
          src={media.publicUrl}
          alt={media.isDecorative ? "" : (media.altText ?? "")}
          fill
          priority={priority}
          sizes={sizes}
          style={
            !isResponsive
              ? {
                  objectPosition: `${activeFocal.x}% ${activeFocal.y}%`,
                }
              : undefined
          }
          className={cn(
            "object-cover transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            isResponsive && [
              "[transform-origin:var(--mob-fx)_var(--mob-fy)] [transform:scale(var(--mob-scale))] [object-position:var(--mob-fx)_var(--mob-fy)]",
              "md:[transform-origin:var(--desk-fx)_var(--desk-fy)] md:[transform:scale(var(--desk-scale))] md:[object-position:var(--desk-fx)_var(--desk-fy)]",
            ],
            imageClassName,
          )}
        />
      </div>

      {/* Evidence Folio Parchment Feather Overlay */}
      {!isResponsive ? (
        activeFeatherGradient !== "none" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            style={{ background: activeFeatherGradient }}
          />
        ) : null
      ) : (
        <>
          {/* Mobile feather (left to right) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 md:hidden"
            style={{ background: "var(--mob-feather)" }}
          />
          {/* Desktop/Tablet feather (left to right) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 hidden md:block"
            style={{ background: "var(--desk-feather)" }}
          />
        </>
      )}

      {/* Editor Safe Area Overlay Guide (Admin Preview Only) */}
      {showSafeArea ? (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex border-2 border-dashed border-[#7B3F35]/40 bg-[#7B3F35]/5",
            isMobileMode
              ? "inset-x-2 top-2 h-[45%] flex-col justify-start p-3"
              : slot === "portfolio_hero" || slot === "contact_hero"
                ? "inset-y-2 left-2 w-[48%] flex-col justify-center p-4"
                : "inset-y-2 left-2 w-[52%] flex-col justify-center p-4",
          )}
        >
          <div className="inline-flex max-w-fit items-center gap-1.5 rounded-xs bg-[#F6F1E8]/95 px-2 py-1 text-[11px] font-semibold tracking-wider text-[#7B3F35] uppercase shadow-xs">
            <span>Text Safe Area</span>
          </div>
          <p className="mt-1 text-[11px] leading-tight text-[#5E5953] opacity-80">
            Editorial typography occupies this zone. Drag important image
            subject outside.
          </p>
        </div>
      ) : null}
    </div>
  );
}
