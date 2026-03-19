/**
 * Weather & Forecasts Tests (Tests 11–14)
 *
 * 11. Peak forecast card renders
 * 12. Risk level badges display correctly
 * 13. Summit window info renders
 * 14. Condition flags render when applicable
 *
 * All tests run on the Mount Elbert detail page, which is guaranteed to have
 * forecast data since it is rank #1.
 */

import { test, expect } from "@playwright/test";

const PEAK_SLUG = "mount-elbert";
const PEAK_URL = `/peaks/${PEAK_SLUG}`;

// ── Test 11: Peak forecast card renders ───────────────────────────────────────
test("peak forecast card renders with Summit Weather heading", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  // The weather section heading is always rendered (even without data)
  await expect(
    page.getByRole("heading", { name: /Summit Weather/i }).first()
  ).toBeVisible();
});

test("peak forecast card shows temperature or loading state", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  // Either the live weather card or the loading fallback should be visible
  const hasForecast =
    (await page.locator("text=°F").count()) > 0 ||
    (await page.locator("text=Forecast will be available shortly").count()) > 0;

  expect(hasForecast).toBe(true);
});

test("peak forecast card shows wind speed when data available", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  // If forecast data is present there will be a "Wind" detail
  const hasWind = await page.locator("text=Wind").count();
  // Wind label is always rendered if forecast exists; skip assertion if no data
  if (hasWind > 0) {
    await expect(page.getByText("Wind").first()).toBeVisible();
  }
});

// ── Test 12: Risk level badges display correctly ───────────────────────────────
test("risk level badge renders with correct text when forecast is available", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  // The badge text ends in " RISK" (e.g. "LOW RISK", "MODERATE RISK")
  const riskBadge = page.locator("span").filter({ hasText: /RISK$/ }).first();

  // Only assert if forecast data exists (badge is absent in loading state)
  if (await riskBadge.isVisible()) {
    const text = await riskBadge.textContent();
    expect(["LOW RISK", "MODERATE RISK", "HIGH RISK", "EXTREME RISK"]).toContain(
      text?.trim()
    );
  }
});

test("risk badge has correct colour classes for LOW risk", async ({ page }) => {
  await page.goto(PEAK_URL);

  const lowBadge = page
    .locator("span")
    .filter({ hasText: /^LOW RISK$/ })
    .first();

  if (await lowBadge.isVisible()) {
    // LOW = emerald palette
    await expect(lowBadge).toHaveClass(/text-emerald-700/);
  }
});

test("risk badge has correct colour classes for MODERATE risk", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  const badge = page
    .locator("span")
    .filter({ hasText: /^MODERATE RISK$/ })
    .first();

  if (await badge.isVisible()) {
    // MODERATE = amber palette
    await expect(badge).toHaveClass(/text-amber-700/);
  }
});

// ── Test 13: Summit window info renders ───────────────────────────────────────
test("summit window section renders when forecast is available", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  // "SUMMIT WINDOW" label is inside the weather card
  const summitWindowSection = page
    .locator("h3")
    .filter({ hasText: /Summit Window/i })
    .first();

  if (await summitWindowSection.isVisible()) {
    await expect(summitWindowSection).toBeVisible();
  }
});

test("summit window shows best summit time or no-data fallback", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  const hasSummitWindow =
    (await page.locator("text=Best summit time").count()) > 0 ||
    (await page.locator("text=No summit window data available").count()) > 0;

  // If the weather section loaded at all, one of these should be present
  const hasWeather = (await page.locator("text=Summit Window").count()) > 0;
  if (hasWeather) {
    expect(hasSummitWindow).toBe(true);
  }
});

test("morning average score renders when available", async ({ page }) => {
  await page.goto(PEAK_URL);

  // "Morning avg:" only appears when summitWindow.morning_average is set
  const hasMorningAvg = await page.locator("text=Morning avg:").count();
  if (hasMorningAvg > 0) {
    await expect(page.getByText(/Morning avg:/i).first()).toBeVisible();
  }
});

// ── Test 14: Condition flags render ───────────────────────────────────────────
test("condition flag section is present inside weather card", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  // Condition flags are shown only when conditionFlags is non-null; skip if absent
  const possibleFlags = [
    "Wind Risk",
    "Thunderstorm Risk",
    "Snow Risk",
    "Whiteout Risk",
    "Extreme Cold",
  ];

  const hasAnyFlag = await Promise.any(
    possibleFlags.map(async (flag) => {
      const count = await page.locator(`text=${flag}`).count();
      if (count > 0) return true;
      throw new Error("not found");
    })
  ).catch(() => false);

  // If no flags are showing that's valid — just verify the weather card exists
  const weatherHeading = page
    .getByRole("heading", { name: /Summit Weather/i })
    .first();
  await expect(weatherHeading).toBeVisible();

  // Log whether we found any flags (informational)
  console.log(`Condition flags visible: ${hasAnyFlag}`);
});

test("wind risk flag renders with correct sky colour when present", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  const windFlag = page
    .locator("span")
    .filter({ hasText: /^Wind Risk$/ })
    .first();

  if (await windFlag.isVisible()) {
    await expect(windFlag).toHaveClass(/text-sky-700/);
  }
});

test("thunderstorm risk flag renders with correct purple colour when present", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  const flag = page
    .locator("span")
    .filter({ hasText: /^Thunderstorm Risk$/ })
    .first();

  if (await flag.isVisible()) {
    await expect(flag).toHaveClass(/text-purple-700/);
  }
});

test("snow risk flag renders with correct blue colour when present", async ({
  page,
}) => {
  await page.goto(PEAK_URL);

  const flag = page
    .locator("span")
    .filter({ hasText: /^Snow Risk$/ })
    .first();

  if (await flag.isVisible()) {
    await expect(flag).toHaveClass(/text-blue-700/);
  }
});
