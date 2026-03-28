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
  const [showDeclineReason, setShowDeclineReason] = useState(false)

  async function handleRespond(responseAction: "accepted" | "declined") {
    const form = document.getElementById("inquiry-response-form") as HTMLFormElement
    const formData = new FormData(form)

    if (responseAction === "declined") {
      const reason = formData.get("decline_reason") as string
      if (!reason) {
        setShowDeclineReason(true)
        setError("Please provide a decline reason")
        return
      }
    }

    setLoading(true)
    setError(null)

    const result = await respondToInquiry(inquiryId, responseAction, {
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

      <form id="inquiry-response-form" className="space-y-4">
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

        {showDeclineReason && (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Decline Reason *
            </label>
            <textarea
              name="decline_reason"
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Please provide a reason for declining..."
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleRespond("accepted")}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Accepting..." : "Accept"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (!showDeclineReason) {
                setShowDeclineReason(true)
              } else {
                handleRespond("declined")
              }
            }}
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {loading ? "Declining..." : "Decline"}
          </button>
        </div>
      </form>
    </div>
  )
}
