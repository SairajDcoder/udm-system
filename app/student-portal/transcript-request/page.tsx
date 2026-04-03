"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Check, CheckCircle2, Clock, Copy, ExternalLink, FileText, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type TranscriptRequest = {
  id: string
  purpose: string
  destination: string
  address: string
  copies: number
  format: string
  requestDate: string
  status: "pending" | "processing" | "ready" | "rejected"
  cid?: string
}

function StatusBadge({ status }: { status: TranscriptRequest["status"] }) {
  const styles = {
    ready: "bg-teal-100 text-teal-700",
    processing: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  }

  const icons = {
    ready: <CheckCircle2 className="mr-1 h-3 w-3" />,
    processing: <Clock className="mr-1 h-3 w-3" />,
    pending: <AlertCircle className="mr-1 h-3 w-3" />,
    rejected: <AlertCircle className="mr-1 h-3 w-3" />,
  }

  return <Badge className={`${styles[status]} flex w-fit items-center rounded-full`}>{icons[status]}{status}</Badge>
}

function CIDLink({ cid }: { cid?: string }) {
  const [copied, setCopied] = useState(false)

  if (!cid) return <span className="text-gray-400">-</span>

  const handleCopy = () => {
    navigator.clipboard.writeText(cid)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-teal-50 px-2 py-1 font-mono text-xs text-teal-600">
        {cid.slice(0, 10)}...{cid.slice(-6)}
      </code>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
        {copied ? <Check className="h-3 w-3 text-teal-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
        <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3 w-3 text-gray-400" />
        </a>
      </Button>
    </div>
  )
}

export default function TranscriptRequestPage() {
  const [requests, setRequests] = useState<TranscriptRequest[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [purpose, setPurpose] = useState("Graduate School Application")
  const [destination, setDestination] = useState("")
  const [address, setAddress] = useState("")
  const [copies, setCopies] = useState("1")
  const [format, setFormat] = useState("Official PDF")
  const [notes, setNotes] = useState("")

  const loadRequests = async () => {
    const response = await fetch("/api/student/transcript/request")
    const payload = await response.json()
    setRequests(payload.requests)
  }

  useEffect(() => {
    loadRequests().catch(() => setRequests([]))
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await fetch("/api/student/transcript/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose,
          destination,
          address,
          copies: Number(copies),
          format,
          notes,
        }),
      })
      setDestination("")
      setAddress("")
      setNotes("")
      setCopies("1")
      setFormat("Official PDF")
      await loadRequests()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg text-navy-900">
            <Plus className="h-5 w-5 text-teal-500" />
            New Transcript Request
          </CardTitle>
          <CardDescription>Request official transcripts for academic or professional purposes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger id="purpose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Graduate School Application">Graduate School Application</SelectItem>
                  <SelectItem value="Employment Verification">Employment Verification</SelectItem>
                  <SelectItem value="Scholarship Application">Scholarship Application</SelectItem>
                  <SelectItem value="Transfer Credit Evaluation">Transfer Credit Evaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination Institution/Company</Label>
              <Input id="destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g., Stanford University" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Destination Address</Label>
              <Textarea id="address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Enter mailing address or email for digital delivery" rows={3} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="copies">Number of Copies</Label>
                <Select value={copies} onValueChange={setCopies}>
                  <SelectTrigger id="copies">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Copy</SelectItem>
                    <SelectItem value="2">2 Copies</SelectItem>
                    <SelectItem value="3">3 Copies</SelectItem>
                    <SelectItem value="5">5 Copies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Official PDF">Official PDF</SelectItem>
                    <SelectItem value="Certified Digital">Certified Digital</SelectItem>
                    <SelectItem value="Printed & Sealed">Printed & Sealed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Any special instructions or requirements" rows={2} />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium text-navy-900">$15.00</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-navy-900">Pinned to IPFS when ready</span>
              </div>
            </div>

            <Button type="submit" className="w-full bg-teal-500 text-white hover:bg-teal-600" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : <><FileText className="mr-2 h-4 w-4" />Submit Request</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-navy-900">My Requests</CardTitle>
          <CardDescription>Transcript requests generated through the student blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>IPFS CID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-navy-900">{request.purpose}</p>
                      <p className="text-xs text-gray-500">{request.id} • {request.format} • {request.copies} copies</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{request.destination}</TableCell>
                  <TableCell><StatusBadge status={request.status} /></TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(request.requestDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell><CIDLink cid={request.cid} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
