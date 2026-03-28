import { test, expect } from '@playwright/test'

test.describe('Route protection (unauthenticated)', () => {
  test('redirects /sponsor/projects to /login', async ({ page }) => {
    await page.goto('/sponsor/projects')
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('redirects /clinic/profile to /login', async ({ page }) => {
    await page.goto('/clinic/profile')
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('redirects /clinic/inquiries to /login', async ({ page }) => {
    await page.goto('/clinic/inquiries')
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('redirects /sponsor/projects/new to /login', async ({ page }) => {
    await page.goto('/sponsor/projects/new')
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('allows access to landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('TrialMatch').first()).toBeVisible()
    expect(page.url()).not.toContain('/login')
  })

  test('allows access to login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('allows access to register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  })
})
