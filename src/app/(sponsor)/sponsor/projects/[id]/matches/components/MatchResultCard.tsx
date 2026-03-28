"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label, BodySmall, Caption } from "@/components/ui/typography"
import { sendInquiry } from "@/features/inquiries/actions"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types"

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

function scoreBarColor(score: number, max: number): string {
  const pct = (score / max) * 100
  if (pct >= 70) return "bg-icon-status-success"
  if (pct >= 40) return "bg-icon-status-warning"
  return "bg-icon-status-danger"
}

const statusColors: Record<string, string> = {
  pending: "bg-surface-status-warning text-icon-status-warning",
  inquiry_sent: "bg-surface-status-info text-icon-status-info",
  accepted: "bg-surface-status-success text-icon-status-success",
  declined: "bg-surface-status-danger text-icon-status-danger",
}

function ClinicPreviewModal({
  clinicId,
  onClose,
}: {
  clinicId: string
  onClose: () => void
}) {
  const [clinic, setClinic] = useState<Tables<"clinics"> | null>(null)
  const [specs, setSpecs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [clinicRes, specsRes] = await Promise.all([
        supabase.from("clinics").select("*").eq("id", clinicId).single(),
        supabase
          .from("clinic_specializations")
          .select("therapeutic_areas(name)")
          .eq("clinic_id", clinicId),
      ])
      setClinic(clinicRes.data)
      setSpecs(
        (specsRes.data ?? [])
          .map((s) => (s.therapeutic_areas as unknown as { name: string })?.name)
          .filter(Boolean),
      )
      setLoading(false)
    }
    load()
  }, [clinicId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim-primary"
      onClick={onClose}
    >
      <div
        className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-default border border-primary p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <Caption className="text-secondary">Loading...</Caption>
        ) : clinic ? (
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <BodySmall className="font-bold text-primary">{clinic.name}</BodySmall>
                <Caption className="text-secondary">
                  {clinic.city}, {clinic.country}
                </Caption>
              </div>
              <button onClick={onClose} className="text-secondary hover:text-primary text-lg">
                &times;
              </button>
            </div>
            {clinic.description && (
              <Caption className="mb-4 text-secondary">{clinic.description}</Caption>
            )}
            <div className="space-y-3">
              {clinic.contact_email && (
                <Caption>
                  <span className="text-secondary">Email: </span>
                  {clinic.contact_email}
                </Caption>
              )}
              {clinic.address && (
                <Caption>
                  <span className="text-secondary">Address: </span>
                  {clinic.address}
                </Caption>
              )}
              {clinic.site_type && (
                <Caption>
                  <span className="text-secondary">Site type: </span>
                  {String(clinic.site_type).replace(/_/g, " ")}
                </Caption>
              )}
              {specs.length > 0 && (
                <div>
                  <Caption className="text-secondary">Specializations: </Caption>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {specs.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Caption className="text-icon-status-danger">Failed to load clinic details.</Caption>
        )}
      </div>
    </div>
  )
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
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  const [notes, setNotes] = useState("")
  const [sent, setSent] = useState(Boolean(inquiry) || matchResult.status !== "pending")

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)

    const result = await sendInquiry({
      matchResultId: matchResult.id,
      message,
      notes: notes || undefined,
    })

    if (result.error) {
      setSending(false)
    } else {
      setSent(true)
      setShowInquiryForm(false)
    }
  }

  return (
    <div className="rounded-2xl border border-primary p-4">
      {showPreview && (
        <ClinicPreviewModal
          clinicId={matchResult.clinic_id}
          onClose={() => setShowPreview(false)}
        />
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
            {rank}
          </div>
          <div>
            <button
              onClick={() => setShowPreview(true)}
              className="font-semibold text-left hover:underline"
            >
              {clinicName}
            </button>
            <Caption className="text-secondary">{clinicCity}</Caption>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{matchResult.overall_score}</span>
          <Caption className="text-secondary">/ 100</Caption>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {dimensions.map((dim) => {
          const score = breakdown?.[dim.key] ?? 0
          const pct = (score / dim.max) * 100
          return (
            <div key={dim.key} className="flex items-center gap-2">
              <Caption className="w-28 text-secondary">{dim.label}</Caption>
              <div className="h-2 flex-1 rounded-full bg-surface-level-3">
                <div
                  className={`h-2 rounded-full ${scoreBarColor(score, dim.max)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <Caption className="w-10 text-right font-medium">
                {score}/{dim.max}
              </Caption>
            </div>
          )
        })}
      </div>

      <div className="mt-4 border-t border-primary pt-3">
        {sent || inquiry ? (
          <div className="flex items-center gap-2">
            <Badge className={statusColors[inquiry?.status ?? matchResult.status] ?? ""}>
              {inquiry?.status === "accepted"
                ? "Accepted"
                : inquiry?.status === "declined"
                  ? "Declined"
                  : "Inquiry Sent"}
            </Badge>
            {inquiry?.response_message && (
              <Caption className="text-secondary">— {inquiry.response_message}</Caption>
            )}
            {inquiry?.decline_reason && (
              <Caption className="text-icon-status-danger">— {inquiry.decline_reason}</Caption>
            )}
          </div>
        ) : showInquiryForm ? (
          <form onSubmit={handleSend} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce your trial and explain why this clinic is a good fit..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes for your team (not shared with clinic)"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={sending} size="sm">
                {sending ? "Sending..." : "Send Inquiry"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInquiryForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button size="sm" onClick={() => setShowInquiryForm(true)}>
            Send Inquiry
          </Button>
        )}
      </div>
    </div>
  )
}
