"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, CheckCircle2, Copy, ExternalLink, FileText, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TranscriptListItem = {
  id: string
  purpose: string
  destination: string
  requestDate: string
  status: "pending" | "processing" | "ready" | "rejected"
}

type TranscriptDetail = TranscriptListItem & {
  address: string
  copies: number
  format: string
  notes: string
  cid?: string
  hashId?: string
  readyAt?: string
  credential?: {
    id: string
    vScore: number
    issuer: string
    aggregateSignature: string
    blockchain: string
  } | null
}

function HashDisplay({ label, hash }: { label: string; hash?: string }) {
  const [copied, setCopied] = useState(false)

  if (!hash) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="rounded-lg bg-gray-100 p-2 text-xs text-gray-500">Not available yet</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-center gap-2 rounded-lg bg-navy-900 p-2">
        <code className="flex-1 truncate font-mono text-xs text-teal-400">{hash}</code>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-gray-400 hover:bg-navy-700 hover:text-white"
          onClick={() => {
            navigator.clipboard.writeText(hash)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  )
}

export default function TranscriptViewerPage() {
  const [requests, setRequests] = useState<TranscriptListItem[]>([])
  const [selectedTranscript, setSelectedTranscript] = useState<string>("")
  const [detail, setDetail] = useState<TranscriptDetail | null>(null)

  useEffect(() => {
    fetch("/api/student/transcript/request")
      .then((response) => response.json())
      .then((payload) => {
        const readyRequests = (payload.requests as TranscriptListItem[]).filter((item) => item.status === "ready")
        setRequests(readyRequests)
        if (readyRequests[0]) {
          setSelectedTranscript(readyRequests[0].id)
        }
      })
      .catch(() => setRequests([]))
  }, [])

  useEffect(() => {
    if (!selectedTranscript) return
    fetch(`/api/student/transcript/${encodeURIComponent(selectedTranscript)}`)
      .then((response) => response.json())
      .then((payload) => setDetail(payload))
      .catch(() => setDetail(null))
  }, [selectedTranscript])

  const selectedLabel = useMemo(
    () => requests.find((request) => request.id === selectedTranscript),
    [requests, selectedTranscript]
  )

  return (
    <div className="grid min-h-[600px] grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="flex flex-col border-gray-200 shadow-sm lg:col-span-3">
        <CardHeader className="border-b border-gray-200 pb-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-teal-500" />
            <Select value={selectedTranscript} onValueChange={setSelectedTranscript}>
              <SelectTrigger className="w-[320px]">
                <SelectValue placeholder="Select transcript request" />
              </SelectTrigger>
              <SelectContent>
                {requests.map((request) => (
                  <SelectItem key={request.id} value={request.id}>
                    {request.id} - {request.purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-6 bg-gray-50 p-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="border-b border-gray-200 pb-4 text-center">
              <h2 className="font-heading text-2xl font-bold text-navy-900">MIT Academy of Engineering</h2>
              <p className="mt-1 text-sm text-gray-500">Official Transcript Record</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Request ID</p>
                <p className="font-medium text-navy-900">{detail?.id ?? "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Destination</p>
                <p className="font-medium text-navy-900">{detail?.destination ?? "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Purpose</p>
                <p className="font-medium text-navy-900">{detail?.purpose ?? "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Generated At</p>
                <p className="font-medium text-navy-900">
                  {detail?.readyAt ? new Date(detail.readyAt).toLocaleString("en-US") : "Pending"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-navy-900">Delivery Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-navy-900">Format:</span> {detail?.format ?? "-"}</p>
                <p><span className="font-medium text-navy-900">Copies:</span> {detail?.copies ?? "-"}</p>
                <p><span className="font-medium text-navy-900">Address:</span> {detail?.address ?? "-"}</p>
                <p><span className="font-medium text-navy-900">Notes:</span> {detail?.notes || "None"}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-500" />
                <span className="text-xs text-gray-500">Blockchain anchored transcript</span>
              </div>
              <Badge className="bg-teal-100 text-teal-700">{detail?.status ?? "pending"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-heading text-lg text-navy-900">
            <Shield className="h-5 w-5 text-teal-500" />
            Verification Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
                <div>
                  <p className="font-medium text-teal-900">Transcript Integrity</p>
                  <p className="text-xs text-teal-700">Credential checks and ownership validation</p>
                </div>
              </div>
              <p className="text-xl font-heading font-bold text-teal-700">{detail?.credential?.vScore ?? 0}</p>
            </div>
          </div>

          <HashDisplay label="Document Hash (SHA-256)" hash={detail?.hashId} />
          <HashDisplay label="IPFS CID" hash={detail?.cid} />
          <HashDisplay label="Aggregate Signature" hash={detail?.credential?.aggregateSignature} />

          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="mb-2 text-sm font-medium text-navy-900">Blockchain Metadata</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium text-navy-900">Network:</span> {detail?.credential?.blockchain ?? "-"}</p>
              <p><span className="font-medium text-navy-900">Issuer:</span> {detail?.credential?.issuer ?? "-"}</p>
              <p><span className="font-medium text-navy-900">Selected:</span> {selectedLabel?.id ?? "-"}</p>
            </div>
          </div>

          {detail?.cid ? (
            <Button className="w-full bg-teal-500 text-white hover:bg-teal-600" asChild>
              <a href={`https://ipfs.io/ipfs/${detail.cid}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Document on IPFS
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
