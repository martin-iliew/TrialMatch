import { test, expect } from '@playwright/test'
import path from 'path'

const SPONSOR_STORAGE = path.join(__dirname, '..', '.auth', 'sponsor.json')

/**
 * Tests for archive and delete actions on trial projects.
 *
 * Delete  — only available on draft projects (hard delete, irreversible)
 * Archive — only available on non-draft, non-archived projects (sets status → archived)
 *
 * Requires env vars: E2E_SPONSOR_EMAIL / E2E_SPONSOR_PASSWORD
 * global-setup cleans up rows matching `title LIKE 'E2E%'` before each run.
 */

// ---------------------------------------------------------------------------
// Delete a draft project
// ---------------------------------------------------------------------------
test.describe.serial('Sponsor — Delete draft project', () => {
  test.skip(!process.env.E2E_SPONSOR_EMAIL, 'Set E2E_SPONSOR_EMAIL to enable')
  test.use({ storageState: SPONSOR_STORAGE })

  let projectUrl = ''

  test('create a draft project for deletion', async ({ page }) => {
    await page.goto('/sponsor/projects/new')
    await page.getByLabel('Title *').fill('E2E Delete Test Project')
    await page.getByRole('button', { name: 'Create Project' }).click()

    await page.waitForURL(
      (url) =>
        /\/sponsor\/projects\//.test(url.pathname) &&
        !url.pathname.endsWith('/new'),
      { timeout: 10000 }
    )
    projectUrl = page.url()
    await expect(page.getByText('draft')).toBeVisible()
  })

  test('draft project shows Delete button, not Archive', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Archive' })).not.toBeVisible()
  })

  test('Active tab shows the draft project', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByText('E2E Delete Test Project').first()).toBeVisible()
  })

  test('clicking Delete and confirming removes the project', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)

    // Accept the window.confirm dialog
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Delete' }).click()

    // Should redirect back to /sponsor/projects
    await page.waitForURL('**/sponsor/projects', { timeout: 10000 })
  })

  test('deleted project no longer appears on Active tab', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByText('E2E Delete Test Project')).not.toBeVisible()
  })

  test('deleted project does not appear on Archived tab either', async ({ page }) => {
    await page.goto('/sponsor/projects?tab=archived')
    await expect(page.getByText('E2E Delete Test Project')).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Archive a non-draft project
// ---------------------------------------------------------------------------
test.describe.serial('Sponsor — Archive non-draft project', () => {
  test.skip(!process.env.E2E_SPONSOR_EMAIL, 'Set E2E_SPONSOR_EMAIL to enable')
  test.use({ storageState: SPONSOR_STORAGE })

  let projectUrl = ''

  test('create a project and run matching to make it active', async ({ page }) => {
    // Create the project
    await page.goto('/sponsor/projects/new')
    await page.getByLabel('Title *').fill('E2E Archive Test Project')
    await page.getByRole('button', { name: 'Create Project' }).click()

    await page.waitForURL(
      (url) =>
        /\/sponsor\/projects\//.test(url.pathname) &&
        !url.pathname.endsWith('/new'),
      { timeout: 10000 }
    )
    projectUrl = page.url()

    // Run matching so the project becomes active
    await page.getByRole('button', { name: 'Find Matching Clinics' }).click()

    // Wait for redirect to /matches or stay on detail page (zero results)
    await page.waitForURL(
      (url) =>
        url.pathname.includes('/matches') ||
        /\/sponsor\/projects\/[^/]+$/.test(url.pathname),
      { timeout: 15000 }
    )

    // If redirected to matches, go back to project detail
    if (page.url().includes('/matches')) {
      await page.goto(projectUrl)
    }
  })

  test('non-draft project shows Archive button, not Delete', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)
    // Status must be active or draft — check what button is shown
    const status = await page.getByText(/^(draft|active|paused|completed)$/).first().textContent()

    if (status === 'draft') {
      // Zero matches — project stayed draft; Archive is hidden for drafts
      await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
      test.skip() // cannot test archive path without a non-draft project
    } else {
      await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible()
    }
  })

  test('Active tab shows the project before archiving', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByText('E2E Archive Test Project').first()).toBeVisible()
  })

  test('clicking Archive redirects to projects list', async ({ page }) => {
    if (!projectUrl) test.skip()
    await page.goto(projectUrl)

    const archiveBtn = page.getByRole('button', { name: 'Archive' })
    const isDraft = !(await archiveBtn.isVisible())
    if (isDraft) test.skip()

    await archiveBtn.click()
    await page.waitForURL('**/sponsor/projects', { timeout: 10000 })
  })

  test('archived project no longer appears on Active tab', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await expect(page.getByText('E2E Archive Test Project')).not.toBeVisible()
  })

  test('archived project appears on Archived tab', async ({ page }) => {
    await page.goto('/sponsor/projects?tab=archived')
    await expect(page.getByText('E2E Archive Test Project').first()).toBeVisible()
  })

  test('Archived tab shows the archived badge on the project', async ({ page }) => {
    await page.goto('/sponsor/projects?tab=archived')
    await page.getByText('E2E Archive Test Project').first().click()
    await page.waitForURL(/\/sponsor\/projects\//, { timeout: 5000 })
    await expect(page.getByText('archived')).toBeVisible()
  })

  test('archived project detail shows no Archive or Delete button', async ({ page }) => {
    await page.goto('/sponsor/projects?tab=archived')
    await page.getByText('E2E Archive Test Project').first().click()
    await page.waitForURL(/\/sponsor\/projects\//, { timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Archive' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Tabs baseline
// ---------------------------------------------------------------------------
test.describe('Sponsor — Projects list tabs', () => {
  test.skip(!process.env.E2E_SPONSOR_EMAIL, 'Set E2E_SPONSOR_EMAIL to enable')
  test.use({ storageState: SPONSOR_STORAGE })

  test('Active tab is selected by default', async ({ page }) => {
    await page.goto('/sponsor/projects')
    const activeTab = page.getByRole('link', { name: 'Active' })
    await expect(activeTab).toBeVisible()
    // Active tab has the primary border class (aria-current or class check)
    await expect(activeTab).toHaveClass(/border-primary/)
  })

  test('Archived tab is reachable and shows heading', async ({ page }) => {
    await page.goto('/sponsor/projects?tab=archived')
    await expect(page.getByText('Trial Projects')).toBeVisible()
    const archivedTab = page.getByRole('link', { name: 'Archived' })
    await expect(archivedTab).toHaveClass(/border-primary/)
  })

  test('Archived tab empty state shows correct message', async ({ page }) => {
    await page.goto('/sponsor/projects?tab=archived')
    // Either has projects or shows empty state — no crash
    const hasProjects = await page.getByRole('link', { name: /trial/i }).first().isVisible().catch(() => false)
    if (!hasProjects) {
      await expect(page.getByText('No archived projects')).toBeVisible()
    }
  })
})
