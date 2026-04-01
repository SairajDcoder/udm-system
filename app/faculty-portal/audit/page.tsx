'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  GraduationCap,
  FileSpreadsheet,
  Users,
  Link as LinkIcon,
  Database,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Event types with their styling
const eventTypes = {
  grade_submitted: { label: 'Grade Submitted', color: 'bg-navy-600', icon: FileSpreadsheet },
  transcript_issued: { label: 'Transcript Issued', color: 'bg-gold', icon: FileText },
  degree_minted: { label: 'Degree Minted', color: 'bg-success', icon: GraduationCap },
  user_created: { label: 'User Created', color: 'bg-navy-400', icon: Users },
  credit_transfer: { label: 'Credit Transfer', color: 'bg-navy-500', icon: LinkIcon },
  data_updated: { label: 'Data Updated', color: 'bg-navy-300', icon: Database },
}

type EventType = keyof typeof eventTypes

// Sample audit log entries
const auditLogs = [
  {
    id: 'LOG001',
    timestamp: '2026-03-28T14:32:15Z',
    eventType: 'grade_submitted' as EventType,
    actor: 'Dr. Sarah Johnson',
    actorRole: 'Professor',
    description: 'Submitted final grades for CS301',
    txHash: '0x7f9e8d7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f9a8b7c6d5e4f3a2b1c0d9e8f',
    blockNumber: 18547892,
  },
  {
    id: 'LOG002',
    timestamp: '2026-03-28T13:45:22Z',
    eventType: 'transcript_issued' as EventType,
    actor: 'System',
    actorRole: 'Automated',
    description: 'Transcript issued for Alice Johnson (STU001)',
    txHash: '0x2a8b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b',
    blockNumber: 18547856,
  },
  {
    id: 'LOG003',
    timestamp: '2026-03-28T12:18:05Z',
    eventType: 'degree_minted' as EventType,
    actor: 'Dean Office',
    actorRole: 'Administrator',
    description: 'Degree certificate minted for Carol Davis',
    txHash: '0x5c3d7a2b9e8f1c4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    blockNumber: 18547801,
  },
  {
    id: 'LOG004',
    timestamp: '2026-03-28T11:05:33Z',
    eventType: 'user_created' as EventType,
    actor: 'Admin',
    actorRole: 'System Admin',
    description: 'New faculty account created for Dr. Emily White',
    txHash: '0x8e1f4d5c6b7a8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
    blockNumber: 18547755,
  },
  {
    id: 'LOG005',
    timestamp: '2026-03-28T10:22:18Z',
    eventType: 'credit_transfer' as EventType,
    actor: 'Registrar',
    actorRole: 'Staff',
    description: 'Credit transfer approved for David Lee from MIT',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 18547698,
  },
  {
    id: 'LOG006',
    timestamp: '2026-03-28T09:15:42Z',
    eventType: 'data_updated' as EventType,
    actor: 'Dr. Michael Chen',
    actorRole: 'Professor',
    description: 'Updated course materials for MATH201',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    blockNumber: 18547642,
  },
  {
    id: 'LOG007',
    timestamp: '2026-03-27T16:45:11Z',
    eventType: 'grade_submitted' as EventType,
    actor: 'Dr. Emily White',
    actorRole: 'Professor',
    description: 'Submitted midterm grades for CS401',
    txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    blockNumber: 18547589,
  },
  {
    id: 'LOG008',
    timestamp: '2026-03-27T15:30:28Z',
    eventType: 'transcript_issued' as EventType,
    actor: 'System',
    actorRole: 'Automated',
    description: 'Transcript issued for Bob Wilson (STU002)',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    blockNumber: 18547534,
  },
  {
    id: 'LOG009',
    timestamp: '2026-03-27T14:12:55Z',
    eventType: 'degree_minted' as EventType,
    actor: 'Dean Office',
    actorRole: 'Administrator',
    description: 'Batch degree minting for Spring 2026 graduates (45 degrees)',
    txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    blockNumber: 18547478,
  },
  {
    id: 'LOG010',
    timestamp: '2026-03-27T11:58:03Z',
    eventType: 'user_created' as EventType,
    actor: 'HR Department',
    actorRole: 'System Admin',
    description: 'Bulk user import: 15 new staff accounts created',
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    blockNumber: 18547421,
  },
]

function getEventBadge(eventType: EventType) {
  const config = eventTypes[eventType]
  const Icon = config.icon
  return (
    <Badge className={cn('border-0 text-white', config.color)}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  return {
    date: format(date, 'MMM dd, yyyy'),
    time: format(date, 'HH:mm:ss'),
  }
}

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.txHash.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesEvent = eventFilter === 'all' || log.eventType === eventFilter
    
    return matchesSearch && matchesEvent
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Audit Log Viewer</h1>
          <p className="text-navy-500">View all blockchain-recorded events and transactions</p>
        </div>
        <Button variant="outline" className="border-navy-200 text-navy-600">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <Database className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{auditLogs.length}</p>
                <p className="text-xs text-navy-500">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <GraduationCap className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {auditLogs.filter(l => l.eventType === 'degree_minted').length}
                </p>
                <p className="text-xs text-navy-500">Degrees Minted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <FileText className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {auditLogs.filter(l => l.eventType === 'transcript_issued').length}
                </p>
                <p className="text-xs text-navy-500">Transcripts Issued</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-600/10 p-2">
                <FileSpreadsheet className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {auditLogs.filter(l => l.eventType === 'grade_submitted').length}
                </p>
                <p className="text-xs text-navy-500">Grades Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Hash/Description Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                placeholder="Search by description, actor, or tx hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-navy-200"
              />
            </div>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-navy-200 text-navy-600">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, yyyy')
                    )
                  ) : (
                    'Date Range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Event Type Filter */}
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="grade_submitted">Grade Submitted</SelectItem>
                <SelectItem value="transcript_issued">Transcript Issued</SelectItem>
                <SelectItem value="degree_minted">Degree Minted</SelectItem>
                <SelectItem value="user_created">User Created</SelectItem>
                <SelectItem value="credit_transfer">Credit Transfer</SelectItem>
                <SelectItem value="data_updated">Data Updated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-navy-200 text-navy-600">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dense Log Table */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50 hover:bg-navy-50">
                <TableHead className="font-semibold text-navy-700 w-[150px]">Timestamp</TableHead>
                <TableHead className="font-semibold text-navy-700 w-[160px]">Event Type</TableHead>
                <TableHead className="font-semibold text-navy-700">Actor</TableHead>
                <TableHead className="font-semibold text-navy-700">Description</TableHead>
                <TableHead className="font-semibold text-navy-700">Tx Hash</TableHead>
                <TableHead className="font-semibold text-navy-700 text-right w-[80px]">Block</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const { date, time } = formatTimestamp(log.timestamp)
                return (
                  <TableRow key={log.id} className="hover:bg-navy-50">
                    <TableCell className="py-2">
                      <div>
                        <p className="text-sm font-medium text-navy-900">{date}</p>
                        <p className="text-xs text-navy-500">{time}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {getEventBadge(log.eventType)}
                    </TableCell>
                    <TableCell className="py-2">
                      <div>
                        <p className="text-sm font-medium text-navy-900">{log.actor}</p>
                        <p className="text-xs text-navy-500">{log.actorRole}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 max-w-[300px]">
                      <p className="text-sm text-navy-700 truncate">{log.description}</p>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-blockchain text-navy-500">
                          {log.txHash.slice(0, 10)}...{log.txHash.slice(-6)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-navy-400 hover:text-navy-600">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <span className="font-mono text-sm text-navy-600">
                        #{log.blockNumber.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
