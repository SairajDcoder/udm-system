'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Search, Database, FileText, GraduationCap, FileSpreadsheet, Loader2 } from 'lucide-react'

type AuditLog = {
  id: string
  actorId: string
  actorRole: 'student' | 'faculty' | 'admin' | 'verifier'
  action: string
  targetType: string
  targetId: string
  blockchain: 'student' | 'faculty' | 'institutional'
  transactionHash: string
  blockNumber: number
  gasUsed: number
  createdAt: string
  details: Record<string, string | number | boolean | null>
}

function actionBadge(action: string) {
  if (action.includes('degree')) {
    return (
      <Badge className="bg-success text-white border-0">
        <GraduationCap className="mr-1 h-3 w-3" />
        Degree
      </Badge>
    )
  }
  if (action.includes('grade')) {
    return (
      <Badge className="bg-navy-700 text-white border-0">
        <FileSpreadsheet className="mr-1 h-3 w-3" />
        Grade
      </Badge>
    )
  }
  if (action.includes('transcript')) {
    return (
      <Badge className="bg-gold text-navy-900 border-0">
        <FileText className="mr-1 h-3 w-3" />
        Transcript
      </Badge>
    )
  }
  return <Badge variant="outline">{action}</Badge>
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [chainFilter, setChainFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const filteredLogs = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return logs.filter((log) => {
      const matchesQuery =
        log.action.toLowerCase().includes(query) ||
        log.actorId.toLowerCase().includes(query) ||
        log.transactionHash.toLowerCase().includes(query) ||
        log.targetId.toLowerCase().includes(query)
      const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter)
      const matchesChain = chainFilter === 'all' || log.blockchain === chainFilter
      return matchesQuery && matchesAction && matchesChain
    })
  }, [logs, searchQuery, actionFilter, chainFilter])

  useEffect(() => {
    async function loadLogs() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/audit/logs', { cache: 'no-store' })
        const data = await response.json()
        setLogs(Array.isArray(data.logs) ? data.logs : [])
      } catch {
        setError('Unable to load audit logs.')
      } finally {
        setLoading(false)
      }
    }
    void loadLogs()
  }, [])

  const degreeEvents = logs.filter((log) => log.action.includes('degree')).length
  const transcriptEvents = logs.filter((log) => log.action.includes('transcript')).length
  const gradeEvents = logs.filter((log) => log.action.includes('grade')).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-900">Audit Log Viewer</h1>
        <p className="text-navy-500">Immutable events recorded across UniChain modules</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-navy-700" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{logs.length}</p>
                <p className="text-xs text-navy-500">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{degreeEvents}</p>
                <p className="text-xs text-navy-500">Degree Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gold" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{transcriptEvents}</p>
                <p className="text-xs text-navy-500">Transcript Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-navy-700" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{gradeEvents}</p>
                <p className="text-xs text-navy-500">Grade Events</p>
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
                placeholder="Search by action, actor, tx hash..."
                className="border-navy-200 bg-white pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="grade">Grade</SelectItem>
                <SelectItem value="transcript">Transcript</SelectItem>
                <SelectItem value="degree">Degree</SelectItem>
                <SelectItem value="access">Access</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chainFilter} onValueChange={setChainFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty/Admin</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
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
              Loading audit events...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No audit events match the selected filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700">Timestamp</TableHead>
                  <TableHead className="font-semibold text-navy-700">Action</TableHead>
                  <TableHead className="font-semibold text-navy-700">Actor</TableHead>
                  <TableHead className="font-semibold text-navy-700">Target</TableHead>
                  <TableHead className="font-semibold text-navy-700">Chain</TableHead>
                  <TableHead className="font-semibold text-navy-700">Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-navy-50">
                    <TableCell className="text-navy-700">{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{actionBadge(log.action)}</TableCell>
                    <TableCell>
                      <p className="font-medium text-navy-900">{log.actorId}</p>
                      <p className="text-xs capitalize text-navy-500">{log.actorRole}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-navy-800">{log.targetType}</p>
                      <p className="text-xs text-navy-500">{log.targetId}</p>
                    </TableCell>
                    <TableCell className="capitalize text-navy-700">{log.blockchain}</TableCell>
                    <TableCell>
                      <code className="text-xs text-navy-600">{log.transactionHash}</code>
                      <p className="mt-1 text-xs text-navy-500">Block #{log.blockNumber} · Gas {log.gasUsed}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
