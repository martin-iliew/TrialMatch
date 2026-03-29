import { test as setup, expect } from '@playwright/test'
import path from 'path'

const SPONSOR_STORAGE = path.join(__dirname, '..', '.auth', 'sponsor.json')
const CLINIC_STORAGE = path.join(__dirname, '..', '.auth', 'clinic.json')

/**
 * These setup tests authenticate as sponsor and clinic users and save
 * their storage state so downstream tests can reuse them without logging
 * in each time.
 *
 * Set the following env vars (or add them to .env.test):
 *   E2E_SPONSOR_EMAIL / E2E_SPONSOR_PASSWORD
 *   E2E_CLINIC_EMAIL  / E2E_CLINIC_PASSWORD
 */

setup('authenticate as sponsor', async ({ page }) => {
  const email = process.env.E2E_SPONSOR_EMAIL
  const password = process.env.E2E_SPONSOR_PASSWORD

  if (!email || !password) {
    setup.skip()
    return
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/sponsor/projects', { timeout: 30000 })

  await page.context().storageState({ path: SPONSOR_STORAGE })
})

setup('authenticate as clinic admin', async ({ page }) => {
  const email = process.env.E2E_CLINIC_EMAIL
  const password = process.env.E2E_CLINIC_PASSWORD

  if (!email || !password) {
    setup.skip()
    return
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/clinic/profile', { timeout: 30000 })

  await page.context().storageState({ path: CLINIC_STORAGE })
})
