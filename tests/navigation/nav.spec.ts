/**
 * Navigation & Layout Tests (Tests 1–4)
 *
 * 1. Nav links render and route correctly
 * 2. Mobile nav opens/closes
 * 3. Auth-gated nav items (logged-out vs logged-in)
 * 4. Global search opens and accepts input
 */

import { test, expect } from "@playwright/test";

// Helper: sign in as the primary test user
async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.fill("#email", "rburtelow@gmail.com");
  await page.fill("#password", "Test1234!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth"), {
    timeout: 15_000,
  });
}

// ── Test 1: Nav links render and route correctly ──────────────────────────────
test("nav links render and route correctly", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // Sign in so all links (including Community) are accessible
  await signIn(page);

  const nav = page.locator("header nav");

  // All links present for logged-in user
  await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Peaks" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Trailheads" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Community" })).toBeVisible();

  // Navigate to Peaks
  await nav.getByRole("link", { name: "Peaks" }).click();
  await expect(page).toHaveURL("/peaks");

  // Navigate to Trailheads
  await nav.getByRole("link", { name: "Trailheads" }).click();
  await expect(page).toHaveURL("/trailheads");

  // Navigate to Community
  await nav.getByRole("link", { name: "Community" }).click();
  await expect(page).toHaveURL("/community");

  // Navigate back Home via logo link in the header
  await page.getByRole("banner").getByRole("link", { name: "My14er" }).click();
  await expect(page).toHaveURL("/");
});

// ── Test 2: Mobile nav opens/closes ──────────────────────────────────────────
test("mobile nav opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone SE
  await page.goto("/");

  const hamburger = page.getByRole("button", { name: "Toggle menu" });
  await expect(hamburger).toBeVisible();

  // Menu should start closed (pointer-events-none / opacity-0)
  const mobileMenu = page.locator("div.fixed.top-20");
  await expect(mobileMenu).toHaveClass(/opacity-0/);

  // Open the menu
  await hamburger.click();
  await expect(mobileMenu).toHaveClass(/opacity-100/);

  // Mobile menu links are visible
  await expect(mobileMenu.getByRole("link", { name: "Peaks" })).toBeVisible();
  await expect(
    mobileMenu.getByRole("link", { name: "Community" })
  ).toBeVisible();

  // Close by clicking the hamburger again — use force because the backdrop
  // overlay (z-40) can intercept pointer events even though the button is in
  // the header (z-50); force bypasses the interception check.
  await hamburger.click({ force: true });
  await expect(mobileMenu).toHaveClass(/opacity-0/);
});

test("mobile nav closes when backdrop is clicked", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await page.getByRole("button", { name: "Toggle menu" }).click();
  const mobileMenu = page.locator("div.fixed.top-20");
  await expect(mobileMenu).toHaveClass(/opacity-100/);

  // Click the backdrop
  const backdrop = page.locator("div.fixed.inset-0.bg-black\\/20");
  await backdrop.click();
  await expect(mobileMenu).toHaveClass(/opacity-0/);
});

test("mobile nav links navigate correctly", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await page.getByRole("button", { name: "Toggle menu" }).click();
  const mobileMenu = page.locator("div.fixed.top-20");

  await mobileMenu.getByRole("link", { name: "Peaks" }).click();
  await expect(page).toHaveURL("/peaks");
});

// ── Test 3: Auth-gated nav items ──────────────────────────────────────────────
test("logged-out users do not see Events or Groups in desktop nav", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const nav = page.locator("header nav");
  await expect(nav.getByRole("link", { name: "Events" })).not.toBeVisible();
  await expect(nav.getByRole("link", { name: "Groups" })).not.toBeVisible();
});

test("logged-out users do not see Events or Groups in mobile nav", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await page.getByRole("button", { name: "Toggle menu" }).click();
  const mobileMenu = page.locator("div.fixed.top-20");

  await expect(
    mobileMenu.getByRole("link", { name: "Events" })
  ).not.toBeVisible();
  await expect(
    mobileMenu.getByRole("link", { name: "Groups" })
  ).not.toBeVisible();
});

test("logged-in users see Events and Groups in desktop nav", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await signIn(page);
  await page.goto("/");

  const nav = page.locator("header nav");
  await expect(nav.getByRole("link", { name: "Events" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Groups" })).toBeVisible();
});

test("logged-in users see Events and Groups in mobile nav", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Toggle menu" }).click();
  const mobileMenu = page.locator("div.fixed.top-20");

  await expect(
    mobileMenu.getByRole("link", { name: "Events" })
  ).toBeVisible();
  await expect(
    mobileMenu.getByRole("link", { name: "Groups" })
  ).toBeVisible();
});

// ── Test 4: Global search opens and accepts input ─────────────────────────────
test("global search button opens search panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  // The search trigger button
  const searchButton = page.getByRole("button", { name: "Search groups" });
  await expect(searchButton).toBeVisible();

  // Dropdown not shown initially
  const searchDropdown = page.locator(
    "div.absolute.right-0.top-full.w-80.bg-white"
  );
  await expect(searchDropdown).not.toBeVisible();

  // Open it
  await searchButton.click();
  await expect(searchDropdown).toBeVisible();
});

test("global search accepts text input and shows results area", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await page.getByRole("button", { name: "Search groups" }).click();

  const searchDropdown = page.locator(
    "div.absolute.right-0.top-full.w-80.bg-white"
  );
  const input = searchDropdown.locator("input");
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();

  // Type a query
  await input.fill("Elbert");
  // Input value is accepted
  await expect(input).toHaveValue("Elbert");
});

test("global search closes on outside click", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await page.getByRole("button", { name: "Search groups" }).click();
  const searchDropdown = page.locator(
    "div.absolute.right-0.top-full.w-80.bg-white"
  );
  await expect(searchDropdown).toBeVisible();

  // Click outside
  await page.locator("body").click({ position: { x: 100, y: 400 } });
  await expect(searchDropdown).not.toBeVisible();
});
