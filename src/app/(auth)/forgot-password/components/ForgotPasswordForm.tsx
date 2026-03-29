"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import AuthFormShell from "@/components/common/AuthFormShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BodySmall, Caption, Label } from "@/components/ui/typography"
import { createRecoveryClient } from "@/lib/supabase/recovery"
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schemas"
import { buildResetPasswordRedirectUrl } from "@/features/auth/resetPassword"

export default function ForgotPasswordForm() {
  const [supabase] = useState(() => createRecoveryClient())
  const [emailSent, setEmailSent] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(values: ForgotPasswordValues) {
    const redirectTo = buildResetPasswordRedirectUrl(window.location.origin)
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    setEmailSent(true)
    reset()
    toast.success("If an account exists for that email, we've sent a reset link.")
  }

  return (
    <AuthFormShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure password reset link."
      footerLabel="Remembered your password?"
      footerCta="Back to sign in"
      footerHref="/login"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email ? (
            <Caption className="text-icon-status-danger">{errors.email.message}</Caption>
          ) : (
            <Caption className="text-secondary">
              We&apos;ll send the reset link to the email on your account.
            </Caption>
          )}
        </div>

        {emailSent && (
          <BodySmall className="text-secondary">
            Check your inbox and spam folder. The email link will take you to a secure reset screen in TrialMatch.
          </BodySmall>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending reset link…" : "Send reset link"}
        </Button>
      </form>
    </AuthFormShell>
  )
}
