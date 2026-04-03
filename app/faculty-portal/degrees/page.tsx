'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Search, GraduationCap, Loader2, CheckCircle2, Clock } from 'lucide-react'

type DegreeCandidate = {
  id: string
  name: string
  program: string
  batch: string
  cgpa: number
  credits: number
  requiredCredits: number
  status: 'eligible' | 'pending' | 'issued'
}

function statusBadge(status: DegreeCandidate['status']) {
  if (status === 'eligible') {
    return <Badge className="bg-success text-white border-0">Eligible</Badge>
  }
  if (status === 'issued') {
    return <Badge className="bg-navy-700 text-white border-0">Issued</Badge>
  }
  return <Badge className="bg-gold text-navy-900 border-0">Pending</Badge>
}

export default function DegreeIssuancePage() {
  const [candidates, setCandidates] = useState<DegreeCandidate[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return candidates.filter((candidate) => {
      const matchesQuery =
        candidate.name.toLowerCase().includes(query) ||
        candidate.id.toLowerCase().includes(query) ||
        candidate.program.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [candidates, searchQuery, statusFilter])

  const eligibleIds = filteredCandidates.filter((candidate) => candidate.status === 'eligible').map((candidate) => candidate.id)

  async function loadCandidates() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/faculty/degree/candidates', { cache: 'no-store' })
      const data = await response.json()
      setCandidates(Array.isArray(data.candidates) ? data.candidates : [])
    } catch {
      setError('Unable to load degree candidates.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCandidates()
  }, [])

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((previous) =>
      previous.includes(studentId) ? previous.filter((id) => id !== studentId) : [...previous, studentId]
    )
  }

  const toggleAllEligible = () => {
    if (selectedStudents.length === eligibleIds.length) {
      setSelectedStudents([])
      return
    }
    setSelectedStudents(eligibleIds)
  }

  const issueDegrees = async () => {
    if (selectedStudents.length === 0) return
    setIssuing(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/faculty/degrees/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to issue degree credentials.')
      }
      const successCount = Array.isArray(data.results)
        ? data.results.filter((result: { issued: boolean }) => result.issued).length
        : 0
      setMessage(`Degree issuance completed. ${successCount} credential(s) issued.`)
      setSelectedStudents([])
      await loadCandidates()
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : 'Failed to issue degrees.')
    } finally {
      setIssuing(false)
    }
  }

  const eligibleCount = candidates.filter((candidate) => candidate.status === 'eligible').length
  const issuedCount = candidates.filter((candidate) => candidate.status === 'issued').length
  const pendingCount = candidates.filter((candidate) => candidate.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Degree Issuance</h1>
          <p className="text-navy-500">Issue institutional blockchain degree credentials</p>
        </div>
        <Button
          onClick={() => void issueDegrees()}
          disabled={issuing || selectedStudents.length === 0}
          className="bg-navy-700 hover:bg-navy-800"
        >
          {issuing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GraduationCap className="mr-2 h-4 w-4" />}
          Issue Degrees ({selectedStudents.length})
        </Button>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{eligibleCount}</p>
                <p className="text-xs text-navy-500">Eligible</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gold" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{pendingCount}</p>
                <p className="text-xs text-navy-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-navy-700" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{issuedCount}</p>
                <p className="text-xs text-navy-500">Already Issued</p>
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
                placeholder="Search by student, ID, program..."
                className="border-navy-200 bg-white pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
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
              Loading candidates...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No candidates found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 hover:bg-navy-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={eligibleIds.length > 0 && selectedStudents.length === eligibleIds.length}
                      onCheckedChange={toggleAllEligible}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700">Student</TableHead>
                  <TableHead className="font-semibold text-navy-700">Program</TableHead>
                  <TableHead className="font-semibold text-navy-700">Batch</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">CGPA</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Credits</TableHead>
                  <TableHead className="font-semibold text-navy-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => {
                  const disabled = candidate.status !== 'eligible'
                  return (
                    <TableRow
                      key={candidate.id}
                      className={disabled ? 'opacity-70' : 'cursor-pointer hover:bg-navy-50'}
                      onClick={() => {
                        if (!disabled) toggleStudent(candidate.id)
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(candidate.id)}
                          disabled={disabled}
                          onCheckedChange={() => toggleStudent(candidate.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-navy-900">{candidate.name}</p>
                        <p className="font-mono text-xs text-navy-500">{candidate.id}</p>
                      </TableCell>
                      <TableCell className="text-navy-700">{candidate.program}</TableCell>
                      <TableCell className="text-navy-700">{candidate.batch}</TableCell>
                      <TableCell className="text-center text-navy-700">{candidate.cgpa}</TableCell>
                      <TableCell className="text-center text-navy-700">
                        {candidate.credits}/{candidate.requiredCredits}
                      </TableCell>
                      <TableCell>{statusBadge(candidate.status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
