import { test, expect } from "@playwright/test";
import { ensureLocalSupabaseTarget } from "./helpers/local-only";
import {
  SYNTHETIC_ADMIN_EMAIL,
  SYNTHETIC_ADMIN_PASSWORD,
} from "./helpers/auth";

test.beforeAll(() => {
  ensureLocalSupabaseTarget();
});

test.describe("Local Authentication Recovery & Hero Section Editor Review E2E", () => {
  test("Complete admin authentication lifecycle and Hero Section Editor workspace verification", async ({
    page,
  }) => {
    // 1. Open /admin/login
    await page.goto("/admin/login");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("#admin-email")).toBeVisible();
    await expect(page.locator("#admin-password")).toBeVisible();

    // 2. Login with local synthetic admin
    await page.locator("#admin-email").fill(SYNTHETIC_ADMIN_EMAIL);
    await page.locator("#admin-password").fill(SYNTHETIC_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    // 3. Confirm redirect -> /admin
    await page.waitForURL((url) => url.pathname === "/admin", {
      timeout: 15000,
    });
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // 4. Refresh /admin
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // 5. Session remains valid
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // 6. Navigate to /admin/media
    await page.goto("/admin/media");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/admin\/media/);
    await expect(
      page.getByRole("heading", { name: "Media Workspace" }),
    ).toBeVisible();

    // 7. Verify both workspace tabs: Public Image Editor and Hero Section Editor
    const publicImagesTab = page.getByRole("tab", {
      name: /Public Image Editor/i,
    });
    const heroEditorTab = page.getByRole("tab", {
      name: /Hero Section Editor/i,
    });

    await expect(publicImagesTab).toBeVisible();
    await expect(heroEditorTab).toBeVisible();
    await expect(publicImagesTab).toHaveAttribute("aria-selected", "true");

    // Click Hero Section Editor tab
    await heroEditorTab.click();
    await expect(heroEditorTab).toHaveAttribute("aria-selected", "true");

    // Verify hero slots navigation
    await expect(page.getByRole("button", { name: /Homepage/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /About/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Portfolio/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Contact/i })).toBeVisible();

    // Switch between hero slots
    await page.getByRole("button", { name: /About/i }).click();
    await expect(page.getByRole("button", { name: /About/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("button", { name: /Homepage/i }).click();
    await expect(
      page.getByRole("button", { name: /Homepage/i }),
    ).toHaveAttribute("aria-pressed", "true");

    // 8. Logout via Sign out button
    const logoutButton = page.locator('button[aria-label="Sign out"]').first();
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);

    // 9. Unauthenticated visit to /admin redirects back to /admin/login
    await page.goto("/admin");
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);

    // 10. Login again succeeds
    await page.locator("#admin-email").fill(SYNTHETIC_ADMIN_EMAIL);
    await page.locator("#admin-password").fill(SYNTHETIC_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL((url) => url.pathname === "/admin", {
      timeout: 15000,
    });
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
  });
});
