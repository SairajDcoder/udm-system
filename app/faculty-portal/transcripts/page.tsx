'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import { Search, Loader2, Clock, CheckCircle2, XCircle, FileCheck } from 'lucide-react'

type TranscriptRequest = {
  id: string
  studentId: string
  studentName: string
  studentEnrollmentId: string
  purpose: string
  destination: string
  address: string
  copies: number
  format: string
  notes: string
  fee: number
  status: 'pending' | 'processing' | 'ready' | 'rejected'
  requestDate: string
  readyAt?: string
  cid?: string
  hashId?: string
}

function statusBadge(status: TranscriptRequest['status']) {
  if (status === 'ready') {
    return <Badge className="bg-success text-white border-0">Ready</Badge>
  }
  if (status === 'rejected') {
    return <Badge variant="destructive">Rejected</Badge>
  }
  if (status === 'processing') {
    return <Badge className="bg-gold text-navy-900 border-0">Processing</Badge>
  }
  return <Badge className="bg-navy-200 text-navy-800 border-0">Pending</Badge>
}

export default function TranscriptApprovalPage() {
  const [requests, setRequests] = useState<TranscriptRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<TranscriptRequest | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const filteredRequests = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return requests.filter((request) => {
      const matchesQuery =
        request.studentName.toLowerCase().includes(query) ||
        request.studentEnrollmentId.toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query) ||
        request.destination.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [requests, searchQuery, statusFilter])

  async function loadRequests() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/faculty/transcripts', { cache: 'no-store' })
      const data = await response.json()
      setRequests(Array.isArray(data.requests) ? data.requests : [])
    } catch {
      setError('Unable to load transcript requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  const openPanel = (request: TranscriptRequest) => {
    setSelectedRequest(request)
    setNote('')
    setPanelOpen(true)
    setMessage(null)
  }

  const updateStatus = async (status: TranscriptRequest['status']) => {
    if (!selectedRequest) return
    setUpdating(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/faculty/transcripts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status,
          note: note.trim() || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update request.')
      }
      setMessage(`Request ${selectedRequest.id} updated to ${status}.`)
      setPanelOpen(false)
      setSelectedRequest(null)
      await loadRequests()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update request.')
    } finally {
      setUpdating(false)
    }
  }

  const pendingCount = requests.filter((request) => request.status === 'pending' || request.status === 'processing').length
  const readyCount = requests.filter((request) => request.status === 'ready').length
  const rejectedCount = requests.filter((request) => request.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-900">Transcript Approval</h1>
        <p className="text-navy-500">Review and process transcript generation requests</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gold" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{pendingCount}</p>
                <p className="text-xs text-navy-500">Pending / Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{readyCount}</p>
                <p className="text-xs text-navy-500">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{rejectedCount}</p>
                <p className="text-xs text-navy-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-navy-700" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{requests.length}</p>
                <p className="text-xs text-navy-500">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by student, ID, destination..."
                className="border-navy-200 bg-white pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-navy-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading transcript requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No transcript requests found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700">Request</TableHead>
                  <TableHead className="font-semibold text-navy-700">Student</TableHead>
                  <TableHead className="font-semibold text-navy-700">Destination</TableHead>
                  <TableHead className="font-semibold text-navy-700">Purpose</TableHead>
                  <TableHead className="font-semibold text-navy-700">Requested</TableHead>
                  <TableHead className="font-semibold text-navy-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-navy-50"
                    onClick={() => openPanel(request)}
                  >
                    <TableCell className="font-mono text-sm text-navy-600">{request.id}</TableCell>
                    <TableCell>
                      <p className="font-medium text-navy-900">{request.studentName}</p>
                      <p className="text-xs text-navy-500">{request.studentEnrollmentId}</p>
                    </TableCell>
                    <TableCell className="text-navy-600">{request.destination}</TableCell>
                    <TableCell className="text-navy-600">{request.purpose}</TableCell>
                    <TableCell className="text-navy-600">{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>{statusBadge(request.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl text-navy-900">
              {selectedRequest?.id ?? 'Transcript Request'}
            </SheetTitle>
            <SheetDescription>
              Review student details, request metadata, and decision note.
            </SheetDescription>
          </SheetHeader>

          {!selectedRequest ? null : (
            <div className="mt-6 space-y-4">
              <Card className="rounded-[12px] border-navy-100">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="text-sm text-navy-500">Student</p>
                    <p className="font-medium text-navy-900">
                      {selectedRequest.studentName} ({selectedRequest.studentEnrollmentId})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-navy-500">Destination</p>
                    <p className="text-navy-800">{selectedRequest.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-navy-500">Delivery Address</p>
                    <p className="text-navy-800">{selectedRequest.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-navy-500">Purpose</p>
                    <p className="text-navy-800">{selectedRequest.purpose}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {statusBadge(selectedRequest.status)}
                    <Badge variant="outline">{selectedRequest.format}</Badge>
                    <Badge variant="outline">{selectedRequest.copies} copy/copies</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <p className="text-sm font-medium text-navy-700">Decision Note (optional)</p>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  className="border-navy-200"
                  placeholder="Add review context for approval/rejection..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => void updateStatus('ready')}
                  disabled={updating || selectedRequest.status === 'ready'}
                  className="bg-success hover:bg-success/90"
                >
                  {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Approve & Mark Ready
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void updateStatus('rejected')}
                  disabled={updating || selectedRequest.status === 'rejected'}
                >
                  {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
