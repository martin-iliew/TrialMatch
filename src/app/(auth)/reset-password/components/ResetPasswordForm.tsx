"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import AuthFormShell from "@/components/common/AuthFormShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Body, Caption, Label } from "@/components/ui/typography"
import { createClient } from "@/lib/supabase/client"
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schemas"
import {
  getRecoveryParamsFromUrl,
  isPkceRecoveryLink,
} from "@/features/auth/resetPassword"

export default function ResetPasswordForm() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking")
  const [statusMessage, setStatusMessage] = useState(
    "Validating your reset link…",
  )
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    let active = true

    async function prepareRecoverySession() {
      const currentUrl = new URL(window.location.href)
      const recoveryParams = getRecoveryParamsFromUrl(currentUrl)

      if (isPkceRecoveryLink(currentUrl)) {
        if (!active) return
        setStatus("error")
        setStatusMessage(
          "This reset link was created with an older recovery flow and can't be completed here. Request a new reset email and use the newest link.",
        )
        return
      }

      if (!recoveryParams) {
        if (!active) return
        setStatus("error")
        setStatusMessage("This reset link is missing recovery details. Request a new email and try again.")
        return
      }

      let authError: Error | null = null

      if (recoveryParams.tokenHash && recoveryParams.type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: recoveryParams.tokenHash,
        })
        authError = error
      } else if (recoveryParams.code) {
        authError = new Error(
          "This reset link requires a newer recovery email. Request another reset link and try again.",
        )
      } else if (recoveryParams.accessToken && recoveryParams.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: recoveryParams.accessToken,
          refresh_token: recoveryParams.refreshToken,
        })
        authError = error
      } else {
        authError = new Error("This reset link is invalid or incomplete.")
      }

      if (authError) {
        if (!active) return
        setStatus("error")
        setStatusMessage(authError.message)
        return
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!active) {
        return
      }

      if (error || !user) {
        setStatus("error")
        setStatusMessage("We couldn't verify your recovery session. Request a new password reset email.")
        return
      }

      setStatus("ready")
      setStatusMessage("Choose a new password for your account.")
      router.replace("/reset-password")
    }

    void prepareRecoverySession()

    return () => {
      active = false
    }
  }, [router, supabase])

  async function onSubmit(values: ResetPasswordValues) {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    await supabase.auth.signOut()
    toast.success("Password updated. Sign in with your new password.")
    router.replace("/login")
  }

  return (
    <AuthFormShell
      title="Create a new password"
      subtitle="Finish your recovery flow by choosing a strong new password."
      footerLabel="Need another reset email?"
      footerCta="Request a new link"
      footerHref="/forgot-password"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={status !== "ready"}
            {...register("password")}
          />
          {errors.password && (
            <Caption className="text-icon-status-danger">{errors.password.message}</Caption>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={status !== "ready"}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <Caption className="text-icon-status-danger">{errors.confirmPassword.message}</Caption>
          )}
        </div>

        {status === "error" ? (
          <Body className="text-icon-status-danger">{statusMessage}</Body>
        ) : (
          <Body className="text-secondary">{statusMessage}</Body>
        )}

        <Button type="submit" className="w-full" disabled={status !== "ready" || isSubmitting}>
          {isSubmitting ? "Updating password…" : "Update password"}
        </Button>

        {status === "error" && (
          <Body className="text-secondary">
            <Link className="text-primary transition-colors hover:text-secondary" href="/forgot-password">
              Send another reset email
            </Link>
          </Body>
        )}
      </form>
    </AuthFormShell>
  )
}
