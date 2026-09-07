import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveAdminRouteState,
  adminNavItems,
} from "../src/lib/admin/navigation.ts";

test("Admin route resolver maps root /admin to Dashboard", () => {
  const result = resolveAdminRouteState("/admin");
  assert.equal(result.title, "Dashboard");
  assert.equal(result.activeModule, "dashboard");
});

test("Admin route resolver maps /admin/articles without query to Articles", () => {
  const result = resolveAdminRouteState("/admin/articles");
  assert.equal(result.title, "Articles");
  assert.equal(result.activeModule, "articles");
});

test("Admin route resolver maps /admin/articles?status=draft to Drafts", () => {
  const searchParams = new URLSearchParams("status=draft");
  const result = resolveAdminRouteState("/admin/articles", searchParams);
  assert.equal(result.title, "Drafts");
  assert.equal(result.activeModule, "drafts");
});

test("Admin route resolver maps /admin/articles?status=published to Articles", () => {
  const searchParams = new URLSearchParams("status=published");
  const result = resolveAdminRouteState("/admin/articles", searchParams);
  assert.equal(result.title, "Articles");
  assert.equal(result.activeModule, "articles");
});

test("Admin route resolver maps /admin/articles/new to New Article Draft", () => {
  const result = resolveAdminRouteState("/admin/articles/new");
  assert.equal(result.title, "New Article Draft");
  assert.equal(result.activeModule, "articles");
});

test("Admin route resolver maps /admin/articles/[id] to Edit Article Draft", () => {
  const result = resolveAdminRouteState(
    "/admin/articles/4d7cfc5e-8519-4a0b-9ef1-18e3ec8ba28f",
  );
  assert.equal(result.title, "Edit Article Draft");
  assert.equal(result.activeModule, "articles");
});

test("Admin route resolver maps /admin/categories and sub-routes to Categories", () => {
  const root = resolveAdminRouteState("/admin/categories");
  assert.equal(root.title, "Categories");
  assert.equal(root.activeModule, "categories");

  const sub = resolveAdminRouteState("/admin/categories/new");
  assert.equal(sub.title, "Categories");
  assert.equal(sub.activeModule, "categories");
});

test("Admin route resolver maps /admin/media to Media", () => {
  const result = resolveAdminRouteState("/admin/media");
  assert.equal(result.title, "Media");
  assert.equal(result.activeModule, "media");
});

test("Admin route resolver maps /admin/portfolio to Portfolio", () => {
  const result = resolveAdminRouteState("/admin/portfolio");
  assert.equal(result.title, "Portfolio");
  assert.equal(result.activeModule, "portfolio");
});

test("Admin route resolver maps /admin/comments to Comments", () => {
  const result = resolveAdminRouteState("/admin/comments");
  assert.equal(result.title, "Comments");
  assert.equal(result.activeModule, "comments");
});

test("Admin route resolver maps /admin/messages to Messages", () => {
  const result = resolveAdminRouteState("/admin/messages");
  assert.equal(result.title, "Messages");
  assert.equal(result.activeModule, "messages");
});

test("Admin route resolver maps /admin/settings to Settings", () => {
  const result = resolveAdminRouteState("/admin/settings");
  assert.equal(result.title, "Settings");
  assert.equal(result.activeModule, "settings");
});

test("Admin nav items contain all 9 expected modules with truthful routes", () => {
  assert.equal(adminNavItems.length, 9);
  const ids = adminNavItems.map((item) => item.id);
  assert.deepEqual(ids, [
    "dashboard",
    "articles",
    "drafts",
    "categories",
    "media",
    "portfolio",
    "comments",
    "messages",
    "settings",
  ]);

  const draftsItem = adminNavItems.find((item) => item.id === "drafts");
  assert.equal(draftsItem?.href, "/admin/articles?status=draft");
});
