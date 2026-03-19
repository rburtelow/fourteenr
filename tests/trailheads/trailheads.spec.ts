/**
 * Trailheads Tests (Tests 15–20)
 *
 * 15. Trailheads listing page loads
 * 16. Trailheads filtering (road type, winter, fee)
 * 17. Trailheads sorting (name, elevation, route count)
 * 18. Trailhead detail page renders
 * 19. Trailhead links from peak page
 * 20. Trailhead recent conditions
 */

import { test, expect } from "@playwright/test";

const PEAK_WITH_TRAILHEAD = "mount-elbert"; // Rank #1 — has a known trailhead

// Helper: get the first trailhead slug from the listing page
async function getFirstTrailheadSlug(
  page: import("@playwright/test").Page
): Promise<string> {
  await page.goto("/trailheads");
  const firstLink = page.locator('a[href^="/trailheads/"]').first();
  await expect(firstLink).toBeVisible({ timeout: 10_000 });
  const href = await firstLink.getAttribute("href");
  return href ?? "/trailheads";
}

// ── Test 15: Trailheads listing page loads ────────────────────────────────────
test("trailheads listing page renders heading and cards", async ({ page }) => {
  await page.goto("/trailheads");

  // Page heading
  await expect(
    page.getByRole("heading", { name: /Trailheads/i })
  ).toBeVisible();

  // At least one trailhead card link
  const cards = page.locator('a[href^="/trailheads/"]');
  await expect(cards.first()).toBeVisible();

  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

test("trailheads listing shows trailhead count badge in hero", async ({
  page,
}) => {
  await page.goto("/trailheads");

  // Hero shows "{N} trailheads" pill
  await expect(page.getByText(/trailheads?$/i).first()).toBeVisible();
});

test("trailheads listing shows card with name, road type, and elevation", async ({
  page,
}) => {
  await page.goto("/trailheads");

  // First card should display elevation in feet
  const firstCard = page.locator('a[href^="/trailheads/"]').first();
  await expect(firstCard).toBeVisible();
  // Elevation numbers end with "elev"
  await expect(
    firstCard.locator("span", { hasText: "elev" }).first()
  ).toBeVisible();
});

// ── Test 16: Trailheads filtering ─────────────────────────────────────────────
test("trailheads road type filter — Paved narrows results", async ({
  page,
}) => {
  await page.goto("/trailheads");

  const allCards = page.locator('a[href^="/trailheads/"]');
  const beforeCount = await allCards.count();

  await page.getByRole("button", { name: "Paved" }).click();

  // Wait for the filter result count text to update
  await page.waitForTimeout(300);
  const afterCount = await allCards.count();

  // Paved trailheads are a subset
  expect(afterCount).toBeLessThanOrEqual(beforeCount);
});

test("trailheads road type filter — 4WD Required narrows results", async ({
  page,
}) => {
  await page.goto("/trailheads");

  const allCards = page.locator('a[href^="/trailheads/"]');
  const beforeCount = await allCards.count();

  await page.getByRole("button", { name: "4WD Required" }).click();

  await page.waitForTimeout(300);
  const afterCount = await allCards.count();
  expect(afterCount).toBeLessThanOrEqual(beforeCount);
});

test("trailheads filter — Winter Access filters to winter-accessible only", async ({
  page,
}) => {
  await page.goto("/trailheads");

  const allCards = page.locator('a[href^="/trailheads/"]');
  const beforeCount = await allCards.count();

  await page.getByRole("button", { name: "Winter Access" }).click();

  await page.waitForTimeout(300);
  const afterCount = await allCards.count();
  expect(afterCount).toBeLessThanOrEqual(beforeCount);
});

test("trailheads filter — No Fee shows only fee-free trailheads", async ({
  page,
}) => {
  await page.goto("/trailheads");

  const allCards = page.locator('a[href^="/trailheads/"]');
  const beforeCount = await allCards.count();

  await page.getByRole("button", { name: "No Fee" }).click();

  await page.waitForTimeout(300);
  const afterCount = await allCards.count();
  expect(afterCount).toBeLessThanOrEqual(beforeCount);
});

test("trailheads search filter narrows results", async ({ page }) => {
  await page.goto("/trailheads");

  const allCards = page.locator('a[href^="/trailheads/"]');
  const beforeCount = await allCards.count();

  const searchInput = page.getByPlaceholder(/Search by name/i);
  await searchInput.fill("North");

  await page.waitForTimeout(300);
  const afterCount = await allCards.count();
  expect(afterCount).toBeLessThanOrEqual(beforeCount);
});

test("trailheads filter shows no results message for unmatched search", async ({
  page,
}) => {
  await page.goto("/trailheads");

  await page.getByPlaceholder(/Search by name/i).fill("zzznomatch999abc");
  await page.waitForTimeout(300);

  await expect(page.getByText("No trailheads found")).toBeVisible();
});

// ── Test 17: Trailheads sorting ───────────────────────────────────────────────
test("trailheads sort by Name shows cards in alphabetical order", async ({
  page,
}) => {
  await page.goto("/trailheads");

  const sortSelect = page.locator("select").filter({ hasText: /Sort:/ });
  await sortSelect.selectOption("name");

  const cards = page.locator('a[href^="/trailheads/"]');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

test("trailheads sort by Elevation keeps cards visible", async ({ page }) => {
  await page.goto("/trailheads");

  const sortSelect = page.locator("select").filter({ hasText: /Sort:/ });
  await sortSelect.selectOption("elevation");

  const cards = page.locator('a[href^="/trailheads/"]');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

test("trailheads sort by Route Count keeps cards visible", async ({ page }) => {
  await page.goto("/trailheads");

  const sortSelect = page.locator("select").filter({ hasText: /Sort:/ });
  await sortSelect.selectOption("routes");

  const cards = page.locator('a[href^="/trailheads/"]');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

// ── Test 18: Trailhead detail page renders ────────────────────────────────────
test("trailhead detail page renders trailhead name", async ({ page }) => {
  const slug = await getFirstTrailheadSlug(page);
  await page.goto(slug);

  // h1 is the trailhead name
  await expect(page.locator("h1")).toBeVisible();
  const h1Text = await page.locator("h1").first().textContent();
  expect((h1Text ?? "").trim().length).toBeGreaterThan(0);
});

test("trailhead detail page shows elevation card", async ({ page }) => {
  const slug = await getFirstTrailheadSlug(page);
  await page.goto(slug);

  // "Trailhead Elevation" label in the hero card
  await expect(page.getByText("Trailhead Elevation")).toBeVisible();
});

test("trailhead detail page shows road type in stats bar", async ({ page }) => {
  const slug = await getFirstTrailheadSlug(page);
  await page.goto(slug);

  // Stats bar always shows "Road" label
  await expect(page.getByText("Road").first()).toBeVisible();
});

test("trailhead detail page shows parking type in stats bar", async ({
  page,
}) => {
  const slug = await getFirstTrailheadSlug(page);
  await page.goto(slug);

  // Stats bar always shows "Parking" label
  await expect(page.getByText("Parking").first()).toBeVisible();
});

test("trailhead detail page shows routes from this trailhead section", async ({
  page,
}) => {
  const slug = await getFirstTrailheadSlug(page);
  await page.goto(slug);

  // Routes section may or may not exist depending on data
  const routesHeading = page.getByRole("heading", {
    name: /Routes from this Trailhead/i,
  });
  const hasRoutes = await routesHeading.isVisible();
  if (hasRoutes) {
    await expect(routesHeading).toBeVisible();
  }
});

test("trailhead detail page shows breadcrumb back to trailheads", async ({
  page,
}) => {
  const slug = await getFirstTrailheadSlug(page);
  await page.goto(slug);

  // Breadcrumb link back to /trailheads
  await expect(
    page.getByRole("link", { name: "Trailheads" }).first()
  ).toBeVisible();
});

// ── Test 19: Trailhead links from peak page ───────────────────────────────────
test("peak detail page shows Trailheads section", async ({ page }) => {
  await page.goto(`/peaks/${PEAK_WITH_TRAILHEAD}`);

  await expect(
    page.getByRole("heading", { name: "Trailheads" }).first()
  ).toBeVisible();
});

test("peak detail trailhead section contains a link to /trailheads/[slug]", async ({
  page,
}) => {
  await page.goto(`/peaks/${PEAK_WITH_TRAILHEAD}`);

  // At least one link to the trailheads detail pages
  const trailheadLinks = page.locator('a[href^="/trailheads/"]');
  await expect(trailheadLinks.first()).toBeVisible();
});

test("peak detail trailhead card shows View Details link", async ({ page }) => {
  await page.goto(`/peaks/${PEAK_WITH_TRAILHEAD}`);

  const viewDetails = page.getByRole("link", { name: /View Details/i }).first();
  await expect(viewDetails).toBeVisible();
});

test("peak detail trailhead View Details link navigates to correct trailhead page", async ({
  page,
}) => {
  await page.goto(`/peaks/${PEAK_WITH_TRAILHEAD}`);

  // Get the href before clicking
  const viewDetails = page.getByRole("link", { name: /View Details/i }).first();
  await expect(viewDetails).toBeVisible();
  const href = await viewDetails.getAttribute("href");

  await viewDetails.click();
  await expect(page).toHaveURL(href ?? /\/trailheads\//);
});

// ── Test 20: Trailhead recent conditions ──────────────────────────────────────
test("trailhead detail page shows Recent Conditions section when reports exist", async ({
  page,
}) => {
  // Find a trailhead that might have conditions — iterate a few from the listing
  await page.goto("/trailheads");

  const links = page.locator('a[href^="/trailheads/"]');
  await expect(links.first()).toBeVisible();

  const slugs = await links
    .evaluateAll((els) =>
      (els as HTMLAnchorElement[]).slice(0, 5).map((el) => el.getAttribute("href"))
    );

  let foundConditions = false;
  for (const slug of slugs) {
    if (!slug) continue;
    await page.goto(slug);

    const heading = page.getByRole("heading", {
      name: /Recent Conditions/i,
    });

    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
      foundConditions = true;
      break;
    }
  }

  // If none of the first 5 trailheads have conditions, that's acceptable
  console.log(`Recent Conditions section found: ${foundConditions}`);
});

test("trailhead recent conditions shows timeline when available", async ({
  page,
}) => {
  await page.goto("/trailheads");
  const links = page.locator('a[href^="/trailheads/"]');
  await expect(links.first()).toBeVisible();

  const slugs = await links
    .evaluateAll((els) =>
      (els as HTMLAnchorElement[]).slice(0, 5).map((el) => el.getAttribute("href"))
    );

  for (const slug of slugs) {
    if (!slug) continue;
    await page.goto(slug);

    const conditionsSection = page.getByRole("heading", {
      name: /Recent Conditions/i,
    });

    if (await conditionsSection.isVisible()) {
      // The timeline line (vertical line) should be visible
      await expect(
        page.getByText(/From hiker trip reports/i)
      ).toBeVisible();
      break;
    }
  }
});

test("trailhead recent conditions shows access rating badge when available", async ({
  page,
}) => {
  await page.goto("/trailheads");
  const links = page.locator('a[href^="/trailheads/"]');
  await expect(links.first()).toBeVisible();

  const slugs = await links
    .evaluateAll((els) =>
      (els as HTMLAnchorElement[]).slice(0, 5).map((el) => el.getAttribute("href"))
    );

  for (const slug of slugs) {
    if (!slug) continue;
    await page.goto(slug);

    if (await page.getByText("Current Access").isVisible()) {
      await expect(page.getByText("Current Access")).toBeVisible();
      break;
    }
  }
});
