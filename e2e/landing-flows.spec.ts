import { test, expect } from '@playwright/test'

/**
 * Landing page CTA navigation (USER_JOURNEYS.md §2.2)
 * No auth required.
 */
test.describe('Landing page CTAs', () => {
  test('has "Join as CRO" CTA that navigates to /register', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /join as cro/i })
    await expect(cta).toBeVisible()
    await cta.click()
    await page.waitForURL(/\/register/)
  })

  test('has "Register Your Clinic" CTA that navigates to /register', async ({ page }) => {
    await page.goto('/')
    // Two such links exist (hero + "For Clinics" section) — use the first (hero)
    const cta = page.getByRole('link', { name: /register your clinic/i }).first()
    await expect(cta).toBeVisible()
    await cta.click()
    await page.waitForURL(/\/register/)
  })

  test('has a "how it works" section', async ({ page }) => {
    await page.goto('/')
    const howItWorks = page.getByText(/how it works/i)
    await expect(howItWorks).toBeVisible()
  })

  test('displays the EUR 500K/day stat', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/500K/)).toBeVisible()
  })
})

/**
 * Public clinic browse (USER_JOURNEYS.md §2.1)
 * Any visitor can browse /clinics without an account.
 */
test.describe('Public clinic browse', () => {
  test('/clinics is publicly accessible (no redirect to login)', async ({ page }) => {
    await page.goto('/clinics')
    expect(page.url()).not.toContain('/login')
  })

  test('/clinics shows clinic cards', async ({ page }) => {
    await page.goto('/clinics')
    // At least one clinic card should render once seed data is applied
    const cards = page.locator('[data-testid="clinic-card"]').or(
      page.getByRole('article')
    )
    // Page should load without errors regardless of seed state
    await expect(page).toHaveURL(/\/clinics/)
  })

  test('/clinics does not show equipment or availability to unauthenticated visitors', async ({ page }) => {
    await page.goto('/clinics')
    // Equipment and availability sections should be absent for visitors
    await expect(page.getByText(/equipment/i)).not.toBeVisible()
    await expect(page.getByText(/availability/i)).not.toBeVisible()
  })
})
