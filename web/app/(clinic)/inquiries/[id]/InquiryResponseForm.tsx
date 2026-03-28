"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { respondToInquiry } from "@/features/inquiries/actions"

export default function InquiryResponseForm({
  inquiryId,
}: {
  inquiryId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<"accepted" | "declined" | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!action) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await respondToInquiry(inquiryId, action, {
      response_message: (formData.get("response_message") as string) || undefined,
      decline_reason: (formData.get("decline_reason") as string) || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
        Respond to Inquiry
      </h2>

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Response Message (optional)
          </label>
          <textarea
            name="response_message"
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Share a message with the sponsor..."
          />
        </div>

        {action === "declined" && (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Decline Reason *
            </label>
            <textarea
              name="decline_reason"
              required
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Please provide a reason for declining..."
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            onClick={() => setAction("accepted")}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading && action === "accepted" ? "Accepting..." : "Accept"}
          </button>
          <button
            type={action === "declined" ? "submit" : "button"}
            disabled={loading}
            onClick={() => setAction("declined")}
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {loading && action === "declined" ? "Declining..." : "Decline"}
          </button>
        </div>
      </form>
    </div>
  )
}
