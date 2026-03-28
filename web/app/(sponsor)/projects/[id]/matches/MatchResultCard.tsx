"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { sendInquiry } from "@/features/inquiries/actions"
import type { Tables } from "@/types/supabase"

interface ScoreBreakdown {
  therapeutic_area: number
  equipment: number
  certification: number
  availability: number
  geographic: number
}

const dimensions = [
  { key: "therapeutic_area" as const, label: "Therapeutic Area", max: 30 },
  { key: "equipment" as const, label: "Equipment", max: 25 },
  { key: "certification" as const, label: "Certifications", max: 20 },
  { key: "availability" as const, label: "Availability", max: 15 },
  { key: "geographic" as const, label: "Geographic", max: 10 },
]

function scoreColor(score: number, max: number): string {
  const pct = (score / max) * 100
  if (pct >= 70) return "bg-green-500"
  if (pct >= 40) return "bg-yellow-500"
  return "bg-red-500"
}

const inquiryStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  inquiry_sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
}

export default function MatchResultCard({
  rank,
  matchResult,
  clinicName,
  clinicCity,
  inquiry,
}: {
  rank: number
  matchResult: Tables<"match_results">
  clinicName: string
  clinicCity: string
  inquiry: Tables<"partnership_inquiries"> | null
}) {
  const breakdown = matchResult.breakdown as unknown as ScoreBreakdown
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(matchResult.status !== "pending")

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await sendInquiry({
      matchResultId: matchResult.id,
      message: formData.get("message") as string,
      notes: (formData.get("notes") as string) || undefined,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
      setShowInquiryForm(false)
    }
    setSending(false)
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {rank}
          </div>
          <div>
            <h3 className="font-semibold">{clinicName}</h3>
            <p className="text-sm text-muted-foreground">{clinicCity}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{matchResult.score}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
      </div>

      {/* Score breakdown bars */}
      <div className="mt-4 space-y-2">
        {dimensions.map((dim) => {
          const score = breakdown?.[dim.key] ?? 0
          const pct = (score / dim.max) * 100
          return (
            <div key={dim.key} className="flex items-center gap-2 text-xs">
              <span className="w-28 text-muted-foreground">{dim.label}</span>
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${scoreColor(score, dim.max)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right font-medium">
                {score}/{dim.max}
              </span>
            </div>
          )
        })}
      </div>

      {/* Inquiry section */}
      <div className="mt-4 border-t pt-3">
        {sent || inquiry ? (
          <div className="flex items-center gap-2">
            <Badge className={inquiryStatusColors[inquiry?.status ?? matchResult.status] ?? ""}>
              {inquiry?.status === "accepted"
                ? "Accepted"
                : inquiry?.status === "declined"
                  ? "Declined"
                  : "Inquiry Sent"}
            </Badge>
            {inquiry?.response_message && (
              <span className="text-sm text-muted-foreground">
                — {inquiry.response_message}
              </span>
            )}
            {inquiry?.decline_reason && (
              <span className="text-sm text-destructive">
                — {inquiry.decline_reason}
              </span>
            )}
          </div>
        ) : showInquiryForm ? (
          <form onSubmit={handleSend} className="space-y-3">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium">Message *</label>
              <textarea
                name="message"
                required
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Introduce your trial and explain why this clinic is a good fit..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Internal Notes</label>
              <input
                name="notes"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Notes for your team (not shared with clinic)"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Inquiry"}
              </button>
              <button
                type="button"
                onClick={() => setShowInquiryForm(false)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowInquiryForm(true)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Send Inquiry
          </button>
        )}
      </div>
    </div>
  )
}
