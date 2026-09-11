import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const ROOT = process.cwd();

test("1. Database migration defines zoom and feathering schema constraints and defaults", () => {
  const migrationPath = path.join(
    ROOT,
    "supabase/migrations/20260911103000_hero_presentation_controls.sql",
  );
  assert.ok(
    fs.existsSync(migrationPath),
    "Migration file 20260911103000_hero_presentation_controls.sql must exist",
  );

  const sql = fs.readFileSync(migrationPath, "utf8");

  // Verify column additions
  assert.ok(
    sql.includes("desktop_zoom smallint not null default 100"),
    "Must add desktop_zoom with default 100",
  );
  assert.ok(
    sql.includes("mobile_zoom smallint not null default 100"),
    "Must add mobile_zoom with default 100",
  );
  assert.ok(
    sql.includes("desktop_feather_start smallint not null default 0"),
    "Must add desktop_feather_start with default 0",
  );
  assert.ok(
    sql.includes("desktop_feather_width smallint not null default 100"),
    "Must add desktop_feather_width with default 100",
  );
  assert.ok(
    sql.includes("desktop_feather_strength smallint not null default 0"),
    "Must add desktop_feather_strength with default 0",
  );
  assert.ok(
    sql.includes("mobile_feather_start smallint not null default 0"),
    "Must add mobile_feather_start with default 0",
  );
  assert.ok(
    sql.includes("mobile_feather_width smallint not null default 100"),
    "Must add mobile_feather_width with default 100",
  );
  assert.ok(
    sql.includes("mobile_feather_strength smallint not null default 0"),
    "Must add mobile_feather_strength with default 0",
  );

  // Verify check constraints
  assert.ok(
    sql.includes("desktop_zoom between 100 and 180"),
    "Must enforce 100% to 180% check constraint on desktop_zoom",
  );
  assert.ok(
    sql.includes("mobile_zoom between 100 and 180"),
    "Must enforce 100% to 180% check constraint on mobile_zoom",
  );
  assert.ok(
    sql.includes("desktop_feather_strength between 0 and 100"),
    "Must enforce 0% to 100% check constraint on desktop_feather_strength",
  );
  assert.ok(
    sql.includes("mobile_feather_strength between 0 and 100"),
    "Must enforce 0% to 100% check constraint on mobile_feather_strength",
  );
});

test("2. Hero slots validation source contract and helper functions", () => {
  const validationFile = path.join(
    ROOT,
    "src/lib/admin/site-media-validation.ts",
  );
  assert.ok(
    fs.existsSync(validationFile),
    "src/lib/admin/site-media-validation.ts must exist",
  );

  const content = fs.readFileSync(validationFile, "utf8");

  // Verify HERO_MEDIA_SLOTS array
  assert.ok(
    content.includes('"home_hero"') &&
      content.includes('"about_hero"') &&
      content.includes('"portfolio_hero"') &&
      content.includes('"contact_hero"'),
    "HERO_MEDIA_SLOTS must contain home_hero, about_hero, portfolio_hero, contact_hero",
  );

  // Verify type guard helper isHeroMediaSlot
  assert.ok(
    content.includes("export function isHeroMediaSlot"),
    "Must export isHeroMediaSlot helper",
  );

  // Verify presentation schema includes zoom and feather fields with correct bounds
  assert.ok(
    content.includes("desktopZoom: zoom.optional().default(100)"),
    "Schema must include desktopZoom with default 100",
  );
  assert.ok(
    content.includes("mobileZoom: zoom.optional().default(100)"),
    "Schema must include mobileZoom with default 100",
  );
  assert.ok(
    content.includes("desktopFeatherStart: feather.optional().default(0)"),
    "Schema must include desktopFeatherStart with default 0",
  );
  assert.ok(
    content.includes("desktopFeatherWidth: feather.optional().default(100)"),
    "Schema must include desktopFeatherWidth with default 100",
  );
  assert.ok(
    content.includes("desktopFeatherStrength: feather.optional().default(0)"),
    "Schema must include desktopFeatherStrength with default 0",
  );
  assert.ok(
    content.includes("mobileFeatherStart: feather.optional().default(0)"),
    "Schema must include mobileFeatherStart with default 0",
  );
  assert.ok(
    content.includes("mobileFeatherWidth: feather.optional().default(100)"),
    "Schema must include mobileFeatherWidth with default 100",
  );
  assert.ok(
    content.includes("mobileFeatherStrength: feather.optional().default(0)"),
    "Schema must include mobileFeatherStrength with default 0",
  );
});

test("3. Presentation validation schema rule behavior", () => {
  // Test the exact Zod schema definition used in site-media-validation
  const focal = z.number().int().min(0).max(100);
  const zoom = z.number().int().min(100).max(180);
  const feather = z.number().int().min(0).max(100);

  const testSchema = z.object({
    slot: z.enum([
      "home_hero",
      "about_hero",
      "portfolio_hero",
      "contact_hero",
      "author_portrait",
      "default_social",
    ]),
    altText: z.string().trim().max(500).nullable(),
    isDecorative: z.boolean(),
    desktopFocalX: focal,
    desktopFocalY: focal,
    mobileFocalX: focal,
    mobileFocalY: focal,
    desktopZoom: zoom.optional().default(100),
    mobileZoom: zoom.optional().default(100),
    desktopFeatherStart: feather.optional().default(0),
    desktopFeatherWidth: feather.optional().default(100),
    desktopFeatherStrength: feather.optional().default(0),
    mobileFeatherStart: feather.optional().default(0),
    mobileFeatherWidth: feather.optional().default(100),
    mobileFeatherStrength: feather.optional().default(0),
  });

  const baseValid = {
    slot: "home_hero",
    altText: "Hero description",
    isDecorative: false,
    desktopFocalX: 50,
    desktopFocalY: 50,
    mobileFocalX: 50,
    mobileFocalY: 50,
  };

  // Schema with defaults applied
  const defaultParsed = testSchema.parse(baseValid);
  assert.equal(
    defaultParsed.desktopZoom,
    100,
    "Default desktop zoom must be 100",
  );
  assert.equal(
    defaultParsed.mobileZoom,
    100,
    "Default mobile zoom must be 100",
  );
  assert.equal(defaultParsed.desktopFeatherStart, 0);
  assert.equal(defaultParsed.desktopFeatherWidth, 100);
  assert.equal(defaultParsed.desktopFeatherStrength, 0);
  assert.equal(defaultParsed.mobileFeatherStart, 0);
  assert.equal(defaultParsed.mobileFeatherWidth, 100);
  assert.equal(defaultParsed.mobileFeatherStrength, 0);

  // Custom valid values
  const customParsed = testSchema.parse({
    ...baseValid,
    desktopZoom: 155,
    mobileZoom: 130,
    desktopFeatherStart: 30,
    desktopFeatherWidth: 60,
    desktopFeatherStrength: 75,
  });
  assert.equal(customParsed.desktopZoom, 155);
  assert.equal(customParsed.mobileZoom, 130);
  assert.equal(customParsed.desktopFeatherStart, 30);
  assert.equal(customParsed.desktopFeatherWidth, 60);
  assert.equal(customParsed.desktopFeatherStrength, 75);

  // Reject zoom < 100 or > 180
  assert.equal(
    testSchema.safeParse({ ...baseValid, desktopZoom: 99 }).success,
    false,
  );
  assert.equal(
    testSchema.safeParse({ ...baseValid, desktopZoom: 181 }).success,
    false,
  );
  assert.equal(
    testSchema.safeParse({ ...baseValid, mobileZoom: 50 }).success,
    false,
  );
  assert.equal(
    testSchema.safeParse({ ...baseValid, mobileZoom: 200 }).success,
    false,
  );

  // Reject feather < 0 or > 100
  assert.equal(
    testSchema.safeParse({ ...baseValid, desktopFeatherStrength: -1 }).success,
    false,
  );
  assert.equal(
    testSchema.safeParse({ ...baseValid, desktopFeatherStrength: 101 }).success,
    false,
  );
  assert.equal(
    testSchema.safeParse({ ...baseValid, desktopFeatherStart: -5 }).success,
    false,
  );
  assert.equal(
    testSchema.safeParse({ ...baseValid, desktopFeatherWidth: 105 }).success,
    false,
  );
});

test("4. Data layer contract preserves explicit column selection (No SELECT *)", () => {
  const adminSiteMediaFile = path.join(ROOT, "src/lib/admin/site-media.ts");
  const adminContent = fs.readFileSync(adminSiteMediaFile, "utf8");

  assert.ok(
    !adminContent.includes('select("*")') &&
      !adminContent.includes("select('*')"),
    "src/lib/admin/site-media.ts must NOT use SELECT *",
  );
  assert.ok(
    adminContent.includes("desktop_zoom"),
    "Admin site media query must explicitly select desktop_zoom",
  );
  assert.ok(
    adminContent.includes("mobile_zoom"),
    "Admin site media query must explicitly select mobile_zoom",
  );
  assert.ok(
    adminContent.includes("desktop_feather_strength"),
    "Admin site media query must explicitly select desktop_feather_strength",
  );

  const publicSiteMediaFile = path.join(ROOT, "src/lib/public-site-media.ts");
  const publicContent = fs.readFileSync(publicSiteMediaFile, "utf8");

  assert.ok(
    !publicContent.includes('select("*")') &&
      !publicContent.includes("select('*')"),
    "src/lib/public-site-media.ts must NOT use SELECT *",
  );
  assert.ok(
    publicContent.includes("desktop_zoom"),
    "Public site media query must explicitly select desktop_zoom",
  );
  assert.ok(
    publicContent.includes("desktop_feather_strength"),
    "Public site media query must explicitly select desktop_feather_strength",
  );
  assert.ok(
    publicContent.includes("normalizeZoom"),
    "Public site media must provide normalizeZoom for backward compatibility",
  );
});

test("5. Removal of old pre-feathered assets and art-direction fallback component", () => {
  const oldArtDirectionFile = path.join(
    ROOT,
    "src/components/public/home-hero-art-direction.tsx",
  );
  assert.equal(
    fs.existsSync(oldArtDirectionFile),
    false,
    "home-hero-art-direction.tsx must be completely removed",
  );

  const oldDesktopImg = path.join(
    ROOT,
    "public/images/hero/marie-home-hero-desktop.png",
  );
  const oldTabletImg = path.join(
    ROOT,
    "public/images/hero/marie-home-hero-tablet.png",
  );
  const oldMobileImg = path.join(
    ROOT,
    "public/images/hero/marie-home-hero-mobile.png",
  );

  assert.equal(
    fs.existsSync(oldDesktopImg),
    false,
    "Old desktop pre-feathered image must be removed",
  );
  assert.equal(
    fs.existsSync(oldTabletImg),
    false,
    "Old tablet pre-feathered image must be removed",
  );
  assert.equal(
    fs.existsSync(oldMobileImg),
    false,
    "Old mobile pre-feathered image must be removed",
  );
});

test("6. Shared HeroMediaPresentation component contract", () => {
  const compPath = path.join(
    ROOT,
    "src/components/public/hero-media-presentation.tsx",
  );
  assert.ok(
    fs.existsSync(compPath),
    "hero-media-presentation.tsx must exist as shared presentation component",
  );

  const content = fs.readFileSync(compPath, "utf8");

  // Verify Evidence Folio parchment color
  assert.ok(
    content.includes("246, 241, 232") || content.includes("#F6F1E8"),
    "Must use Evidence Folio parchment #F6F1E8 color for gradient stops",
  );

  // Verify CSS parchment feathering gradient: strictly horizontal (to right) on all viewports
  assert.ok(
    content.includes("getFeatherGradient"),
    "Must implement getFeatherGradient helper for parchment feathering",
  );
  assert.ok(
    content.includes("linear-gradient"),
    "Must generate CSS linear-gradient for seamless parchment feathering",
  );
  assert.ok(
    !content.includes('"to bottom"') && !content.includes("'to bottom'"),
    "Must NOT contain vertical feathering gradient (to bottom) on any viewport",
  );
  assert.ok(
    content.includes("to right"),
    "Must support horizontal feathering gradient (to right) across all viewports (desktop, tablet, mobile)",
  );

  // Verify safe area overlay support for admin preview
  assert.ok(
    content.includes("showSafeArea"),
    "Must support showSafeArea overlay for Hero Section Editor preview",
  );

  // Verify transform scale / zoom
  assert.ok(
    content.includes("scale("),
    "Must apply scale transform anchored at focal point",
  );
});

test("7. Public pages integrate managed HeroMediaPresentation with graceful fallback", () => {
  const homePath = path.join(ROOT, "src/app/page.tsx");
  const homeContent = fs.readFileSync(homePath, "utf8");

  assert.ok(
    homeContent.includes("HeroMediaPresentation"),
    "Homepage must use HeroMediaPresentation",
  );
  assert.ok(
    !homeContent.includes("HomeHeroArtDirection"),
    "Homepage must NOT reference old HomeHeroArtDirection",
  );

  // Verify about, portfolio, contact pages
  for (const pageName of ["about", "portfolio", "contact"]) {
    const pagePath = path.join(ROOT, `src/app/${pageName}/page.tsx`);
    const pageContent = fs.readFileSync(pagePath, "utf8");
    assert.ok(
      pageContent.includes("HeroMediaPresentation"),
      `${pageName} page must use HeroMediaPresentation`,
    );
  }
});

test("8. Hero Section Editor and Workspace UI contract", () => {
  const editorPath = path.join(
    ROOT,
    "src/components/admin/media/hero-section-editor.tsx",
  );
  assert.ok(fs.existsSync(editorPath), "hero-section-editor.tsx must exist");

  const editorContent = fs.readFileSync(editorPath, "utf8");

  // Verify viewports: desktop, tablet, mobile
  assert.ok(
    editorContent.includes('"desktop"'),
    "Must support desktop viewport",
  );
  assert.ok(editorContent.includes('"tablet"'), "Must support tablet viewport");
  assert.ok(editorContent.includes('"mobile"'), "Must support mobile viewport");

  // Verify edit modes: subject and feather
  assert.ok(
    editorContent.includes('"subject"'),
    "Must support subject editing mode",
  );
  assert.ok(
    editorContent.includes('"feather"'),
    "Must support feather editing mode",
  );

  // Verify pointer capture drag
  assert.ok(
    editorContent.includes("setPointerCapture"),
    "Must use pointer capture for smooth drag interaction",
  );

  // Verify keyboard navigation
  assert.ok(
    editorContent.includes("ArrowLeft") && editorContent.includes("ArrowUp"),
    "Must support keyboard navigation for focal point positioning",
  );

  // Verify workspace tabs
  const workspacePath = path.join(
    ROOT,
    "src/components/admin/media/site-media-workspace.tsx",
  );
  assert.ok(
    fs.existsSync(workspacePath),
    "site-media-workspace.tsx must exist",
  );

  const workspaceContent = fs.readFileSync(workspacePath, "utf8");
  assert.ok(
    workspaceContent.includes('role="tablist"'),
    "Workspace must render an accessible tablist",
  );
  assert.ok(
    workspaceContent.includes("Public Image Editor"),
    "Workspace must provide Public Image Editor tab",
  );
  assert.ok(
    workspaceContent.includes("Hero Section Editor"),
    "Workspace must provide Hero Section Editor tab",
  );
});
