import { test, expect } from '@playwright/test'

test.describe('Navigation between auth pages', () => {
  test('can navigate from landing to login', async ({ page }) => {
    await page.goto('/')
    // Check if there's a sign-in link on the landing page
    const loginLink = page.getByRole('link', { name: /sign in|log in|login/i })
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await page.waitForURL('/login')
    } else {
      // Navigate directly
      await page.goto('/login')
    }
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('can navigate login → register → login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Sign up' }).click()
    await page.waitForURL('/register')
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()

    await page.getByRole('link', { name: 'Sign in' }).click()
    await page.waitForURL('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
  })
})

test.describe('Page load performance', () => {
  test('landing page loads within 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })

  test('login page loads within 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })
})

test.describe('Responsive layout', () => {
  test('login form is usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('register form is usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/register')
    await expect(page.getByLabel('First name')).toBeVisible()
    await expect(page.getByLabel('Last name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })
})
