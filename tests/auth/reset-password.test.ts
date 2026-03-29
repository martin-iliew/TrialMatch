import test from "node:test"
import assert from "node:assert/strict"
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas"
import {
  buildResetPasswordRedirectUrl,
  getRecoveryParamsFromUrl,
  isPkceRecoveryLink,
} from "@/features/auth/resetPassword"

test("forgotPasswordSchema accepts a valid email", () => {
  const result = forgotPasswordSchema.safeParse({
    email: "researcher@example.com",
  })

  assert.equal(result.success, true)
})

test("resetPasswordSchema rejects mismatched confirmation", () => {
  const result = resetPasswordSchema.safeParse({
    password: "new-password-123",
    confirmPassword: "different-password-123",
  })

  assert.equal(result.success, false)

  if (result.success) {
    assert.fail("Expected mismatched confirmation to fail validation")
  }

  const messages = result.error.issues.map((issue) => issue.message)
  assert.ok(messages.includes("Passwords do not match"))
})

test("resetPasswordSchema rejects short passwords", () => {
  const result = resetPasswordSchema.safeParse({
    password: "short",
    confirmPassword: "short",
  })

  assert.equal(result.success, false)

  if (result.success) {
    assert.fail("Expected short password to fail validation")
  }

  const messages = result.error.issues.map((issue) => issue.message)
  assert.ok(messages.includes("Password must be at least 8 characters"))
})

test("buildResetPasswordRedirectUrl targets the reset-password route", () => {
  const url = buildResetPasswordRedirectUrl("https://trialmatch.app")

  assert.equal(url, "https://trialmatch.app/reset-password")
})

test("getRecoveryParamsFromUrl recognizes Supabase recovery links", () => {
  const url = new URL(
    "https://trialmatch.app/reset-password?code=abc123&type=recovery&next=%2Flogin",
  )

  const result = getRecoveryParamsFromUrl(url)

  assert.equal(result, null)
})

test("getRecoveryParamsFromUrl recognizes implicit recovery links from the hash fragment", () => {
  const url = new URL(
    "https://trialmatch.app/reset-password#access_token=access123&refresh_token=refresh123&type=recovery",
  )

  const result = getRecoveryParamsFromUrl(url)

  assert.deepEqual(result, {
    accessToken: "access123",
    code: null,
    refreshToken: "refresh123",
    type: "recovery",
  })
})

test("isPkceRecoveryLink recognizes code-based recovery links", () => {
  const url = new URL(
    "https://trialmatch.app/reset-password?code=abc123&type=recovery",
  )

  assert.equal(isPkceRecoveryLink(url), true)
})

test("getRecoveryParamsFromUrl returns null for unrelated links", () => {
  const url = new URL("https://trialmatch.app/reset-password")

  const result = getRecoveryParamsFromUrl(url)

  assert.equal(result, null)
})
