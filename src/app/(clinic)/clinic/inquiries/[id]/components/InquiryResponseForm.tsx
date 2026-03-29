"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { respondToInquiry } from "@/features/inquiries/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label, Heading9, Caption } from "@/components/ui/typography"

export default function InquiryResponseForm({ inquiryId }: { inquiryId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeclineReason, setShowDeclineReason] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [declineReason, setDeclineReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleRespond(action: "accepted" | "declined") {
    if (action === "declined" && !declineReason) {
      setShowDeclineReason(true)
      setError("Please provide a decline reason")
      return
    }
    setLoading(true)
    setError(null)
    const response = action === "declined"
      ? { decline_reason: declineReason }
      : responseMessage
        ? { response_message: responseMessage }
        : undefined
    const result = await respondToInquiry(inquiryId, action, response)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      toast.success(action === "accepted" ? "Inquiry accepted" : "Inquiry declined")
      router.refresh()
    }
  }

  return (
    <div className="rounded-2xl border border-primary p-4">
      <Heading9 className="mb-3 uppercase text-secondary">Respond to Inquiry</Heading9>
      {error && (
        <div className="mb-3 rounded-xl bg-surface-status-danger p-2">
          <Caption className="text-icon-status-danger">{error}</Caption>
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="response_message">Response Message (optional)</Label>
          <Textarea
            id="response_message"
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Share a message with the CRO team..."
          />
        </div>
        {showDeclineReason && (
          <div className="space-y-1.5">
            <Label htmlFor="decline_reason">Decline Reason *</Label>
            <Textarea
              id="decline_reason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Please provide a reason for declining..."
            />
          </div>
        )}
        <div className="flex gap-3">
          <Button
            type="button"
            disabled={loading}
            className="bg-icon-status-success text-on-brand hover:bg-icon-status-success/90"
            onClick={() => handleRespond("accepted")}
          >
            {loading ? "Accepting..." : "Accept"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="border-status-danger text-icon-status-danger hover:bg-surface-status-danger"
            onClick={() => {
              if (!showDeclineReason) {
                setShowDeclineReason(true)
              } else {
                handleRespond("declined")
              }
            }}
          >
            {loading ? "Declining..." : "Decline"}
          </Button>
        </div>
      </div>
    </div>
  )
}
