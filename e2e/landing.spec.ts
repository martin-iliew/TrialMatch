import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('displays hero content', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('TrialMatch').first()).toBeVisible()
    await expect(
      page.getByText('Match clinics to trials in minutes, not months')
    ).toBeVisible()
  })

  test('loads without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/')
    expect(errors).toHaveLength(0)
  })
})
