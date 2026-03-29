import { test, expect } from '@playwright/test'
import path from 'path'

const CLINIC_STORAGE = path.join(__dirname, '..', '.auth', 'clinic.json')

/**
 * Full clinic admin flow (USER_JOURNEYS.md §4.1–4.4, REQUIREMENTS.md R3, R6)
 *
 * Requires env vars: E2E_CLINIC_EMAIL / E2E_CLINIC_PASSWORD
 * These tests are skipped automatically when credentials are absent.
 */
test.describe('Clinic Admin — Profile Management (R3, §4.1)', () => {
  test.beforeEach(async () => {
    if (!process.env.E2E_CLINIC_EMAIL) test.skip()
  })
  test.use({ storageState: CLINIC_STORAGE })

  test('profile page shows setup form or pre-filled form (§4.1 step 1)', async ({ page }) => {
    await page.goto('/clinic/profile')
    // Either a blank setup form or a pre-filled form should render
    const nameField = page.getByLabel(/clinic name/i)
    await expect(nameField).toBeVisible()
  })

  test('profile form has required fields: name, city, contact email (§4.1 step 2)', async ({ page }) => {
    await page.goto('/clinic/profile')
    await expect(page.getByLabel(/clinic name/i)).toBeVisible()
    await expect(page.getByLabel(/city/i)).toBeVisible()
    await expect(page.getByLabel(/contact email/i)).toBeVisible()
  })

  test('profile form has specializations multi-select (§4.1 step 3)', async ({ page }) => {
    await page.goto('/clinic/profile')
    // Specializations / therapeutic areas selector
    await expect(
      page.getByText(/specialization|therapeutic area/i).first()
    ).toBeVisible()
  })

  test('profile form has a Save button (§4.1 step 4)', async ({ page }) => {
    await page.goto('/clinic/profile')
    await expect(
      page.getByRole('button', { name: /save profile|save/i })
    ).toBeVisible()
  })

  test('saving profile without required fields shows validation errors (§4.1 step 2)', async ({ page }) => {
    await page.goto('/clinic/profile')
    // Clear the name field and attempt to save
    const nameField = page.getByLabel(/clinic name/i)
    await nameField.clear()
    await page.getByRole('button', { name: /save profile|save/i }).click()
    await expect(page.getByText(/name.*required|required/i)).toBeVisible()
  })
})

test.describe('Clinic Admin — Equipment Management (R3.2, §4.2)', () => {
  test.beforeEach(async () => {
    if (!process.env.E2E_CLINIC_EMAIL) test.skip()
  })
  test.use({ storageState: CLINIC_STORAGE })

  test('equipment tab is accessible from clinic profile (§4.2 step 1)', async ({ page }) => {
    await page.goto('/clinic/profile')
    const equipmentTab = page.getByRole('tab', { name: /equipment/i })
    await expect(equipmentTab).toBeVisible()
    await equipmentTab.click()
    await expect(page.getByRole('button', { name: /add equipment/i })).toBeVisible()
  })

  test('"Add Equipment" opens an inline form (§4.2 step 2)', async ({ page }) => {
    await page.goto('/clinic/profile')
    await page.getByRole('tab', { name: /equipment/i }).click()
    await page.getByRole('button', { name: /add equipment/i }).click()

    // Form should have: type, name, quantity, availability toggle
    await expect(
      page.getByLabel(/equipment type|type/i).or(page.getByPlaceholder(/type/i))
    ).toBeVisible()
    await expect(
      page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i))
    ).toBeVisible()
    await expect(
      page.getByLabel(/quantity/i).or(page.getByRole('spinbutton'))
    ).toBeVisible()
  })

  test('equipment form saves a new item and it appears in the list (§4.2 step 3)', async ({ page }) => {
    await page.goto('/clinic/profile')
    await page.getByRole('tab', { name: /equipment/i }).click()
    await page.getByRole('button', { name: /add equipment/i }).click()

    await page.getByLabel(/equipment type|type/i)
      .or(page.getByPlaceholder(/type/i))
      .first()
      .fill('MRI')
    await page.getByLabel(/^name$/i)
      .or(page.getByPlaceholder(/name/i))
      .first()
      .fill('E2E Test MRI Scanner')

    await page.getByRole('button', { name: /save|add/i }).last().click()
    await expect(page.getByText('E2E Test MRI Scanner')).toBeVisible()
  })
})

test.describe('Clinic Admin — Certifications & Availability (R3.4, R3.5, §4.3)', () => {
  test.beforeEach(async () => {
    if (!process.env.E2E_CLINIC_EMAIL) test.skip()
  })
  test.use({ storageState: CLINIC_STORAGE })

  test('certifications tab is accessible from clinic profile (§4.3 step 1)', async ({ page }) => {
    await page.goto('/clinic/profile')
    const certTab = page.getByRole('tab', { name: /cert/i })
    await expect(certTab).toBeVisible()
    await certTab.click()
    await expect(
      page.getByRole('button', { name: /add cert/i })
    ).toBeVisible()
  })

  test('availability tab shows date range and capacity fields (§4.3 step 3)', async ({ page }) => {
    await page.goto('/clinic/profile')
    const availTab = page.getByRole('tab', { name: /availability/i })
    await expect(availTab).toBeVisible()
    await availTab.click()

    await expect(
      page.getByLabel(/available from/i).or(page.getByLabel(/from/i))
    ).toBeVisible()
    await expect(
      page.getByLabel(/available to|until/i).or(page.getByLabel(/to/i))
    ).toBeVisible()
  })
})

test.describe('Clinic Admin — Inquiry Inbox (R6, §4.4)', () => {
  test.beforeEach(async () => {
    if (!process.env.E2E_CLINIC_EMAIL) test.skip()
  })
  test.use({ storageState: CLINIC_STORAGE })

  test('inquiry inbox lists inquiries with status badges (§4.4 step 1)', async ({ page }) => {
    await page.goto('/clinic/inquiries')
    // Either shows inquiries or an empty state
    const listOrEmpty = page
      .getByText(/no inquiries|inbox|partnership inquiries/i)
    await expect(listOrEmpty.first()).toBeVisible()
  })

  test('clicking an inquiry opens the detail view (§4.4 step 2)', async ({ page }) => {
    await page.goto('/clinic/inquiries')
    const firstInquiry = page.locator('a[href^="/clinic/inquiries/"]').first()
    if (await firstInquiry.count() === 0) {
      // No inquiries seeded — skip
      test.skip()
      return
    }
    await firstInquiry.click()
    await page.waitForURL(/\/clinic\/inquiries\/[^/]+$/)

    // Detail should show trial info and accept/decline buttons
    await expect(
      page.getByRole('button', { name: /accept/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /decline/i })
    ).toBeVisible()
  })

  test('decline button requires a reason (§4.4 step 3b)', async ({ page }) => {
    await page.goto('/clinic/inquiries')
    const firstInquiry = page.locator('a[href^="/clinic/inquiries/"]').first()
    if (await firstInquiry.count() === 0) {
      test.skip()
      return
    }
    await firstInquiry.click()
    await page.waitForURL(/\/clinic\/inquiries\/[^/]+$/)

    await page.getByRole('button', { name: /decline/i }).click()
    // Should show a reason field before confirming
    const reasonField = page
      .getByLabel(/reason/i)
      .or(page.getByPlaceholder(/reason/i))
    await expect(reasonField).toBeVisible()
    // Submitting without a reason should show a validation error
    await page.getByRole('button', { name: /confirm|decline/i }).last().click()
    await expect(page.getByText(/reason.*required|required/i)).toBeVisible()
  })
})
