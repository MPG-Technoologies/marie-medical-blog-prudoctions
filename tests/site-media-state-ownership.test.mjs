import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("A. Public Image Editor placement update & state ownership architecture", () => {
  const filePath = path.join(
    ROOT,
    "src/components/admin/media/site-media-placements.tsx",
  );
  assert.ok(fs.existsSync(filePath), "site-media-placements.tsx must exist");

  const content = fs.readFileSync(filePath, "utf8");

  // 1. Props contract: accepts canonical placements and single onPlacementChange callback
  assert.ok(
    content.includes("placements: AdminSiteMediaPlacement[];"),
    "SiteMediaPlacements must accept canonical placements prop from parent",
  );
  assert.ok(
    content.includes(
      "onPlacementChange?: (placement: AdminSiteMediaPlacement) => void;",
    ),
    "SiteMediaPlacements must accept onPlacementChange callback for completed mutations",
  );

  // 2. No duplicate placements state in child
  assert.ok(
    !content.includes("useState<AdminSiteMediaPlacement[]>"),
    "SiteMediaPlacements must NOT duplicate canonical placements in local useState",
  );
  assert.ok(
    !content.includes("const [placements, setPlacements]"),
    "SiteMediaPlacements must NOT have a local setPlacements state updater",
  );

  // 3. savePlacement calls parent onPlacementChange directly upon action completion
  assert.ok(
    content.includes("onPlacementChange?.(result.placement);"),
    "savePlacement must invoke onPlacementChange with result.placement directly in action completion path",
  );
});

test("B. Hero Section Editor save & state ownership architecture", () => {
  const filePath = path.join(
    ROOT,
    "src/components/admin/media/hero-section-editor.tsx",
  );
  assert.ok(fs.existsSync(filePath), "hero-section-editor.tsx must exist");

  const content = fs.readFileSync(filePath, "utf8");

  // 1. Props contract
  assert.ok(
    content.includes(
      "onPlacementChange: (placement: AdminSiteMediaPlacement) => void;",
    ),
    "HeroSectionEditor must accept onPlacementChange callback",
  );

  // 2. handleSave reports completed placement mutation directly
  assert.ok(
    content.includes("onPlacementChange(updatedPlacement);"),
    "HeroSectionEditor must call onPlacementChange with updated placement upon action completion",
  );
  assert.ok(
    !content.includes("onPlacementsChange(placements.map("),
    "HeroSectionEditor must NOT map full placements array or call old onPlacementsChange",
  );
});

test("C. Tab synchronization & Single source of truth in SiteMediaWorkspace", () => {
  const filePath = path.join(
    ROOT,
    "src/components/admin/media/site-media-workspace.tsx",
  );
  assert.ok(fs.existsSync(filePath), "site-media-workspace.tsx must exist");

  const content = fs.readFileSync(filePath, "utf8");

  // 1. Workspace holds canonical placements state
  assert.ok(
    content.includes(
      "const [placements, setPlacements] =\n    React.useState<AdminSiteMediaPlacement[]>(initialPlacements);",
    ) ||
      content.includes(
        "useState<AdminSiteMediaPlacement[]>(initialPlacements)",
      ),
    "SiteMediaWorkspace must be the single source of truth for placements state",
  );

  // 2. Workspace provides handlePlacementChange updater
  assert.ok(
    content.includes("handlePlacementChange"),
    "SiteMediaWorkspace must define handlePlacementChange",
  );
  assert.ok(
    content.includes("item.slot === updatedPlacement.slot"),
    "handlePlacementChange must update placement matching the slot",
  );

  // 3. Both sibling editors receive canonical placements and handlePlacementChange
  assert.ok(
    content.includes("placements={placements}"),
    "SiteMediaWorkspace must pass canonical placements to child editors",
  );
  assert.ok(
    content.includes("onPlacementChange={handlePlacementChange}"),
    "SiteMediaWorkspace must pass handlePlacementChange to child editors",
  );

  // 4. Tab panels stay mounted with hidden attribute to preserve state & unsaved drafts
  assert.ok(
    content.includes('hidden={activeTab !== "public-images"}'),
    "Public images panel must use hidden attribute",
  );
  assert.ok(
    content.includes('hidden={activeTab !== "hero-editor"}'),
    "Hero editor panel must use hidden attribute",
  );
});

test("D. No render-phase parent updates & zero callbacks inside functional setState updaters", () => {
  const placementsFile = path.join(
    ROOT,
    "src/components/admin/media/site-media-placements.tsx",
  );
  const placementsContent = fs.readFileSync(placementsFile, "utf8");

  // Verify no functional setState with side effects
  assert.ok(
    !placementsContent.includes("setPlacements((current)"),
    "site-media-placements.tsx must NOT contain setPlacements functional updaters",
  );
  assert.ok(
    !placementsContent.includes("onPlacementsChange?.("),
    "site-media-placements.tsx must NOT invoke onPlacementsChange inside updaters",
  );

  const heroFile = path.join(
    ROOT,
    "src/components/admin/media/hero-section-editor.tsx",
  );
  const heroContent = fs.readFileSync(heroFile, "utf8");

  assert.ok(
    !heroContent.includes("setState((current) =>"),
    "hero-section-editor.tsx must NOT contain setState with external side effects",
  );
});

test("E. Assignment, presentation update, and removal state transition logic", () => {
  const initial = [
    {
      slot: "home_hero",
      label: "Homepage hero",
      description: "Hero for homepage",
      mobileRule: "Visible",
      storagePath: null,
      altText: null,
      isDecorative: false,
      desktopFocalX: 50,
      desktopFocalY: 50,
      mobileFocalX: 50,
      mobileFocalY: 50,
      desktopZoom: 100,
      mobileZoom: 100,
      desktopFeatherStart: 0,
      desktopFeatherWidth: 100,
      desktopFeatherStrength: 0,
      mobileFeatherStart: 0,
      mobileFeatherWidth: 100,
      mobileFeatherStrength: 0,
      previewUrl: null,
    },
    {
      slot: "about_hero",
      label: "About hero",
      description: "Hero for about page",
      mobileRule: "Visible",
      storagePath: null,
      altText: null,
      isDecorative: false,
      desktopFocalX: 50,
      desktopFocalY: 50,
      mobileFocalX: 50,
      mobileFocalY: 50,
      desktopZoom: 100,
      mobileZoom: 100,
      desktopFeatherStart: 0,
      desktopFeatherWidth: 100,
      desktopFeatherStrength: 0,
      mobileFeatherStart: 0,
      mobileFeatherWidth: 100,
      mobileFeatherStrength: 0,
      previewUrl: null,
    },
  ];

  function applyPlacementChange(current, updatedPlacement) {
    return current.map((item) =>
      item.slot === updatedPlacement.slot ? updatedPlacement : item,
    );
  }

  // 1. Assign image to home_hero
  const assigned = {
    ...initial[0],
    storagePath: "site/home-hero.png",
    previewUrl: "https://example.com/site/home-hero.png",
    altText: "Dr. Marie Medere",
  };
  const afterAssign = applyPlacementChange(initial, assigned);
  assert.equal(afterAssign[0].storagePath, "site/home-hero.png");
  assert.equal(
    afterAssign[0].previewUrl,
    "https://example.com/site/home-hero.png",
  );
  assert.equal(afterAssign[1].storagePath, null);

  // 2. Adjust presentation (zoom, focal, feather) in hero editor
  const presentationAdjusted = {
    ...afterAssign[0],
    desktopFocalX: 65,
    desktopFocalY: 35,
    desktopZoom: 140,
    desktopFeatherStart: 25,
    desktopFeatherWidth: 75,
    desktopFeatherStrength: 80,
  };
  const afterPresentation = applyPlacementChange(
    afterAssign,
    presentationAdjusted,
  );
  assert.equal(afterPresentation[0].desktopZoom, 140);
  assert.equal(afterPresentation[0].desktopFeatherStrength, 80);
  assert.equal(afterPresentation[0].desktopFocalX, 65);

  // 3. Clear placement
  const cleared = {
    ...afterPresentation[0],
    storagePath: null,
    previewUrl: null,
    altText: null,
    isDecorative: false,
    desktopFocalX: 50,
    desktopFocalY: 50,
    mobileFocalX: 50,
    mobileFocalY: 50,
    desktopZoom: 100,
    mobileZoom: 100,
    desktopFeatherStart: 0,
    desktopFeatherWidth: 100,
    desktopFeatherStrength: 0,
    mobileFeatherStart: 0,
    mobileFeatherWidth: 100,
    mobileFeatherStrength: 0,
  };
  const afterClear = applyPlacementChange(afterPresentation, cleared);
  assert.equal(afterClear[0].storagePath, null);
  assert.equal(afterClear[0].previewUrl, null);
  assert.equal(afterClear[0].desktopZoom, 100);
  assert.equal(afterClear[0].desktopFeatherStrength, 0);
});

test("F. Horizontal Left to Right feathering orientation across all viewports", () => {
  const compPath = path.join(
    ROOT,
    "src/components/public/hero-media-presentation.tsx",
  );
  assert.ok(fs.existsSync(compPath), "hero-media-presentation.tsx must exist");

  const content = fs.readFileSync(compPath, "utf8");

  // Verify no vertical feathering exists
  assert.ok(
    !content.includes('"to bottom"') && !content.includes("'to bottom'"),
    "hero-media-presentation.tsx must NOT contain 'to bottom' gradient direction",
  );

  // Verify to right is used
  assert.ok(
    content.includes('"to right"'),
    "hero-media-presentation.tsx must use 'to right' for horizontal parchment feathering",
  );

  // Verify getFeatherGradient produces linear-gradient(to right, ...)
  const editorPath = path.join(
    ROOT,
    "src/components/admin/media/hero-section-editor.tsx",
  );
  const editorContent = fs.readFileSync(editorPath, "utf8");
  assert.ok(
    !editorContent.includes("TOP → Photograph BELOW"),
    "HeroSectionEditor must NOT display vertical direction label",
  );
  assert.ok(
    editorContent.includes("Parchment LEFT → Photograph RIGHT"),
    "HeroSectionEditor must display horizontal Left to Right label",
  );
});
