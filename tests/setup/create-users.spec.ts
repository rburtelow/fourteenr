/**
 * Setup script: create test users after a local DB reset.
 *
 * Run with:  pnpm test:setup
 *
 * Users created:
 *   rburtelow@gmail.com  / password: Test1234!  / @rburtelow
 *   blah@blah.com        / password: Test1234!  / @blah
 */

import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const USERS = [
  {
    email: "rburtelow@gmail.com",
    password: "Test1234!",
    screenName: "rburtelow",
  },
  {
    email: "blah@blah.com",
    password: "Test1234!",
    screenName: "blah",
  },
];

for (const user of USERS) {
  test(`Create user: ${user.email}`, async ({ page }) => {
    console.log(`\n→ Creating ${user.email}`);

    // ── Step 1: Sign up ────────────────────────────────────────────────
    await page.goto("/auth/signup");
    await page.fill("#email", user.email);
    await page.fill("#password", user.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait until we land on setup-profile (success) or get an error param
    await page.waitForURL(
      (url) =>
        url.pathname.includes("setup-profile") || url.search.includes("error"),
      { timeout: 15_000 },
    );

    const afterSignup = new URL(page.url());

    // Handle "already exists" — treat as a no-op
    if (afterSignup.search.includes("error")) {
      const error = decodeURIComponent(
        afterSignup.searchParams.get("error") ?? "",
      );
      if (error.includes("already exists")) {
        console.log(`  ⚠  ${user.email} already exists — skipping`);
        return;
      }
      throw new Error(`Signup failed for ${user.email}: ${error}`);
    }

    // ── Step 2: Set screen name ────────────────────────────────────────
    await expect(page).toHaveURL(/setup-profile/);
    await page.fill("#screen_name", user.screenName);
    await page.getByRole("button", { name: "Complete Setup" }).click();

    // Wait for home or an error on setup-profile
    await page.waitForURL(
      (url) => url.pathname === "/" || url.search.includes("error"),
      { timeout: 15_000 },
    );

    const afterSetup = new URL(page.url());
    if (afterSetup.search.includes("error")) {
      const error = decodeURIComponent(
        afterSetup.searchParams.get("error") ?? "",
      );
      throw new Error(
        `Screen name setup failed for ${user.email} (@${user.screenName}): ${error}`,
      );
    }

    console.log(`  ✓  ${user.email} → @${user.screenName}`);
  });
}
