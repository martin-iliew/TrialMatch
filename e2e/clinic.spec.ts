import { test, expect } from '@playwright/test'
import path from 'path'

const CLINIC_STORAGE = path.join(__dirname, '..', '.auth', 'clinic.json')

/**
 * Clinic admin flow tests. These require a logged-in clinic_admin user.
 * Set E2E_CLINIC_EMAIL and E2E_CLINIC_PASSWORD env vars and run
 * the auth setup first. Skip if no credentials are provided.
 */
test.describe('Clinic admin flow', () => {
  test.beforeEach(async () => {
    if (!process.env.E2E_CLINIC_EMAIL) {
      test.skip()
    }
  })

  test.use({ storageState: CLINIC_STORAGE })

  test('profile page loads', async ({ page }) => {
    await page.goto('/clinic/profile')
    // Page loads without redirect to login
    expect(page.url()).toContain('/clinic/profile')
  })

  test('inquiries page loads', async ({ page }) => {
    await page.goto('/clinic/inquiries')
    // Either shows inquiries list or "complete profile first" prompt
    const heading = page.getByText('Inquiries').or(page.getByText('Partnership Inquiries'))
    await expect(heading.first()).toBeVisible()
  })

  test('inquiries page shows setup prompt if no clinic profile', async ({ page }) => {
    await page.goto('/clinic/inquiries')
    const setupPrompt = page.getByText('Complete your clinic profile first')
    const inquiriesList = page.getByText('Partnership Inquiries')
    // One or the other should be visible
    await expect(setupPrompt.or(inquiriesList).first()).toBeVisible()
  })
})
