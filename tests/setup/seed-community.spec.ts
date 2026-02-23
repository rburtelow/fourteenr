/**
 * Seed script: populate community posts, comments, and likes for both test users.
 *
 * Run with:  pnpm playwright test tests/setup/seed-community.spec.ts
 *
 * Prerequisites:
 *   - Both users must already exist (run create-users.spec.ts first)
 *   - Dev server running at http://localhost:3000
 *
 * Users:
 *   rburtelow@gmail.com  / Test1234!  / @rburtelow
 *   blah@blah.com        / Test1234!  / @blah
 */

import { test, expect, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const USERS = {
  rburtelow: { email: "rburtelow@gmail.com", password: "Test1234!" },
  blah: { email: "blah@blah.com", password: "Test1234!" },
};

// Posts each user will create: { content, peakSearch (partial), peakName (exact) }
const POSTS = {
  rburtelow: [
    {
      content:
        "Just summited Mt. Elbert yesterday — trail conditions are excellent! A bit icy near the top but totally manageable with microspikes. Recommend an early start to beat afternoon storms.",
      peakSearch: "Elbert",
      peakName: "Mount Elbert",
    },
    {
      content:
        "Planning a Grays & Torreys traverse next weekend. Anyone done it recently? Looking for current beta on the saddle conditions.",
      peakSearch: "Grays",
      peakName: "Grays Peak",
    },
  ],
  blah: [
    {
      content:
        "Longs Peak via the Keyhole route was absolutely epic last Saturday. Boulder field was clear and we had the summit to ourselves at 5am. Highly recommend!",
      peakSearch: "Longs",
      peakName: "Longs Peak",
    },
    {
      content:
        "Mt. Massive is seriously underrated. Less traffic than Elbert, fantastic views, and the approach through the aspens is unreal. Get out there!",
      peakSearch: "Massive",
      peakName: "Mount Massive",
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(
    (url) => url.pathname === "/" || url.search.includes("error"),
    { timeout: 15_000 }
  );
  const url = new URL(page.url());
  if (url.search.includes("error")) {
    const err = decodeURIComponent(url.searchParams.get("error") ?? "");
    throw new Error(`Login failed for ${email}: ${err}`);
  }
  console.log(`  ✓  Logged in as ${email}`);
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign Out" }).click();
  // Wait for the "Get Started" link to appear, confirming logged-out state
  await expect(
    page.getByRole("link", { name: "Get Started" }).first()
  ).toBeVisible({ timeout: 10_000 });
  console.log("  ✓  Logged out");
}

async function createPost(
  page: Page,
  content: string,
  peakSearch: string,
  peakName: string
) {
  await page.goto("/community");
  await page.waitForSelector('textarea[placeholder="Share your trail story..."]');

  // Fill the post content
  await page.fill('textarea[placeholder="Share your trail story..."]', content);

  // Open the peak selector — mountain icon is the 3rd button in the icon toolbar.
  // Scope to main to avoid matching the nav bar's flex.items-center.gap-2 div.
  const iconGroup = page.locator("main .flex.items-center.gap-2").first();
  await iconGroup.locator("button").nth(2).click();

  // Wait for the peak search dropdown
  await page.waitForSelector('input[placeholder="Search peaks..."]');
  await page.fill('input[placeholder="Search peaks..."]', peakSearch);
  await page.waitForTimeout(200); // brief pause for filter

  // Click the first peak that matches the exact name.
  // Scope to the dropdown container (parent of the search input) to avoid
  // matching unrelated buttons elsewhere on the page.
  const dropdownContainer = page.locator('input[placeholder="Search peaks..."]').locator("../..");
  await dropdownContainer
    .locator("button")
    .filter({ hasText: peakName })
    .first()
    .click();

  // Confirm the peak tag appeared
  await expect(page.locator("main").getByText(peakName).first()).toBeVisible({
    timeout: 3_000,
  });

  // Submit the post
  await page.getByRole("button", { name: "Post" }).click();

  // Confirm the new post card is visible in the feed
  const snippet = content.slice(0, 50);
  await expect(
    page.locator("article").filter({ hasText: snippet }).first()
  ).toBeVisible({ timeout: 10_000 });

  console.log(`    → Created post: "${snippet}..."`);
}

async function commentOnPost(
  page: Page,
  postSnippet: string,
  commentText: string
) {
  const article = page
    .locator("article")
    .filter({ hasText: postSnippet })
    .first();
  await expect(article).toBeVisible({ timeout: 5_000 });

  // The actions bar is the first border-t div inside the article.
  // Buttons in actions bar: [0] like (heart), [1] comment (speech bubble), [2] save/watch
  const actionsBar = article.locator("div.border-t").first();
  await actionsBar.locator("button").nth(1).click();

  // Wait for the comment input to appear
  const commentInput = article.locator(
    'input[placeholder="Write a comment..."]'
  );
  await expect(commentInput).toBeVisible({ timeout: 5_000 });

  // Type the comment and submit with Enter
  await commentInput.fill(commentText);
  await commentInput.press("Enter");

  // Wait for the comment text to appear in the thread
  const commentSnippet = commentText.slice(0, 30);
  await expect(article.getByText(commentSnippet).first()).toBeVisible({
    timeout: 8_000,
  });

  console.log(`    → Commented: "${commentText.slice(0, 50)}..."`);
}

async function likePost(page: Page, postSnippet: string) {
  const article = page
    .locator("article")
    .filter({ hasText: postSnippet })
    .first();
  await expect(article).toBeVisible({ timeout: 5_000 });

  // Like button is the first button in the actions bar
  const actionsBar = article.locator("div.border-t").first();
  await actionsBar.locator("button").nth(0).click();

  // Brief pause for optimistic update to apply
  await page.waitForTimeout(500);

  console.log(`    → Liked: "${postSnippet.slice(0, 40)}..."`);
}

// Peaks each user will add to their watchlist (slugs + display names)
const WATCHLIST = {
  rburtelow: [
    { slug: "mount-harvard", name: "Mount Harvard" },
    { slug: "mount-antero", name: "Mount Antero" },
    { slug: "mount-princeton", name: "Mount Princeton" },
  ],
  blah: [
    { slug: "la-plata-peak", name: "La Plata Peak" },
    { slug: "mount-yale", name: "Mount Yale" },
    { slug: "mount-shavano", name: "Mount Shavano" },
  ],
};

// Event rburtelow will create
const EVENT = {
  title: "Grays & Torreys Traverse — Group Hike",
  description:
    "Join me for a classic double-summit day on Grays and Torreys! We'll meet at the Bakerville trailhead at 5am. Bring microspikes just in case.",
  date: "2026-08-15T05:00",
  location: "Bakerville Trailhead, I-70 Exit 221",
  peakSearch: "Grays",
  peakName: "Grays Peak",
  maxAttendees: "10",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

async function addPeakToWatchlist(page: Page, slug: string, name: string) {
  await page.goto(`/peaks/${slug}`);
  // Wait for the page to load and the watch button to appear
  const watchBtn = page.getByRole("button", { name: /save to list/i });
  await expect(watchBtn).toBeVisible({ timeout: 10_000 });
  await watchBtn.click();
  // Confirm button transitions to "Watching"
  await expect(
    page.getByRole("button", { name: /watching/i })
  ).toBeVisible({ timeout: 5_000 });
  console.log(`    → Watchlisted: ${name}`);
}

async function createEvent(page: Page, event: typeof EVENT) {
  await page.goto("/events");
  await page.getByRole("button", { name: "Create Event" }).first().click();

  // Fill required fields
  await page.fill("#event-title", event.title);
  await page.fill("#event-description", event.description);
  await page.fill("#event-date", event.date);
  await page.fill("#event-location", event.location);

  // Link a peak (optional)
  await page.getByRole("button", { name: /select a peak/i }).click();
  await page.waitForSelector('input[placeholder="Search peaks..."]');
  await page.fill('input[placeholder="Search peaks..."]', event.peakSearch);
  await page.waitForTimeout(200);
  const peakDropdown = page
    .locator('input[placeholder="Search peaks..."]')
    .locator("../..");
  await peakDropdown
    .locator("button")
    .filter({ hasText: event.peakName })
    .first()
    .click();

  // Set max attendees
  await page.fill("#event-max-attendees", event.maxAttendees);

  // Submit
  await page.getByRole("button", { name: "Create Event" }).last().click();

  // Confirm the event card appears in the feed
  await expect(
    page.locator("article, [data-testid='event-card'], .event-card, h2, h3").filter({ hasText: event.title }).first()
  ).toBeVisible({ timeout: 10_000 });

  console.log(`    → Created event: "${event.title}"`);
}

async function rsvpToEvent(page: Page, eventTitle: string) {
  await page.goto("/events");
  const card = page.locator("article, [class*='card']").filter({ hasText: eventTitle }).first();
  await expect(card).toBeVisible({ timeout: 10_000 });
  await card.getByRole("button", { name: /rsvp/i }).click();
  // Confirm the button switches to "Cancel RSVP"
  await expect(card.getByRole("button", { name: /cancel rsvp/i })).toBeVisible({
    timeout: 5_000,
  });
  console.log(`    → RSVP'd to: "${eventTitle}"`);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("rburtelow creates posts", async ({ page }) => {
  console.log("\n→ rburtelow: creating posts");
  await login(page, USERS.rburtelow.email, USERS.rburtelow.password);

  for (const p of POSTS.rburtelow) {
    await createPost(page, p.content, p.peakSearch, p.peakName);
  }
});

test("blah creates posts", async ({ page }) => {
  console.log("\n→ blah: creating posts");
  await login(page, USERS.blah.email, USERS.blah.password);

  for (const p of POSTS.blah) {
    await createPost(page, p.content, p.peakSearch, p.peakName);
  }
});

test("blah comments on and likes rburtelow's posts", async ({ page }) => {
  console.log("\n→ blah: engaging with rburtelow's posts");
  await login(page, USERS.blah.email, USERS.blah.password);
  await page.goto("/community");

  for (const p of POSTS.rburtelow) {
    const snippet = p.content.slice(0, 50);
    await commentOnPost(
      page,
      snippet,
      `Great report on ${p.peakName}! Really helpful beta — thanks for sharing.`
    );
    await likePost(page, snippet);
  }
});

test("rburtelow comments on and likes blah's posts", async ({ page }) => {
  console.log("\n→ rburtelow: engaging with blah's posts");
  await login(page, USERS.rburtelow.email, USERS.rburtelow.password);
  await page.goto("/community");

  for (const p of POSTS.blah) {
    const snippet = p.content.slice(0, 50);
    await commentOnPost(
      page,
      snippet,
      `Thanks for the ${p.peakName} writeup! Adding it to my list for sure.`
    );
    await likePost(page, snippet);
  }
});

test("back-and-forth comment exchange on Elbert post", async ({ page }) => {
  console.log("\n→ back-and-forth comment exchange");
  const elbertSnippet = POSTS.rburtelow[0].content.slice(0, 50);
  const longsSnippet = POSTS.blah[0].content.slice(0, 50);

  // blah replies to rburtelow's Elbert post
  await login(page, USERS.blah.email, USERS.blah.password);
  await page.goto("/community");
  await commentOnPost(
    page,
    elbertSnippet,
    "Did you encounter any snow above treeline? Planning to head up next week!"
  );
  await logout(page);

  // rburtelow replies back on the same post
  await login(page, USERS.rburtelow.email, USERS.rburtelow.password);
  await page.goto("/community");
  await commentOnPost(
    page,
    elbertSnippet,
    "Just a thin layer near 13,500ft — microspikes handled it fine. You'll be great!"
  );
  await logout(page);

  // rburtelow asks a question on blah's Longs Peak post
  await login(page, USERS.rburtelow.email, USERS.rburtelow.password);
  await page.goto("/community");
  await commentOnPost(
    page,
    longsSnippet,
    "Longs is on my tick list for this summer — was the Narrows section snow-free?"
  );
  await logout(page);

  // blah answers back
  await login(page, USERS.blah.email, USERS.blah.password);
  await page.goto("/community");
  await commentOnPost(
    page,
    longsSnippet,
    "Totally dry and clear! Plan for an alpine start though — the boulder field gets crowded."
  );
});

test("rburtelow adds 3 peaks to watchlist", async ({ page }) => {
  console.log("\n→ rburtelow: adding peaks to watchlist");
  await login(page, USERS.rburtelow.email, USERS.rburtelow.password);
  for (const peak of WATCHLIST.rburtelow) {
    await addPeakToWatchlist(page, peak.slug, peak.name);
  }
});

test("blah adds 3 peaks to watchlist", async ({ page }) => {
  console.log("\n→ blah: adding peaks to watchlist");
  await login(page, USERS.blah.email, USERS.blah.password);
  for (const peak of WATCHLIST.blah) {
    await addPeakToWatchlist(page, peak.slug, peak.name);
  }
});

test("rburtelow creates a group hike event", async ({ page }) => {
  console.log("\n→ rburtelow: creating event");
  await login(page, USERS.rburtelow.email, USERS.rburtelow.password);
  await createEvent(page, EVENT);
});

test("blah RSVPs to rburtelow's event", async ({ page }) => {
  console.log("\n→ blah: RSVP to rburtelow's event");
  await login(page, USERS.blah.email, USERS.blah.password);
  await rsvpToEvent(page, EVENT.title);
});
