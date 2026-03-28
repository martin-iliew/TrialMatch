"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import AuthFormShell from "@/components/shared/AuthFormShell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/typography"
import { cn } from "@/lib/cn"

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["sponsor", "clinic_admin"]),
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "sponsor" },
  })

  const selectedRole = watch("role")

  async function onSubmit(values: RegisterValues) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: values.role,
          first_name: values.firstName,
          last_name: values.lastName,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Account created! Signing you in…")
    router.push(values.role === "sponsor" ? "/sponsor/projects" : "/clinic/profile")
    router.refresh()
  }

  return (
    <AuthFormShell
      title="Create account"
      subtitle="Join TrialMatch to connect trials with clinics"
      footerLabel="Already have an account?"
      footerCta="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role picker */}
        <div className="space-y-1.5">
          <Label as="label">I am a…</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["sponsor", "clinic_admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue("role", r)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  selectedRole === r
                    ? "border-primary bg-surface-level-2 text-primary"
                    : "border-primary/30 text-secondary hover:border-primary"
                )}
              >
                {r === "sponsor" ? "Sponsor" : "Clinic Admin"}
              </button>
            ))}
          </div>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label as="label" htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="Alex" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label as="label" htmlFor="lastName">Last name</Label>
            <Input id="lastName" placeholder="Smith" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label as="label" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label as="label" htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthFormShell>
  )
}
