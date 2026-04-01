'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Building,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample transfer requests
const incomingTransfers = [
  {
    id: 'TRF001',
    studentName: 'John Smith',
    studentId: 'STU-EXT-001',
    sourceInstitution: 'MIT',
    courses: ['CS101 - Intro to Programming', 'MATH201 - Calculus II'],
    credits: 8,
    requestDate: '2026-03-25',
    status: 'pending',
    signatures: { required: 3, received: 1 },
    signers: [
      { name: 'Dr. Sarah Johnson', role: 'Dept. Head', signed: true },
      { name: 'Dean Office', role: 'Academic Dean', signed: false },
      { name: 'Registrar', role: 'Registrar', signed: false },
    ],
  },
  {
    id: 'TRF002',
    studentName: 'Emily Chen',
    studentId: 'STU-EXT-002',
    sourceInstitution: 'Stanford University',
    courses: ['CS301 - Data Structures', 'CS302 - Algorithms'],
    credits: 6,
    requestDate: '2026-03-22',
    status: 'pending',
    signatures: { required: 3, received: 2 },
    signers: [
      { name: 'Dr. Michael Chen', role: 'Dept. Head', signed: true },
      { name: 'Dean Office', role: 'Academic Dean', signed: true },
      { name: 'Registrar', role: 'Registrar', signed: false },
    ],
  },
  {
    id: 'TRF003',
    studentName: 'David Wilson',
    studentId: 'STU-EXT-003',
    sourceInstitution: 'UC Berkeley',
    courses: ['EE101 - Circuits'],
    credits: 4,
    requestDate: '2026-03-18',
    status: 'approved',
    signatures: { required: 3, received: 3 },
    signers: [
      { name: 'Dr. Emily White', role: 'Dept. Head', signed: true },
      { name: 'Dean Office', role: 'Academic Dean', signed: true },
      { name: 'Registrar', role: 'Registrar', signed: true },
    ],
  },
]

const outgoingTransfers = [
  {
    id: 'TRF004',
    studentName: 'Alice Brown',
    studentId: 'STU001',
    targetInstitution: 'Georgia Tech',
    courses: ['CS401 - Machine Learning', 'CS402 - Deep Learning'],
    credits: 6,
    requestDate: '2026-03-20',
    status: 'pending',
    signatures: { required: 2, received: 1 },
    signers: [
      { name: 'Dr. Sarah Johnson', role: 'Dept. Head', signed: true },
      { name: 'Registrar', role: 'Registrar', signed: false },
    ],
  },
  {
    id: 'TRF005',
    studentName: 'Bob Martinez',
    studentId: 'STU002',
    targetInstitution: 'CMU',
    courses: ['MATH301 - Linear Algebra'],
    credits: 3,
    requestDate: '2026-03-15',
    status: 'approved',
    signatures: { required: 2, received: 2 },
    signers: [
      { name: 'Dr. Michael Chen', role: 'Dept. Head', signed: true },
      { name: 'Registrar', role: 'Registrar', signed: true },
    ],
  },
]

type TransferRequest = typeof incomingTransfers[0]

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-gold text-navy-900 border-0">Pending Signatures</Badge>
    case 'approved':
      return <Badge className="bg-success text-white border-0">Approved</Badge>
    case 'rejected':
      return <Badge className="bg-destructive text-white border-0">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function TransferCard({ transfer, direction }: { transfer: TransferRequest; direction: 'incoming' | 'outgoing' }) {
  const progressPercent = (transfer.signatures.received / transfer.signatures.required) * 100
  
  return (
    <Card className="rounded-[12px] border-navy-100 hover:border-navy-200 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-navy-100 text-navy-600">
                {transfer.studentName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-navy-900">{transfer.studentName}</h3>
              <p className="text-sm text-navy-500">{transfer.studentId}</p>
            </div>
          </div>
          {getStatusBadge(transfer.status)}
        </div>

        {/* Institution */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Building className="h-4 w-4 text-navy-400" />
          <span className="text-navy-600">
            {direction === 'incoming' ? 'From: ' : 'To: '}
            <span className="font-medium text-navy-900">
              {direction === 'incoming' ? (transfer as typeof incomingTransfers[0]).sourceInstitution : (transfer as typeof outgoingTransfers[0]).targetInstitution}
            </span>
          </span>
        </div>

        {/* Courses */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-navy-600">
            <FileText className="h-4 w-4 text-navy-400" />
            <span>Courses ({transfer.credits} credits)</span>
          </div>
          <div className="space-y-1 pl-6">
            {transfer.courses.map((course, idx) => (
              <p key={idx} className="text-sm text-navy-700">{course}</p>
            ))}
          </div>
        </div>

        {/* Signature Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-navy-700">Multi-Signature Approval</span>
            <span className="text-sm text-navy-500">
              {transfer.signatures.received}/{transfer.signatures.required}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Signers */}
        <div className="space-y-2">
          {transfer.signers.map((signer, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2',
                signer.signed ? 'bg-success/10' : 'bg-navy-50'
              )}
            >
              <div className="flex items-center gap-2">
                {signer.signed ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Clock className="h-4 w-4 text-navy-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-navy-900">{signer.name}</p>
                  <p className="text-xs text-navy-500">{signer.role}</p>
                </div>
              </div>
              {signer.signed ? (
                <Badge variant="outline" className="text-success border-success/30 text-xs">
                  Signed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-navy-500 text-xs">
                  Pending
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {transfer.status === 'pending' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-navy-100">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button size="sm" className="flex-1 bg-navy-700 hover:bg-navy-800">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Sign & Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function CreditTransferPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const pendingIncoming = incomingTransfers.filter(t => t.status === 'pending').length
  const pendingOutgoing = outgoingTransfers.filter(t => t.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Credit Transfer Review</h1>
          <p className="text-navy-500">Review and approve inter-institutional credit transfers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <ArrowRightLeft className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {incomingTransfers.length + outgoingTransfers.length}
                </p>
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
                <p className="text-xs text-navy-500">Pending Outgoing</p>
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
                  {incomingTransfers.filter(t => t.status === 'approved').length +
                    outgoingTransfers.filter(t => t.status === 'approved').length}
                </p>
                <p className="text-xs text-navy-500">Approved</p>
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
                placeholder="Search by student name or institution..."
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
            <Button variant="outline" className="border-navy-200 text-navy-600">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Incoming/Outgoing */}
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="incoming" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Incoming ({incomingTransfers.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Outgoing ({outgoingTransfers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {incomingTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} direction="incoming" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outgoing" className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {outgoingTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer as TransferRequest} direction="outgoing" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
