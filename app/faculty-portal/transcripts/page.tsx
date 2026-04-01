'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  GraduationCap,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample transcript requests
const transcriptRequests = [
  {
    id: 'TR001',
    studentId: 'STU001',
    studentName: 'Alice Johnson',
    email: 'alice.j@university.edu',
    program: 'B.Tech Computer Science',
    batch: '2022-2026',
    cgpa: 3.85,
    requestDate: '2026-03-28',
    purpose: 'Graduate School Application',
    urgency: 'urgent',
    status: 'pending',
    completedSemesters: 7,
    totalCredits: 140,
  },
  {
    id: 'TR002',
    studentId: 'STU002',
    studentName: 'Bob Wilson',
    email: 'bob.w@university.edu',
    program: 'B.Tech Electrical Engineering',
    batch: '2022-2026',
    cgpa: 3.72,
    requestDate: '2026-03-27',
    purpose: 'Job Application',
    urgency: 'normal',
    status: 'pending',
    completedSemesters: 7,
    totalCredits: 138,
  },
  {
    id: 'TR003',
    studentId: 'STU003',
    studentName: 'Carol Davis',
    email: 'carol.d@university.edu',
    program: 'B.Tech Computer Science',
    batch: '2021-2025',
    cgpa: 3.90,
    requestDate: '2026-03-26',
    purpose: 'Visa Application',
    urgency: 'urgent',
    status: 'pending',
    completedSemesters: 8,
    totalCredits: 160,
  },
  {
    id: 'TR004',
    studentId: 'STU004',
    studentName: 'David Lee',
    email: 'david.l@university.edu',
    program: 'B.Tech Mechanical Engineering',
    batch: '2022-2026',
    cgpa: 3.45,
    requestDate: '2026-03-25',
    purpose: 'Personal Records',
    urgency: 'low',
    status: 'approved',
    completedSemesters: 6,
    totalCredits: 120,
  },
  {
    id: 'TR005',
    studentId: 'STU005',
    studentName: 'Emma Brown',
    email: 'emma.b@university.edu',
    program: 'B.Tech Civil Engineering',
    batch: '2022-2026',
    cgpa: 3.60,
    requestDate: '2026-03-24',
    purpose: 'Internship Application',
    urgency: 'normal',
    status: 'rejected',
    completedSemesters: 5,
    totalCredits: 100,
    rejectionReason: 'Outstanding dues',
  },
]

// Sample grade history
const gradeHistory = [
  { semester: 'Fall 2022', sgpa: 3.80, credits: 20, courses: 5 },
  { semester: 'Spring 2023', sgpa: 3.85, credits: 20, courses: 5 },
  { semester: 'Fall 2023', sgpa: 3.75, credits: 20, courses: 5 },
  { semester: 'Spring 2024', sgpa: 3.90, credits: 20, courses: 5 },
  { semester: 'Fall 2024', sgpa: 3.88, credits: 20, courses: 5 },
  { semester: 'Spring 2025', sgpa: 3.92, credits: 20, courses: 5 },
  { semester: 'Fall 2025', sgpa: 3.85, credits: 20, courses: 5 },
]

type TranscriptRequest = typeof transcriptRequests[0]

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-gold text-navy-900 border-0">Pending</Badge>
    case 'approved':
      return <Badge className="bg-success text-white border-0">Approved</Badge>
    case 'rejected':
      return <Badge className="bg-destructive text-white border-0">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getUrgencyBadge(urgency: string) {
  switch (urgency) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>
    case 'normal':
      return <Badge variant="secondary">Normal</Badge>
    case 'low':
      return <Badge variant="outline">Low</Badge>
    default:
      return null
  }
}

export default function TranscriptApprovalPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<TranscriptRequest | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const filteredRequests = transcriptRequests.filter(
    (request) =>
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = transcriptRequests.filter(r => r.status === 'pending').length
  const urgentCount = transcriptRequests.filter(r => r.urgency === 'urgent' && r.status === 'pending').length

  const openPanel = (request: TranscriptRequest) => {
    setSelectedRequest(request)
    setRejectionReason('')
    setPanelOpen(true)
  }

  const handleApprove = () => {
    // Handle approval logic
    console.log('Approving request:', selectedRequest?.id)
    setPanelOpen(false)
  }

  const handleReject = () => {
    // Handle rejection logic
    console.log('Rejecting request:', selectedRequest?.id, 'Reason:', rejectionReason)
    setPanelOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Transcript Approval</h1>
          <p className="text-navy-500">Review and approve student transcript requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <Clock className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{pendingCount}</p>
                <p className="text-xs text-navy-500">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{urgentCount}</p>
                <p className="text-xs text-navy-500">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {transcriptRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-xs text-navy-500">Approved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <FileCheck className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{transcriptRequests.length}</p>
                <p className="text-xs text-navy-500">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                placeholder="Search by name, ID, or request number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-navy-200"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] border-navy-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] border-navy-200">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-navy-200 text-navy-600">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Queue Table */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50 hover:bg-navy-50">
                <TableHead className="font-semibold text-navy-700">Request ID</TableHead>
                <TableHead className="font-semibold text-navy-700">Student</TableHead>
                <TableHead className="font-semibold text-navy-700">Program</TableHead>
                <TableHead className="font-semibold text-navy-700">Purpose</TableHead>
                <TableHead className="font-semibold text-navy-700">Request Date</TableHead>
                <TableHead className="font-semibold text-navy-700">Urgency</TableHead>
                <TableHead className="font-semibold text-navy-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className={cn(
                    'cursor-pointer hover:bg-navy-50',
                    request.urgency === 'urgent' && request.status === 'pending' && 'bg-destructive/5'
                  )}
                  onClick={() => openPanel(request)}
                >
                  <TableCell className="font-mono text-sm text-navy-600">{request.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-navy-100 text-navy-600 text-xs">
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-navy-900">{request.studentName}</p>
                        <p className="text-xs text-navy-500">{request.studentId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-navy-600">{request.program}</TableCell>
                  <TableCell className="text-navy-600">{request.purpose}</TableCell>
                  <TableCell className="text-navy-600">{request.requestDate}</TableCell>
                  <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Side Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          {selectedRequest && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading text-xl">Transcript Request</SheetTitle>
                <SheetDescription>
                  Request {selectedRequest.id} - {selectedRequest.studentName}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Student Summary */}
                <Card className="rounded-[12px] border-navy-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-navy-600 text-white">
                          {selectedRequest.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-navy-900">{selectedRequest.studentName}</h3>
                        <p className="text-sm text-navy-500">{selectedRequest.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          {getUrgencyBadge(selectedRequest.urgency)}
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-navy-50 p-3">
                    <div className="flex items-center gap-2 text-navy-500">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-xs">Program</span>
                    </div>
                    <p className="mt-1 font-medium text-navy-900">{selectedRequest.program}</p>
                  </div>
                  <div className="rounded-lg bg-navy-50 p-3">
                    <div className="flex items-center gap-2 text-navy-500">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Batch</span>
                    </div>
                    <p className="mt-1 font-medium text-navy-900">{selectedRequest.batch}</p>
                  </div>
                  <div className="rounded-lg bg-navy-50 p-3">
                    <div className="flex items-center gap-2 text-navy-500">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">CGPA</span>
                    </div>
                    <p className="mt-1 font-medium text-navy-900">{selectedRequest.cgpa.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-navy-50 p-3">
                    <div className="flex items-center gap-2 text-navy-500">
                      <User className="h-4 w-4" />
                      <span className="text-xs">Credits Completed</span>
                    </div>
                    <p className="mt-1 font-medium text-navy-900">{selectedRequest.totalCredits}</p>
                  </div>
                </div>

                {/* Request Details */}
                <div>
                  <h4 className="font-medium text-navy-900 mb-2">Request Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-navy-500">Purpose:</span>
                      <span className="font-medium text-navy-900">{selectedRequest.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">Request Date:</span>
                      <span className="font-medium text-navy-900">{selectedRequest.requestDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-500">Semesters Completed:</span>
                      <span className="font-medium text-navy-900">{selectedRequest.completedSemesters}</span>
                    </div>
                  </div>
                </div>

                {/* Academic History */}
                <div>
                  <h4 className="font-medium text-navy-900 mb-2">Academic History</h4>
                  <div className="max-h-[200px] overflow-y-auto rounded-lg border border-navy-100">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-navy-50 hover:bg-navy-50">
                          <TableHead className="text-xs">Semester</TableHead>
                          <TableHead className="text-xs text-center">SGPA</TableHead>
                          <TableHead className="text-xs text-center">Credits</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradeHistory.map((semester) => (
                          <TableRow key={semester.semester}>
                            <TableCell className="text-sm">{semester.semester}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {semester.sgpa.toFixed(2)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm">{semester.credits}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Rejection Reason (if pending) */}
                {selectedRequest.status === 'pending' && (
                  <div>
                    <h4 className="font-medium text-navy-900 mb-2">Rejection Reason (Optional)</h4>
                    <Textarea
                      placeholder="Enter reason for rejection if applicable..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="border-navy-200"
                    />
                  </div>
                )}

                {/* Rejection reason display (if rejected) */}
                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                    <h4 className="font-medium text-destructive mb-1">Rejection Reason</h4>
                    <p className="text-sm text-destructive/80">{selectedRequest.rejectionReason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-navy-100">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
