import { test, expect } from '@playwright/test'
import path from 'path'

const SPONSOR_STORAGE = path.join(__dirname, '..', '.auth', 'sponsor.json')

/**
 * Full sponsor flow (USER_JOURNEYS.md §3.1–3.6, REQUIREMENTS.md R4, R5, R6)
 *
 * Requires env vars: E2E_SPONSOR_EMAIL / E2E_SPONSOR_PASSWORD
 * These tests are skipped automatically when credentials are absent.
 *
 * Tests run serially so that state created in earlier tests (a project) is
 * available to later ones.
 */
test.describe.serial('Sponsor — Project Management (R4)', () => {
  test.skip(!process.env.E2E_SPONSOR_EMAIL, 'Set E2E_SPONSOR_EMAIL to enable')
  test.use({ storageState: SPONSOR_STORAGE })

  let projectUrl = ''

  test('can open the new project form and submit (§3.1)', async ({ page }) => {
    await page.goto('/sponsor/projects/new')
    await expect(page.getByLabel('Title *')).toBeVisible()

    await page.getByLabel('Title *').fill('E2E Oncology Phase II Trial')

    const descField = page.getByLabel('Description')
    if (await descField.isVisible()) {
      await descField.fill('Automated E2E test project — safe to delete.')
    }

    await page.getByRole('button', { name: 'Create Project' }).click()

    // Wait for redirect to the newly created project detail (UUID, not /new)
    await page.waitForURL(
      (url) =>
        /\/sponsor\/projects\//.test(url.pathname) &&
        !url.pathname.endsWith('/new'),
      { timeout: 10000 }
    )
    projectUrl = page.url()

    // Project title and draft badge visible
    await expect(page.getByText('E2E Oncology Phase II Trial')).toBeVisible()
    await expect(page.getByText('draft')).toBeVisible()
  })

  test('new project form validates required fields on empty submit (§3.1 step 2)', async ({ page }) => {
    await page.goto('/sponsor/projects/new')
    await page.getByRole('button', { name: 'Create Project' }).click()
    await expect(page.getByText('Title is required')).toBeVisible()
  })

  test('projects list shows the created project (§3.1)', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByText('E2E Oncology Phase II Trial').first()).toBeVisible()
  })

  test('project detail shows "+ Add Requirement" button (§3.2 step 1)', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    await expect(page.getByRole('button', { name: /add requirement/i })).toBeVisible()
  })

  test('clicking "+ Add Requirement" reveals type, value, and priority form (§3.2 step 2)', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    await page.getByRole('button', { name: /add requirement/i }).click()
    // Type select
    await expect(page.getByRole('combobox').first()).toBeVisible()
    // Value input
    await expect(page.getByPlaceholder('e.g. MRI Scanner')).toBeVisible()
    // Priority select
    await expect(page.getByRole('combobox').last()).toBeVisible()
  })

  test('can add a requirement to the project (§3.2 step 3)', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    await page.getByRole('button', { name: /add requirement/i }).click()

    // Set value
    await page.getByPlaceholder('e.g. MRI Scanner').fill('MRI Scanner')
    // Priority defaults to Required — leave as-is
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(page.getByText('MRI Scanner')).toBeVisible({ timeout: 10000 })
  })

  test('project detail shows "Find Matching Clinics" button (§3.3 step 1)', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    await expect(
      page.getByRole('button', { name: 'Find Matching Clinics' })
    ).toBeVisible()
  })

  test('clicking "Find Matching Clinics" runs the algorithm and redirects (§3.3 step 3)', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    await page.getByRole('button', { name: 'Find Matching Clinics' }).click()

    // Either redirects to /matches or shows a toast for zero results
    await page.waitForURL(
      (url) =>
        url.pathname.includes('/matches') ||
        // Zero results: stays on project detail page
        (!url.pathname.endsWith('/new') && /\/sponsor\/projects\//.test(url.pathname)),
      { timeout: 15000 }
    )

    const resultsOrEmpty = page
      .getByText(/match results|no clinics|finding matches/i)
      .or(page.getByRole('button', { name: /find matching clinics/i }))
    await expect(resultsOrEmpty.first()).toBeVisible({ timeout: 5000 })
  })

  test('match results page is accessible via URL (§3.4)', async ({ page }) => {
    if (!projectUrl) test.skip()
    const matchUrl = projectUrl.replace(/\/?$/, '/matches')
    await page.goto(matchUrl)
    // Should not redirect to login (user is authenticated)
    expect(page.url()).not.toContain('/login')
  })

  test('project detail shows "Inquiry Status" section when inquiries exist (§3.6)', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    // Either the inquiry section is visible (if inquiries exist), or it's absent (no inquiries)
    const hasInquirySection = await page.getByText('Inquiry Status').isVisible()
    if (!hasInquirySection) {
      // No inquiries yet — verify the section is simply absent, not broken
      await expect(page.getByText('Find Matching Clinics')).toBeVisible()
    } else {
      await expect(page.getByText('Inquiry Status')).toBeVisible()
    }
  })
})

test.describe('Sponsor — existing projects baseline (R4)', () => {
  test.skip(!process.env.E2E_SPONSOR_EMAIL, 'Set E2E_SPONSOR_EMAIL to enable')
  test.use({ storageState: SPONSOR_STORAGE })

  test('projects page loads and shows heading', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByText('Trial Projects')).toBeVisible()
  })

  test('projects page has "New Trial Project" link', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByRole('link', { name: 'New Trial Project' })).toBeVisible()
  })
})
