"use client"

import { useEffect, useState } from "react"
import { ArrowRightLeft, CheckCircle2, Clock, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type TransferRequest = {
  id: string
  destinationInstitution: string
  sourceInstitution: string
  creditsRequested: number
  courseCodes: string[]
  reason: string
  status: "pending" | "approved" | "rejected"
  requestedAt: string
}

function TransferCard({ transfer }: { transfer: TransferRequest }) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-navy-900">{transfer.destinationInstitution}</p>
            <p className="text-sm text-gray-500">{transfer.id}</p>
          </div>
          <Badge className={transfer.status === "approved" ? "bg-teal-100 text-teal-700" : transfer.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
            {transfer.status}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Requested Credits</p>
            <p className="font-medium text-navy-900">{transfer.creditsRequested}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Submitted</p>
            <p className="font-medium text-navy-900">
              {new Date(transfer.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500">Course Mapping</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {transfer.courseCodes.map((course) => (
              <Badge key={course} variant="secondary">{course}</Badge>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600">{transfer.reason}</p>
      </CardContent>
    </Card>
  )
}

export default function CreditTransferPage() {
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [destinationInstitution, setDestinationInstitution] = useState("")
  const [creditsRequested, setCreditsRequested] = useState("6")
  const [courseCodes, setCourseCodes] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTransfers = async () => {
    const response = await fetch("/api/student/transfers")
    const payload = await response.json()
    setTransfers(payload.transfers)
  }

  useEffect(() => {
    loadTransfers().catch(() => setTransfers([]))
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await fetch("/api/transfer/credit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationInstitution,
          creditsRequested: Number(creditsRequested),
          courseCodes: courseCodes.split(",").map((entry) => entry.trim()).filter(Boolean),
          reason,
        }),
      })

      setDestinationInstitution("")
      setCreditsRequested("6")
      setCourseCodes("")
      setReason("")
      await loadTransfers()
    } finally {
      setIsSubmitting(false)
    }
  }

  const approvedCredits = transfers.filter((transfer) => transfer.status === "approved").reduce((sum, transfer) => sum + transfer.creditsRequested, 0)
  const pendingCredits = transfers.filter((transfer) => transfer.status === "pending").reduce((sum, transfer) => sum + transfer.creditsRequested, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
              <ArrowRightLeft className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Requests</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{transfers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Credits Approved</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{approvedCredits}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Evaluation</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{pendingCredits}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg text-navy-900">
              <Send className="h-5 w-5 text-teal-500" />
              New Credit Transfer Request
            </CardTitle>
            <CardDescription>Request transfer evaluation for courses and earned credits</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination University</Label>
                <Input id="destination" value={destinationInstitution} onChange={(event) => setDestinationInstitution(event.target.value)} placeholder="e.g., National Institute of Technology" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits to Transfer</Label>
                <Select value={creditsRequested} onValueChange={setCreditsRequested}>
                  <SelectTrigger id="credits">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Credits</SelectItem>
                    <SelectItem value="6">6 Credits</SelectItem>
                    <SelectItem value="12">12 Credits</SelectItem>
                    <SelectItem value="18">18 Credits</SelectItem>
                    <SelectItem value="24">24 Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courses">Course Codes</Label>
                <Input id="courses" value={courseCodes} onChange={(event) => setCourseCodes(event.target.value)} placeholder="e.g., CS402, MA301" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Transfer</Label>
                <Textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why you're requesting this transfer" rows={4} required />
              </div>

              <Button type="submit" className="w-full bg-teal-500 text-white hover:bg-teal-600" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {transfers.map((transfer) => (
            <TransferCard key={transfer.id} transfer={transfer} />
          ))}
        </div>
      </div>
    </div>
  )
}
