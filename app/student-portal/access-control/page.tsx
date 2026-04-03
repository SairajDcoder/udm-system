"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Clock, Eye, Key, Plus, Shield, Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AccessGrant = {
  id: string
  verifierName: string
  verifierEmail: string
  verifierType: string
  recordType: string
  grantedDate: string
  expiryDate: string
  status: "active" | "expired" | "revoked"
  accessCount: number
}

const recordTypeOptions = {
  full: "Full Academic Records",
  transcripts: "Transcripts & Credentials",
  degree: "Degree & GPA Only",
  enrollment: "Enrollment Verification",
}

export default function AccessControlPage() {
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verifier, setVerifier] = useState("")
  const [verifierType, setVerifierType] = useState("Academic Institution")
  const [recordType, setRecordType] = useState(recordTypeOptions.transcripts)
  const [expiryDays, setExpiryDays] = useState("30")

  const loadGrants = async () => {
    const response = await fetch("/api/student/access")
    const payload = await response.json()
    setGrants(payload.grants)
  }

  useEffect(() => {
    loadGrants().catch(() => setGrants([]))
  }, [])

  const activeGrants = grants.filter((grant) => grant.status === "active")
  const expiredGrants = grants.filter((grant) => grant.status !== "active")
  const expiringSoon = activeGrants.filter((grant) => {
    const daysRemaining = Math.ceil((new Date(grant.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysRemaining <= 14
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    const normalizedEmail = verifier.includes("@")
      ? verifier.toLowerCase()
      : `${verifier.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@external.org`

    try {
      await fetch("/api/access/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifierEmail: normalizedEmail,
          verifierName: verifier,
          verifierType,
          recordType,
          expiryDays: Number(expiryDays),
        }),
      })
      setVerifier("")
      setVerifierType("Academic Institution")
      setRecordType(recordTypeOptions.transcripts)
      setExpiryDays("30")
      await loadGrants()
    } finally {
      setIsSubmitting(false)
    }
  }

  const revokeGrant = async (grantId: string) => {
    await fetch(`/api/access/revoke?grantId=${encodeURIComponent(grantId)}`, { method: "DELETE" })
    await loadGrants()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
              <Shield className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Grants</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{activeGrants.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{expiringSoon.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Eye className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-heading font-bold text-navy-900">
                {grants.reduce((sum, grant) => sum + grant.accessCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Key className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive Grants</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{expiredGrants.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg text-navy-900">
              <Plus className="h-5 w-5 text-teal-500" />
              Grant Access
            </CardTitle>
            <CardDescription>Allow third parties to verify your academic records</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verifier">Verifier Identity</Label>
                <Input id="verifier" value={verifier} onChange={(event) => setVerifier(event.target.value)} placeholder="Organization name or verifier email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifier-type">Verifier Type</Label>
                <Select value={verifierType} onValueChange={setVerifierType}>
                  <SelectTrigger id="verifier-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic Institution">Academic Institution</SelectItem>
                    <SelectItem value="Corporate Employer">Corporate Employer</SelectItem>
                    <SelectItem value="Government Agency">Government Agency</SelectItem>
                    <SelectItem value="Other Organization">Other Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="record-type">Record Type</Label>
                <Select value={recordType} onValueChange={setRecordType}>
                  <SelectTrigger id="record-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(recordTypeOptions).map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">Access Expiry</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger id="expiry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="180">6 Months</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">Attribute-Based Access Control</p>
                    <p className="mt-1">Each access grant is stored with a scoped policy and recorded in the audit trail.</p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-teal-500 text-white hover:bg-teal-600" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Grant Access"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900">Access Grants</CardTitle>
            <CardDescription>Manage who can view your academic records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="text-gray-500">Verifier</TableHead>
                    <TableHead className="text-gray-500">Record Type</TableHead>
                    <TableHead className="text-gray-500">Expiry</TableHead>
                    <TableHead className="text-center text-gray-500">Views</TableHead>
                    <TableHead className="text-gray-500">Status</TableHead>
                    <TableHead className="text-right text-gray-500">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-navy-900">{grant.verifierName}</p>
                          <p className="text-xs text-gray-500">{grant.verifierType}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{grant.recordType}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(grant.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-center font-medium text-navy-900">{grant.accessCount}</TableCell>
                      <TableCell>
                        <Badge className={grant.status === "active" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}>
                          {grant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {grant.status === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke access?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will immediately invalidate the verifier&apos;s permission policy.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => revokeGrant(grant.id)}>Revoke</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-xs text-gray-400">Inactive</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                <div className="text-xs text-amber-700">
                  <p className="font-medium">Privacy note</p>
                  <p className="mt-1">Revoked and expired grants remain in the audit log for compliance, but they no longer authorize verification access.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
