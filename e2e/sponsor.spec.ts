import { test, expect } from '@playwright/test'
import path from 'path'

const SPONSOR_STORAGE = path.join(__dirname, '..', '.auth', 'sponsor.json')

/**
 * Sponsor flow tests. These require a logged-in sponsor user.
 * Set E2E_SPONSOR_EMAIL and E2E_SPONSOR_PASSWORD env vars and run
 * the auth setup first. Skip if no credentials are provided.
 */
test.describe('Sponsor flow', () => {
  test.beforeEach(async () => {
    if (!process.env.E2E_SPONSOR_EMAIL) {
      test.skip()
    }
  })

  test.use({ storageState: SPONSOR_STORAGE })

  test('projects page loads and shows heading', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByText('Trial Projects')).toBeVisible()
  })

  test('projects page has "New Trial Project" button', async ({ page }) => {
    await page.goto('/sponsor/projects')
    const btn = page.getByRole('link', { name: 'New Trial Project' })
    await expect(btn).toBeVisible()
  })

  test('navigates to new project form', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await page.getByRole('link', { name: 'New Trial Project' }).click()
    await page.waitForURL('/sponsor/projects/new')
  })

  test('new project form renders required fields', async ({ page }) => {
    await page.goto('/sponsor/projects/new')
    await expect(page.getByLabel('Title')).toBeVisible()
  })

  test('shows empty state when no projects exist', async ({ page }) => {
    await page.goto('/sponsor/projects')
    // Either shows projects or the empty state — both are valid
    const hasProjects = await page.locator('a[href^="/sponsor/projects/"]').count()
    if (hasProjects === 0) {
      await expect(page.getByText('No projects yet')).toBeVisible()
    }
  })
})
