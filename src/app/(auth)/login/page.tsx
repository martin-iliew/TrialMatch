"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import AuthFormShell from "@/components/common/AuthFormShell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label, Caption } from "@/components/ui/typography"
import { loginSchema, type LoginValues } from "@/features/auth/schemas"

export default function LoginPage() {
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    const role = data.user?.user_metadata.role as string
    window.location.assign(role === "sponsor" ? "/sponsor/projects" : "/clinic/profile")
  }

  return (
    <AuthFormShell
      title="Welcome back"
      subtitle="Sign in to your TrialMatch account"
      footerLabel="Don't have an account?"
      footerCta="Sign up"
      footerHref="/register"
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
          {errors.email && (
            <Caption className="text-icon-status-danger">{errors.email.message}</Caption>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link className="body-small text-secondary transition-colors hover:text-primary" href="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <Caption className="text-icon-status-danger">{errors.password.message}</Caption>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthFormShell>
  )
}
