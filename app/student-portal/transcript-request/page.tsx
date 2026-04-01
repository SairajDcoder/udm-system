"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Copy,
  Check,
} from "lucide-react"

// Sample Data
const myRequests = [
  {
    id: "TR-2026-0042",
    purpose: "Graduate School Application",
    destination: "Stanford University",
    copies: 2,
    format: "Official PDF",
    requestDate: "Mar 28, 2026",
    status: "Ready",
    ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  },
  {
    id: "TR-2026-0038",
    purpose: "Employment Verification",
    destination: "Google Inc.",
    copies: 1,
    format: "Certified Digital",
    requestDate: "Mar 20, 2026",
    status: "Processing",
    ipfsHash: null,
  },
  {
    id: "TR-2026-0031",
    purpose: "Scholarship Application",
    destination: "National Science Foundation",
    copies: 3,
    format: "Official PDF",
    requestDate: "Mar 12, 2026",
    status: "Pending",
    ipfsHash: null,
  },
  {
    id: "TR-2026-0025",
    purpose: "Internship Application",
    destination: "Microsoft Corporation",
    copies: 1,
    format: "Certified Digital",
    requestDate: "Mar 1, 2026",
    status: "Ready",
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Ready: "bg-teal-100 text-teal-700",
    Processing: "bg-blue-100 text-blue-700",
    Pending: "bg-amber-100 text-amber-700",
  }

  const icons = {
    Ready: <CheckCircle2 className="h-3 w-3 mr-1" />,
    Processing: <Clock className="h-3 w-3 mr-1" />,
    Pending: <AlertCircle className="h-3 w-3 mr-1" />,
  }

  return (
    <Badge className={`${styles[status as keyof typeof styles]} rounded-full flex items-center w-fit`}>
      {icons[status as keyof typeof icons]}
      {status}
    </Badge>
  )
}

function IPFSLink({ hash }: { hash: string | null }) {
  const [copied, setCopied] = useState(false)

  if (!hash) return <span className="text-gray-400">-</span>

  const handleCopy = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const truncatedHash = `${hash.slice(0, 8)}...${hash.slice(-6)}`

  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">
        {truncatedHash}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3 w-3 text-teal-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        asChild
      >
        <a href={`https://ipfs.io/ipfs/${hash}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3 w-3 text-gray-400" />
        </a>
      </Button>
    </div>
  )
}

export default function TranscriptRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => setIsSubmitting(false), 1500)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Request Form */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-navy-900 flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-500" />
            New Transcript Request
          </CardTitle>
          <CardDescription>
            Request official transcripts for academic or professional purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select>
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grad-school">Graduate School Application</SelectItem>
                  <SelectItem value="employment">Employment Verification</SelectItem>
                  <SelectItem value="scholarship">Scholarship Application</SelectItem>
                  <SelectItem value="internship">Internship Application</SelectItem>
                  <SelectItem value="transfer">Transfer Credit Evaluation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination Institution/Company</Label>
              <Input id="destination" placeholder="e.g., Stanford University" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Destination Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter mailing address or email for digital delivery"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="copies">Number of Copies</Label>
                <Select defaultValue="1">
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
                <Select defaultValue="pdf">
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">Official PDF</SelectItem>
                    <SelectItem value="digital">Certified Digital</SelectItem>
                    <SelectItem value="print">Printed & Sealed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any special instructions or requirements"
                rows={2}
              />
            </div>

            {/* Fee Info */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium text-navy-900">$15.00</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Estimated Processing</span>
                <span className="font-medium text-navy-900">2-3 business days</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Requests Table */}
      <Card className="lg:col-span-2 border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-navy-900">My Requests</CardTitle>
          <CardDescription>Track the status of your transcript requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium">Request ID</TableHead>
                  <TableHead className="text-gray-500 font-medium">Purpose</TableHead>
                  <TableHead className="text-gray-500 font-medium">Destination</TableHead>
                  <TableHead className="text-gray-500 font-medium text-center">Copies</TableHead>
                  <TableHead className="text-gray-500 font-medium">Status</TableHead>
                  <TableHead className="text-gray-500 font-medium">IPFS Link</TableHead>
                  <TableHead className="text-gray-500 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((request) => (
                  <TableRow key={request.id} className="border-gray-100">
                    <TableCell className="font-mono text-sm text-navy-900">{request.id}</TableCell>
                    <TableCell className="font-medium text-navy-900">{request.purpose}</TableCell>
                    <TableCell className="text-gray-600 max-w-[150px] truncate">{request.destination}</TableCell>
                    <TableCell className="text-center text-gray-600">{request.copies}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <IPFSLink hash={request.ipfsHash} />
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "Ready" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-navy-900 mb-3">Status Legend</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <StatusBadge status="Pending" />
                <span className="text-xs text-gray-500">Awaiting review</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="Processing" />
                <span className="text-xs text-gray-500">Being prepared</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="Ready" />
                <span className="text-xs text-gray-500">Available for download</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
