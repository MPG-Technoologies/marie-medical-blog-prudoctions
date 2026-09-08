import Image, { getImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface HomeHeroArtDirectionProps {
  className?: string;
}

/**
 * Responsive art-directed Evidence Folio neutral hero visual for desktop and tablet.
 * Uses framework-native Next.js 16 getImageProps with <picture> for optimal responsive
 * art direction and bandwidth efficiency, combined with Evidence Folio parchment feathering.
 */
export function HomeHeroArtDirection({ className }: HomeHeroArtDirectionProps) {
  // Desktop source: 1024x576 (16:9 wide landscape, focal elements right-weighted)
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    src: "/images/hero/marie-home-hero-desktop.png",
    alt: "",
    fill: true,
    priority: true,
    quality: 85,
    sizes: "(min-width: 1280px) 55vw, (min-width: 1024px) 58vw, 50vw",
  });

  // Tablet source: 1024x768 (4:3 tighter landscape)
  const {
    props: { srcSet: tabletSrcSet, ...rest },
  } = getImageProps({
    src: "/images/hero/marie-home-hero-tablet.png",
    alt: "",
    fill: true,
    priority: true,
    quality: 85,
    sizes: "(min-width: 768px) 50vw, 100vw",
  });

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#F6F1E8]",
        className,
      )}
    >
      <picture className="absolute inset-0 block h-full w-full">
        <source media="(min-width: 1024px)" srcSet={desktopSrcSet} />
        <source media="(min-width: 768px)" srcSet={tabletSrcSet} />
        <img
          {...rest}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[right_center] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        />
      </picture>

      {/* Center/Left soft feathered transition into Evidence Folio parchment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#F6F1E8] via-[#F6F1E8]/90 via-28% to-transparent sm:w-44 lg:w-64 xl:w-80"
      />

      {/* Bottom soft feathering to harmonize with the section divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#F6F1E8] via-[#F6F1E8]/50 to-transparent"
      />

      {/* Top gentle feathering */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#F6F1E8]/60 to-transparent"
      />
    </div>
  );
}

/**
 * Mobile-specific portrait composition (< 768px).
 * Positioned below primary hero copy so photography does not compromise typography readability.
 */
export function HomeHeroMobileArtDirection({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto mt-8 w-full max-w-sm overflow-hidden sm:max-w-md md:hidden",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xs sm:aspect-[3/4]">
        <Image
          src="/images/hero/marie-home-hero-mobile.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 768px) 90vw, 430px"
          quality={85}
          className="object-cover object-[center_70%]"
        />

        {/* Upper soft feather into parchment */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#F6F1E8] via-[#F6F1E8]/80 to-transparent"
        />

        {/* Bottom soft feather */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-[#F6F1E8] via-[#F6F1E8]/60 to-transparent"
        />

        {/* Subtle lateral softens */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#F6F1E8]/40 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#F6F1E8]/40 to-transparent"
        />
      </div>
    </div>
  );
}
