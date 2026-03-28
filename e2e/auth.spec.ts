import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('shows validation errors for empty submit', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Enter a valid email')).toBeVisible()
    await expect(
      page.getByText('Password must be at least 6 characters')
    ).toBeVisible()
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/login')
    // Disable browser native email validation so react-hook-form/zod errors show
    await page.evaluate(() => {
      document.querySelector('form')?.setAttribute('novalidate', '')
    })
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Enter a valid email')).toBeVisible()
  })

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('12345')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(
      page.getByText('Password must be at least 6 characters')
    ).toBeVisible()
  })

  test('has link to registration page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText("Don't have an account?")).toBeVisible()
    const signUpLink = page.getByRole('link', { name: 'Sign up' })
    await expect(signUpLink).toBeVisible()
    await signUpLink.click()
    await page.waitForURL('/register')
  })
})

test.describe('Register page', () => {
  test('renders registration form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
    await expect(page.getByText(/I am a/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sponsor' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Clinic Admin' })
    ).toBeVisible()
    await expect(page.getByLabel('First name')).toBeVisible()
    await expect(page.getByLabel('Last name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Create account' })
    ).toBeVisible()
  })

  test('shows validation errors for empty submit', async ({ page }) => {
    await page.goto('/register')
    // Clear default values in name fields
    await page.getByLabel('First name').click()
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('First name is required')).toBeVisible()
    await expect(page.getByText('Last name is required')).toBeVisible()
    await expect(page.getByText('Enter a valid email')).toBeVisible()
    await expect(
      page.getByText('Password must be at least 8 characters')
    ).toBeVisible()
  })

  test('allows role selection toggle', async ({ page }) => {
    await page.goto('/register')

    const sponsorBtn = page.getByRole('button', { name: 'Sponsor' })
    const clinicBtn = page.getByRole('button', { name: 'Clinic Admin' })

    // Sponsor is selected by default
    await expect(sponsorBtn).toHaveClass(/bg-surface-level-2/)

    // Click Clinic Admin
    await clinicBtn.click()
    await expect(clinicBtn).toHaveClass(/bg-surface-level-2/)
  })

  test('has link to login page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Already have an account?')).toBeVisible()
    const signInLink = page.getByRole('link', { name: 'Sign in' })
    await expect(signInLink).toBeVisible()
    await signInLink.click()
    await page.waitForURL('/login')
  })
})
