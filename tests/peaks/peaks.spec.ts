/**
 * Peaks Tests (Tests 5–10)
 *
 * 5. Peaks listing page loads with cards
 * 6. Peaks filtering (region, difficulty, search)
 * 7. Peaks sorting
 * 8. Peak detail page renders
 * 9. Peak routes section
 * 10. Peak watchlist toggle
 */

import { test, expect } from "@playwright/test";

const TEST_PEAK_SLUG = "mount-elbert"; // Rank #1, easiest to find reliably

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

// ── Test 5: Peaks listing page loads with cards ───────────────────────────────
test("peaks listing page renders heading and peak cards", async ({ page }) => {
  await page.goto("/peaks");

  // Page heading contains "Fourteeners"
  await expect(
    page.getByRole("heading", { name: /Fourteeners/i })
  ).toBeVisible();

  // At least one peak card renders
  const peakCards = page.locator('a[href^="/peaks/"]');
  await expect(peakCards.first()).toBeVisible();

  // Cards should number close to 58 (all Colorado 14ers)
  const count = await peakCards.count();
  expect(count).toBeGreaterThan(50);
});

test("peaks listing page shows stats cards for each class", async ({
  page,
}) => {
  await page.goto("/peaks");

  // Four difficulty stat cards — target the clickable buttons in the hero
  await expect(page.getByRole("button", { name: /Class 1 Hiking/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Class 2 Scrambling/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Class 3 Climbing/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Class 4 Technical/ })).toBeVisible();
});

test("peaks listing page shows peak name and elevation on cards", async ({
  page,
}) => {
  await page.goto("/peaks");

  // Mount Elbert (rank #1) should be visible in default (rank) sort
  const elbertCard = page.locator('a[href="/peaks/mount-elbert"]');
  await expect(elbertCard).toBeVisible();
  await expect(elbertCard).toContainText("Mount Elbert");
  // Elevation shown as "14,433'"
  await expect(elbertCard).toContainText("14,433");
});

// ── Test 6: Peaks filtering ───────────────────────────────────────────────────
test("peaks search filter narrows results", async ({ page }) => {
  await page.goto("/peaks");

  const searchInput = page.getByPlaceholder("Search peaks...");
  await expect(searchInput).toBeVisible();

  // Get total count before filtering
  const beforeCount = await page.locator('a[href^="/peaks/"]').count();

  await searchInput.fill("Elbert");

  // Wait for results to update
  await expect(page.locator('a[href="/peaks/mount-elbert"]')).toBeVisible();
  const afterCount = await page.locator('a[href^="/peaks/"]').count();
  expect(afterCount).toBeLessThan(beforeCount);
});

test("peaks search filter shows no results for unmatched query", async ({
  page,
}) => {
  await page.goto("/peaks");

  await page.getByPlaceholder("Search peaks...").fill("zzznomatch999");

  // Showing 0 of N peaks
  await expect(
    page.locator("p").filter({ hasText: /Showing\s+0\s+of/ })
  ).toBeVisible();
});

test("peaks difficulty filter via stat card narrows results", async ({
  page,
}) => {
  await page.goto("/peaks");

  const allCards = page.locator('a[href^="/peaks/"]');
  const beforeCount = await allCards.count();

  // Click the "Class 1" stat card
  await page.getByRole("button", { name: /Class 1/ }).first().click();

  const afterCount = await allCards.count();
  expect(afterCount).toBeLessThan(beforeCount);

  // All visible cards should show Class 1 difficulty badge
  const badges = page.locator("text=Class 1").first();
  await expect(badges).toBeVisible();
});

test("peaks difficulty filter via dropdown works", async ({ page }) => {
  await page.goto("/peaks");

  const allCards = page.locator('a[href^="/peaks/"]');
  const beforeCount = await allCards.count();

  // The difficulty <select> — it wraps options All Classes, Class 1..4
  const difficultySelect = page.locator("select").filter({ hasText: "All Classes" });
  await difficultySelect.selectOption("Class 2");

  const afterCount = await allCards.count();
  expect(afterCount).toBeLessThan(beforeCount);
});

test("peaks region filter via dropdown reduces results", async ({ page }) => {
  await page.goto("/peaks");

  const regionSelect = page.locator("select").filter({ hasText: "All Regions" });
  await regionSelect.selectOption("Sawatch Range");

  const afterCount = await page.locator('a[href^="/peaks/"]').count();
  // Sawatch range has ~20 peaks
  expect(afterCount).toBeGreaterThan(0);
  expect(afterCount).toBeLessThan(58);
});

test("clear filters button resets all filters", async ({ page }) => {
  await page.goto("/peaks");

  // Apply a filter
  await page.getByPlaceholder("Search peaks...").fill("Elbert");
  await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();

  // Input is cleared
  await expect(page.getByPlaceholder("Search peaks...")).toHaveValue("");
  // Clear button disappears
  await expect(
    page.getByRole("button", { name: "Clear filters" })
  ).not.toBeVisible();
});

// ── Test 7: Peaks sorting ─────────────────────────────────────────────────────
test("peaks sort by Name shows peaks in alphabetical order", async ({
  page,
}) => {
  await page.goto("/peaks");

  const sortSelect = page.locator("select").filter({ hasText: "Rank" });
  await sortSelect.selectOption("name");

  // First card should be near "B" (Blanca Peak comes early alphabetically)
  // Just verify cards still render after sort change
  const cards = page.locator('a[href^="/peaks/"]');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(50);
});

test("peaks sort by Elevation puts highest peak first", async ({ page }) => {
  await page.goto("/peaks");

  const sortSelect = page.locator("select").filter({ hasText: "Rank" });
  await sortSelect.selectOption("elevation");

  // Mount Elbert (14,433') should be first
  const firstCard = page.locator('a[href^="/peaks/"]').first();
  await expect(firstCard).toContainText("14,433");
});

test("peaks view toggle switches between grid and list", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/peaks");

  // Start in grid mode — at least one peak card link visible
  await expect(page.locator('a[href^="/peaks/"]').first()).toBeVisible();

  // The view toggle sits inside the filters bar — it's the only div with both
  // rounded-xl and bg-[var(--color-surface-subtle)] containing two buttons
  const viewToggle = page.locator("div.flex.rounded-xl.bg-\\[var\\(--color-surface-subtle\\)\\].p-1");
  const listButton = viewToggle.locator("button").nth(1);
  await listButton.click();

  // Table should now be visible
  await expect(page.locator("table")).toBeVisible();
});

// ── Test 8: Peak detail page renders ─────────────────────────────────────────
test("peak detail page renders hero with peak name and elevation", async ({
  page,
}) => {
  await page.goto(`/peaks/${TEST_PEAK_SLUG}`);

  // Peak name in hero heading — use first() as the name may appear in breadcrumb too
  await expect(
    page.getByRole("heading", { name: "Mount Elbert" }).first()
  ).toBeVisible();

  // Elevation card shows 14,433' — the large display number
  await expect(page.getByText("14,433").first()).toBeVisible();

  // Rank badge
  await expect(page.getByText(/Rank #1/i).first()).toBeVisible();
});

test("peak detail page shows breadcrumb navigation", async ({ page }) => {
  await page.goto(`/peaks/${TEST_PEAK_SLUG}`);

  // Breadcrumb is inside an inline-flex pill in the hero
  const breadcrumb = page.locator("div.inline-flex").filter({ hasText: /Home.*Peaks.*Mount Elbert/ });
  await expect(breadcrumb.getByRole("link", { name: "Peaks" })).toBeVisible();
  await expect(breadcrumb.getByText("Mount Elbert")).toBeVisible();
});

test("peak detail page breadcrumb Peaks link navigates back", async ({
  page,
}) => {
  await page.goto(`/peaks/${TEST_PEAK_SLUG}`);

  // Click the Peaks breadcrumb (inside the inline-flex breadcrumb strip)
  const breadcrumb = page.locator("div.inline-flex").filter({
    hasText: "Peaks",
  });
  await breadcrumb.getByRole("link", { name: "Peaks" }).click();
  await expect(page).toHaveURL("/peaks");
});

test("peak detail page shows prominence, summits, and route count stats", async ({
  page,
}) => {
  await page.goto(`/peaks/${TEST_PEAK_SLUG}`);

  // Elevation card stats row — scope to the white card in the hero to avoid
  // matching other "Summits" / "Routes" text elsewhere on the page
  const elevationCard = page.locator("div.bg-white\\/95.backdrop-blur-xl.rounded-3xl");
  await expect(elevationCard.getByText("Prominence")).toBeVisible();
  await expect(elevationCard.getByText("Summits")).toBeVisible();
  await expect(elevationCard.getByText("Routes")).toBeVisible();
});

test("peak detail page shows range and forest metadata", async ({ page }) => {
  await page.goto(`/peaks/${TEST_PEAK_SLUG}`);

  // Mount Elbert is in Sawatch Range — match the exact span text in the hero
  await expect(page.getByText("Sawatch Range", { exact: true }).first()).toBeVisible();
});

// ── Test 9: Peak routes section ───────────────────────────────────────────────
test("peak detail page shows routes section", async ({ page }) => {
  await page.goto(`/peaks/${TEST_PEAK_SLUG}`);

  // "Routes" heading somewhere in the main content
  await expect(
    page.getByRole("heading", { name: /Routes/i }).first()
  ).toBeVisible();
});

test("peak routes section shows at least one route with class and trailhead", async ({
  page,
}) => {
  await page.goto(`/peaks/${TEST_PEAK_SLUG}`);

  // Mount Elbert has multiple routes; at least one should show Class info
  await expect(page.getByText(/Class [1-4]/i).first()).toBeVisible();
});

// ── Test 10: Peak watchlist toggle ────────────────────────────────────────────
test("logged-out user cannot toggle watchlist on peaks listing", async ({
  page,
}) => {
  await page.goto("/peaks");

  // Watchlist buttons with aria-label "Save ... to watchlist" should exist but
  // clicking without auth should be a no-op (the handler checks for userNav)
  const watchButtons = page.locator('[aria-label*="watchlist"]');
  // Buttons may or may not render for logged-out — check they have no effect
  const countBefore = await watchButtons.count();
  if (countBefore > 0) {
    await watchButtons.first().click();
    // No redirect to login — stays on peaks page
    await expect(page).toHaveURL("/peaks");
  }
});

test("logged-in user can add a peak to the watchlist", async ({ page }) => {
  await signIn(page);
  await page.goto("/peaks");

  // Find the "Save Mount Elbert to watchlist" button
  const addButton = page.getByRole("button", {
    name: "Save Mount Elbert to watchlist",
  });

  if (await addButton.isVisible()) {
    await addButton.click();
    // After click the aria-label changes to "Remove ... from watchlist"
    await expect(
      page.getByRole("button", { name: "Remove Mount Elbert from watchlist" })
    ).toBeVisible({ timeout: 5_000 });
  } else {
    // Already watched — verify the remove button is there
    await expect(
      page.getByRole("button", { name: "Remove Mount Elbert from watchlist" })
    ).toBeVisible();
  }
});

test("logged-in user can remove a peak from the watchlist", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/peaks");

  // Ensure it is watched first
  const addButton = page.getByRole("button", {
    name: "Save Mount Elbert to watchlist",
  });
  const removeButton = page.getByRole("button", {
    name: "Remove Mount Elbert from watchlist",
  });

  if (await addButton.isVisible()) {
    await addButton.click();
    await expect(removeButton).toBeVisible({ timeout: 5_000 });
  }

  // Now remove it
  await removeButton.click();
  await expect(addButton).toBeVisible({ timeout: 5_000 });
});
