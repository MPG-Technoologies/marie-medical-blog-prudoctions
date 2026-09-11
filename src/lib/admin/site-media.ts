import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import {
  SITE_MEDIA_SLOTS,
  SITE_MEDIA_SLOT_META,
  type SiteMediaSlot,
} from "@/lib/admin/site-media-validation";

export interface AdminSiteMediaPlacement {
  slot: SiteMediaSlot;

  label: string;
  description: string;
  mobileRule: string;

  storagePath: string | null;
  altText: string | null;
  isDecorative: boolean;

  desktopFocalX: number;
  desktopFocalY: number;

  mobileFocalX: number;
  mobileFocalY: number;

  desktopZoom: number;
  mobileZoom: number;

  desktopFeatherStart: number;
  desktopFeatherWidth: number;
  desktopFeatherStrength: number;

  mobileFeatherStart: number;
  mobileFeatherWidth: number;
  mobileFeatherStrength: number;

  previewUrl: string | null;
}

interface SiteMediaRow {
  slot: SiteMediaSlot;
  storage_path: string;
  alt_text: string | null;
  is_decorative: boolean;
  desktop_focal_x: number;
  desktop_focal_y: number;
  mobile_focal_x: number;
  mobile_focal_y: number;
  desktop_zoom?: number;
  mobile_zoom?: number;
  desktop_feather_start?: number;
  desktop_feather_width?: number;
  desktop_feather_strength?: number;
  mobile_feather_start?: number;
  mobile_feather_width?: number;
  mobile_feather_strength?: number;
}

export function getSiteMediaPublicUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
) {
  return supabase.storage.from("public-assets").getPublicUrl(path).data
    .publicUrl;
}

export async function getAdminSiteMediaPlacements(): Promise<
  AdminSiteMediaPlacement[]
> {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase.from("site_media_slots").select(`
      slot,
      storage_path,
      alt_text,
      is_decorative,
      desktop_focal_x,
      desktop_focal_y,
      mobile_focal_x,
      mobile_focal_y,
      desktop_zoom,
      mobile_zoom,
      desktop_feather_start,
      desktop_feather_width,
      desktop_feather_strength,
      mobile_feather_start,
      mobile_feather_width,
      mobile_feather_strength
    `);

  if (error) {
    throw new Error(
      "Unable to load website image placements. Apply the local D036 migration first.",
    );
  }

  const rows = new Map<SiteMediaSlot, SiteMediaRow>();

  for (const row of (data ?? []) as SiteMediaRow[]) {
    if (SITE_MEDIA_SLOTS.includes(row.slot)) {
      rows.set(row.slot, row);
    }
  }

  return SITE_MEDIA_SLOTS.map((slot) => {
    const row = rows.get(slot);
    const meta = SITE_MEDIA_SLOT_META[slot];

    return {
      slot,

      label: meta.label,
      description: meta.description,
      mobileRule: meta.mobileRule,

      storagePath: row?.storage_path ?? null,
      altText: row?.alt_text ?? null,
      isDecorative: row?.is_decorative ?? false,

      desktopFocalX: row?.desktop_focal_x ?? 50,
      desktopFocalY: row?.desktop_focal_y ?? 50,

      mobileFocalX: row?.mobile_focal_x ?? 50,
      mobileFocalY: row?.mobile_focal_y ?? 50,

      desktopZoom: row?.desktop_zoom ?? 100,
      mobileZoom: row?.mobile_zoom ?? 100,

      desktopFeatherStart: row?.desktop_feather_start ?? 0,
      desktopFeatherWidth: row?.desktop_feather_width ?? 100,
      desktopFeatherStrength: row?.desktop_feather_strength ?? 0,

      mobileFeatherStart: row?.mobile_feather_start ?? 0,
      mobileFeatherWidth: row?.mobile_feather_width ?? 100,
      mobileFeatherStrength: row?.mobile_feather_strength ?? 0,

      previewUrl: row?.storage_path
        ? getSiteMediaPublicUrl(supabase, row.storage_path)
        : null,
    };
  });
}
