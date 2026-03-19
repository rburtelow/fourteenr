import { test, expect } from '@playwright/test'

test.describe('Epic 1: Database Migration', () => {
  test('Story 1.3: public summit logs visible on other users profiles', async ({ page }) => {
    // Visit a public user profile and verify summit history section renders
    // (requires a seeded public user with summit logs)
    await page.goto('/u/testuser')
    await expect(page.getByText(/summit/i).first()).toBeVisible()
  })
})
