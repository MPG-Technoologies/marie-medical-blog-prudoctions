-- D043: Post-V1 Responsive Hero Section Editor presentation controls
-- Extends public.site_media_slots with zoom and CSS feather presentation controls.
-- Preserves existing RLS policies, triggers, and all slot records.
-- Defaults: zoom=100%, feather_strength=0% (disabled by default so existing visuals are untouched).

alter table public.site_media_slots
  add column if not exists desktop_zoom smallint not null default 100,
  add column if not exists mobile_zoom smallint not null default 100,
  add column if not exists desktop_feather_start smallint not null default 0,
  add column if not exists desktop_feather_width smallint not null default 100,
  add column if not exists desktop_feather_strength smallint not null default 0,
  add column if not exists mobile_feather_start smallint not null default 0,
  add column if not exists mobile_feather_width smallint not null default 100,
  add column if not exists mobile_feather_strength smallint not null default 0;

alter table public.site_media_slots
  drop constraint if exists chk_desktop_zoom,
  add constraint chk_desktop_zoom check (desktop_zoom between 100 and 180);

alter table public.site_media_slots
  drop constraint if exists chk_mobile_zoom,
  add constraint chk_mobile_zoom check (mobile_zoom between 100 and 180);

alter table public.site_media_slots
  drop constraint if exists chk_desktop_feather_start,
  add constraint chk_desktop_feather_start check (desktop_feather_start between 0 and 100);

alter table public.site_media_slots
  drop constraint if exists chk_desktop_feather_width,
  add constraint chk_desktop_feather_width check (desktop_feather_width between 0 and 100);

alter table public.site_media_slots
  drop constraint if exists chk_desktop_feather_strength,
  add constraint chk_desktop_feather_strength check (desktop_feather_strength between 0 and 100);

alter table public.site_media_slots
  drop constraint if exists chk_mobile_feather_start,
  add constraint chk_mobile_feather_start check (mobile_feather_start between 0 and 100);

alter table public.site_media_slots
  drop constraint if exists chk_mobile_feather_width,
  add constraint chk_mobile_feather_width check (mobile_feather_width between 0 and 100);

alter table public.site_media_slots
  drop constraint if exists chk_mobile_feather_strength,
  add constraint chk_mobile_feather_strength check (mobile_feather_strength between 0 and 100);
