'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowRightLeft, Building, CheckCircle2, Clock, FileText, Search, XCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type TransferRequest = {
  id: string
  studentId: string
  studentName: string
  studentEnrollmentId: string
  sourceInstitution: string
  destinationInstitution: string
  creditsRequested: number
  courseCodes: string[]
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  signers: Array<{ name: string; role: string; signed: boolean }>
  signatures: { required: number; received: number }
}

function getStatusBadge(status: TransferRequest['status']) {
  switch (status) {
    case 'pending':
      return <Badge className="border-0 bg-gold text-navy-900">Pending Review</Badge>
    case 'approved':
      return <Badge className="border-0 bg-success text-white">Approved</Badge>
    case 'rejected':
      return <Badge className="border-0 bg-destructive text-white">Rejected</Badge>
  }
}

function TransferCard({
  transfer,
  direction,
  onDecision,
}: {
  transfer: TransferRequest
  direction: 'incoming' | 'outgoing'
  onDecision: (transferId: string, status: 'approved' | 'rejected') => Promise<void>
}) {
  const progressPercent = (transfer.signatures.received / transfer.signatures.required) * 100

  return (
    <Card className="rounded-[12px] border-navy-100 transition-colors hover:border-navy-200">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-navy-100 text-navy-600">
                {transfer.studentName.split(' ').map((part) => part[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-navy-900">{transfer.studentName}</h3>
              <p className="text-sm text-navy-500">{transfer.studentEnrollmentId}</p>
            </div>
          </div>
          {getStatusBadge(transfer.status)}
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm">
          <Building className="h-4 w-4 text-navy-400" />
          <span className="text-navy-600">
            {direction === 'incoming' ? 'From: ' : 'To: '}
            <span className="font-medium text-navy-900">
              {direction === 'incoming' ? transfer.destinationInstitution : transfer.sourceInstitution}
            </span>
          </span>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-navy-600">
            <FileText className="h-4 w-4 text-navy-400" />
            <span>Course Mapping ({transfer.creditsRequested} credits)</span>
          </div>
          <div className="space-y-1 pl-6">
            {transfer.courseCodes.map((course) => (
              <p key={course} className="text-sm text-navy-700">{course}</p>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-navy-50 p-3 text-sm text-navy-600">{transfer.reason}</p>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-navy-700">Multi-Signature Approval</span>
            <span className="text-sm text-navy-500">
              {transfer.signatures.received}/{transfer.signatures.required}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          {transfer.signers.map((signer) => (
            <div key={`${transfer.id}-${signer.name}`} className={cn('flex items-center justify-between rounded-lg px-3 py-2', signer.signed ? 'bg-success/10' : 'bg-navy-50')}>
              <div className="flex items-center gap-2">
                {signer.signed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-navy-400" />}
                <div>
                  <p className="text-sm font-medium text-navy-900">{signer.name}</p>
                  <p className="text-xs text-navy-500">{signer.role}</p>
                </div>
              </div>
              <Badge variant="outline" className={signer.signed ? 'border-success/30 text-success text-xs' : 'text-xs text-navy-500'}>
                {signer.signed ? 'Signed' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>

        {transfer.status === 'pending' ? (
          <div className="mt-4 flex gap-2 border-t border-navy-100 pt-4">
            <Button variant="outline" size="sm" className="flex-1 border-destructive text-destructive hover:bg-destructive/10" onClick={() => onDecision(transfer.id, 'rejected')}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button size="sm" className="flex-1 bg-navy-700 hover:bg-navy-800" onClick={() => onDecision(transfer.id, 'approved')}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Sign & Approve
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function CreditTransferPage() {
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const loadTransfers = async () => {
    const response = await fetch('/api/faculty/transfers')
    const payload = await response.json()
    setTransfers(payload.transfers)
  }

  useEffect(() => {
    loadTransfers().catch(() => setTransfers([]))
  }, [])

  const handleDecision = async (transferId: string, status: 'approved' | 'rejected') => {
    await fetch('/api/faculty/transfer/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId, status }),
    })
    await loadTransfers()
  }

  const filteredTransfers = transfers.filter((transfer) => {
    const query = searchQuery.toLowerCase()
    return (
      transfer.studentName.toLowerCase().includes(query) ||
      transfer.destinationInstitution.toLowerCase().includes(query) ||
      transfer.sourceInstitution.toLowerCase().includes(query)
    )
  })

  const incomingTransfers = filteredTransfers.filter((transfer) => transfer.destinationInstitution !== transfer.sourceInstitution)
  const outgoingTransfers = filteredTransfers
  const pendingIncoming = incomingTransfers.filter((transfer) => transfer.status === 'pending').length
  const pendingOutgoing = outgoingTransfers.filter((transfer) => transfer.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Credit Transfer Review</h1>
          <p className="text-navy-500">Review and approve inter-institutional credit transfers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <ArrowRightLeft className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{filteredTransfers.length}</p>
                <p className="text-xs text-navy-500">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <ArrowRight className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{pendingIncoming}</p>
                <p className="text-xs text-navy-500">Pending Incoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-600/10 p-2">
                <ArrowLeft className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{pendingOutgoing}</p>
                <p className="text-xs text-navy-500">Tracked Requests</p>
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
                <p className="text-2xl font-bold text-navy-900">{filteredTransfers.filter((transfer) => transfer.status === 'approved').length}</p>
                <p className="text-xs text-navy-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="relative min-w-[250px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <Input placeholder="Search by student or institution..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="border-navy-200 bg-white pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="incoming" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Incoming ({incomingTransfers.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            All Requests ({outgoingTransfers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {incomingTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} direction="incoming" onDecision={handleDecision} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outgoing" className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {outgoingTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} direction="outgoing" onDecision={handleDecision} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
