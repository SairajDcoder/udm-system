"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Shield,
  Plus,
  Clock,
  Building2,
  FileText,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Key,
  Eye,
} from "lucide-react"

// Sample Active Access Grants
const accessGrants = [
  {
    id: 1,
    verifier: "Stanford University",
    verifierType: "Academic Institution",
    recordType: "Full Academic Records",
    grantedDate: "Mar 15, 2026",
    expiryDate: "Jun 15, 2026",
    status: "Active",
    accessCount: 3,
  },
  {
    id: 2,
    verifier: "Google Inc.",
    verifierType: "Corporate Employer",
    recordType: "Degree & GPA Only",
    grantedDate: "Mar 20, 2026",
    expiryDate: "Apr 20, 2026",
    status: "Active",
    accessCount: 1,
  },
  {
    id: 3,
    verifier: "National Science Foundation",
    verifierType: "Government Agency",
    recordType: "Full Academic Records",
    grantedDate: "Mar 1, 2026",
    expiryDate: "Sep 1, 2026",
    status: "Active",
    accessCount: 5,
  },
  {
    id: 4,
    verifier: "MIT Admissions",
    verifierType: "Academic Institution",
    recordType: "Transcripts & Credentials",
    grantedDate: "Feb 15, 2026",
    expiryDate: "Mar 15, 2026",
    status: "Expired",
    accessCount: 2,
  },
]

export default function AccessControlPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => setIsSubmitting(false), 1500)
  }

  const activeGrants = accessGrants.filter(g => g.status === "Active")
  const expiredGrants = accessGrants.filter(g => g.status === "Expired")

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
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
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-heading font-bold text-navy-900">1</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Eye className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-heading font-bold text-navy-900">
                {accessGrants.reduce((sum, g) => sum + g.accessCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Key className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expired Grants</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{expiredGrants.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grant Access Form */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-500" />
              Grant Access
            </CardTitle>
            <CardDescription>
              Allow third parties to verify your academic records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verifier">Verifier Identity</Label>
                <Input id="verifier" placeholder="Organization name or DID" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifier-type">Verifier Type</Label>
                <Select>
                  <SelectTrigger id="verifier-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic Institution</SelectItem>
                    <SelectItem value="employer">Corporate Employer</SelectItem>
                    <SelectItem value="government">Government Agency</SelectItem>
                    <SelectItem value="other">Other Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="record-type">Record Type</Label>
                <Select>
                  <SelectTrigger id="record-type">
                    <SelectValue placeholder="Select records to share" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Academic Records</SelectItem>
                    <SelectItem value="transcripts">Transcripts & Credentials</SelectItem>
                    <SelectItem value="degree">Degree & GPA Only</SelectItem>
                    <SelectItem value="enrollment">Enrollment Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">Access Expiry</Label>
                <Select defaultValue="30">
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

              {/* Info Box */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">Zero-Knowledge Verification</p>
                    <p className="mt-1">Verifiers can confirm your credentials without seeing sensitive details.</p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Grant Access"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Access Grants Table */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900">Active Access Grants</CardTitle>
            <CardDescription>Manage who can view your academic records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="text-gray-500 font-medium">Verifier</TableHead>
                    <TableHead className="text-gray-500 font-medium">Record Type</TableHead>
                    <TableHead className="text-gray-500 font-medium">Expiry</TableHead>
                    <TableHead className="text-gray-500 font-medium text-center">Views</TableHead>
                    <TableHead className="text-gray-500 font-medium">Status</TableHead>
                    <TableHead className="text-gray-500 font-medium text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessGrants.map((grant) => (
                    <TableRow key={grant.id} className="border-gray-100">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <Building2 className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-navy-900">{grant.verifier}</p>
                            <p className="text-xs text-gray-500">{grant.verifierType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{grant.recordType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className={grant.status === "Expired" ? "text-red-600" : "text-gray-600"}>
                            {grant.expiryDate}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {grant.accessCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {grant.status === "Active" ? (
                          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" />
                            Expired
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {grant.status === "Active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will immediately revoke {grant.verifier}&apos;s access to your records. They will no longer be able to verify your credentials.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                  Revoke Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
