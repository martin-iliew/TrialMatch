"use client"

import { useState } from "react"
import { submitContactInquiry } from "@/features/contact/actions"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await submitContactInquiry({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">Message Sent</h1>
        <p className="text-muted-foreground">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Contact Us</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Have questions about TrialMatch? Send us a message.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  )
}
