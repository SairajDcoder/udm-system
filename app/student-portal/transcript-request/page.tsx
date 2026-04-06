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
  hashId?: string
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
    pending: <Clock className="mr-1 h-3 w-3" />,
    rejected: <AlertCircle className="mr-1 h-3 w-3" />,
  }

  return <Badge className={`${styles[status]} flex w-fit items-center rounded-full border-0 font-medium`}>{icons[status]}{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

function HashDisplay({ hash }: { hash?: string }) {
  const [copied, setCopied] = useState(false)

  if (!hash) return <span className="text-gray-400 italic text-xs">Awaiting approval...</span>

  const handleCopy = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-2 group">
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Verification Hash</span>
        <code className="rounded bg-teal-50 px-2 py-0.5 font-mono text-[11px] text-teal-700 border border-teal-100">
          {hash.slice(0, 12)}...{hash.slice(-8)}
        </code>
      </div>
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 hover:bg-teal-50 hover:text-teal-600 transition-colors" 
        onClick={handleCopy}
        title="Copy Hash for Verifier"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-teal-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
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
    setRequests(payload.requests || [])
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-navy-700">Request Purpose</TableHead>
                  <TableHead className="text-navy-700">Destination</TableHead>
                  <TableHead className="text-navy-700">Status</TableHead>
                  <TableHead className="text-navy-700">Date Requested</TableHead>
                  <TableHead className="text-navy-700 text-right">Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-teal-600" />
                          <p className="font-semibold text-navy-900">{request.purpose}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium bg-gray-100 w-fit px-2 py-0.5 rounded uppercase tracking-tighter">
                          {request.id} • {request.format} • {request.copies} {request.copies === 1 ? 'copy' : 'copies'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-navy-800 font-medium">{request.destination}</TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                    <TableCell className="text-gray-600 text-sm whitespace-nowrap">
                      {new Date(request.requestDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        <HashDisplay hash={request.hashId} />
                        {request.cid && (
                          <a 
                            href={`https://ipfs.io/ipfs/${request.cid}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 underline underline-offset-2 decoration-teal-600/30"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            View on IPFS
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
