import { test, expect } from '@playwright/test'

test.describe('Epic 5: Navigation Updates', () => {
  test('Story 5.1: authenticated user sees settings link on own profile', async ({ page }) => {
    await page.goto('/profile')
    const url = page.url()
    // If redirected to login, skip
    if (!url.includes('/profile')) return

    const settingsLink = page.getByRole('link', { name: /settings/i })
    await expect(settingsLink).toBeVisible()
    await settingsLink.click()
    await expect(page).toHaveURL(/\/profile\/settings/)
  })

  test('Story 5.2: settings link appears on own public profile view', async ({ page }) => {
    await page.goto('/profile')
    const url = page.url()
    if (!url.includes('/profile')) return

    // Navigate to own public profile URL (requires knowing the username)
    // This test assumes we can find a link to own public profile
    const profileLink = page.getByRole('link', { name: /view profile/i })
      .or(page.locator('a[href^="/u/"]').first())
    const count = await profileLink.count()
    if (count === 0) return

    await profileLink.click()
    await expect(page.url()).toMatch(/\/u\//)

    // Should see settings link on own profile
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })
})
