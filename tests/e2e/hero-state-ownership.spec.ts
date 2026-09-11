import { test, expect } from "@playwright/test";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import {
  SYNTHETIC_ADMIN_EMAIL,
  SYNTHETIC_ADMIN_PASSWORD,
} from "./helpers/auth";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Site Media Workspace State Ownership & Zero Console Error Regression", () => {
  test("Exercises tab switching, presentation adjustments, and validates zero React state ownership errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const forbiddenPatterns = [
      /Cannot update a component .* while rendering a different component/,
      /Maximum update depth exceeded/,
      /Hydration failed/,
      /Text content does not match server-rendered HTML/,
    ];

    page.on("console", (msg) => {
      const text = msg.text();
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(text)) {
          consoleErrors.push(`[Console ${msg.type()}]: ${text}`);
        }
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(`[PageError]: ${err.message}`);
    });

    // 1. Login
    await page.goto("/admin/login");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("#admin-email").fill(SYNTHETIC_ADMIN_EMAIL);
    await page.locator("#admin-password").fill(SYNTHETIC_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL((url) => url.pathname === "/admin", {
      timeout: 15000,
    });

    // 2. Open /admin/media
    await page.goto("/admin/media");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/admin\/media/);
    await expect(
      page.getByRole("heading", { name: "Media Workspace" }),
    ).toBeVisible();

    // 3. Tab handles
    const publicImagesTab = page.getByRole("tab", {
      name: /Public Image Editor/i,
    });
    const heroEditorTab = page.getByRole("tab", {
      name: /Hero Section Editor/i,
    });

    // Public Image Editor is initially selected
    await expect(publicImagesTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-public-images")).not.toHaveAttribute(
      "hidden",
    );
    await expect(page.locator("#panel-hero-editor")).toHaveAttribute(
      "hidden",
      "",
    );

    // 4. Switch to Hero Section Editor
    await heroEditorTab.click();
    await expect(heroEditorTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-hero-editor")).not.toHaveAttribute(
      "hidden",
    );
    await expect(page.locator("#panel-public-images")).toHaveAttribute(
      "hidden",
      "",
    );

    // Verify slot selector buttons
    const homeHeroBtn = page.getByRole("button", { name: /Homepage/i });
    const aboutHeroBtn = page.getByRole("button", { name: /About/i });
    await expect(homeHeroBtn).toBeVisible();
    await expect(aboutHeroBtn).toBeVisible();

    // Switch to About hero slot
    await aboutHeroBtn.click();
    await expect(aboutHeroBtn).toHaveAttribute("aria-pressed", "true");

    // Switch back to Homepage hero slot
    await homeHeroBtn.click();
    await expect(homeHeroBtn).toHaveAttribute("aria-pressed", "true");

    // 5. If homepage has an assigned image, adjust presentation and save
    const saveButton = page.getByRole("button", {
      name: /Save Presentation/i,
    });

    if (await saveButton.isVisible()) {
      // Switch mode to feather
      const featherModeBtn = page.getByRole("button", {
        name: /Parchment Feather/i,
      });
      if (await featherModeBtn.isVisible()) {
        await featherModeBtn.click();
        await expect(
          page.getByText(/Parchment LEFT → Photograph RIGHT/i),
        ).toBeVisible();
      }

      // Adjust feather strength slider if available
      const featherSlider = page.locator("#desktop-feather-strength");
      if (await featherSlider.isVisible()) {
        await featherSlider.fill("20");
        await featherSlider.dispatchEvent("change");

        // Save Presentation
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // Expect success status
        await expect(
          page.getByText(/Saved presentation settings for/i),
        ).toBeVisible({ timeout: 10000 });
      }
    }

    // 6. Switch back to Public Image Editor
    await publicImagesTab.click();
    await expect(publicImagesTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-public-images")).not.toHaveAttribute(
      "hidden",
    );
    await expect(page.locator("#panel-hero-editor")).toHaveAttribute(
      "hidden",
      "",
    );

    // 7. Switch back to Hero Section Editor again
    await heroEditorTab.click();
    await expect(heroEditorTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-hero-editor")).not.toHaveAttribute(
      "hidden",
    );

    // 8. Assert ZERO state ownership errors or forbidden console errors occurred
    expect(consoleErrors).toEqual([]);
  });
});
