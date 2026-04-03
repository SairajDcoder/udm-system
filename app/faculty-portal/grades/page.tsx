'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { CheckCircle2, Loader2, Save, Send, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const INTERNAL_MAX = 40
const EXTERNAL_MAX = 60

type FacultyCourse = {
  id: string
  code: string
  title: string
  term: string
  credits: number
}

type RosterRow = {
  id: string
  rollNo: string
  name: string
  internal: number
  external: number
  total: number
  grade: string
  status: 'valid' | 'invalid'
}

function calculateGrade(total: number) {
  if (total >= 90) return 'A+'
  if (total >= 85) return 'A'
  if (total >= 80) return 'A-'
  if (total >= 75) return 'B+'
  if (total >= 70) return 'B'
  if (total >= 65) return 'B-'
  if (total >= 60) return 'C+'
  if (total >= 55) return 'C'
  if (total >= 50) return 'C-'
  if (total >= 45) return 'D'
  return 'F'
}

function getStatus(internal: number, external: number): 'valid' | 'invalid' {
  if (internal < 0 || internal > INTERNAL_MAX) return 'invalid'
  if (external < 0 || external > EXTERNAL_MAX) return 'invalid'
  return 'valid'
}

export default function GradeEntryPage() {
  const [courses, setCourses] = useState<FacultyCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  )

  async function loadCourses() {
    setLoadingCourses(true)
    setError(null)
    try {
      const response = await fetch('/api/faculty/grades', { cache: 'no-store' })
      const data = await response.json()
      const fetchedCourses = Array.isArray(data.courses) ? data.courses : []
      setCourses(fetchedCourses)
      if (!selectedCourseId && fetchedCourses.length > 0) {
        setSelectedCourseId(fetchedCourses[0].id)
      }
    } catch {
      setError('Unable to load faculty courses.')
    } finally {
      setLoadingCourses(false)
    }
  }

  async function loadRoster(courseId: string) {
    setLoadingRoster(true)
    setError(null)
    try {
      const response = await fetch(`/api/faculty/course/${courseId}/roster`, { cache: 'no-store' })
      const data = await response.json()
      setRoster(Array.isArray(data.roster) ? data.roster : [])
      setHasChanges(false)
    } catch {
      setError('Unable to load course roster.')
      setRoster([])
    } finally {
      setLoadingRoster(false)
    }
  }

  useEffect(() => {
    void loadCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourseId) return
    void loadRoster(selectedCourseId)
  }, [selectedCourseId])

  const invalidCount = roster.filter((student) => student.status === 'invalid').length
  const average = roster.length === 0
    ? 0
    : Number((roster.reduce((sum, student) => sum + student.total, 0) / roster.length).toFixed(1))

  const updateGrade = (studentId: string, field: 'internal' | 'external', rawValue: string) => {
    const value = Number(rawValue)
    const numericValue = Number.isFinite(value) ? value : 0
    setRoster((previous) =>
      previous.map((student) => {
        if (student.id !== studentId) return student
        const internal = field === 'internal' ? numericValue : student.internal
        const external = field === 'external' ? numericValue : student.external
        const total = internal + external
        return {
          ...student,
          internal,
          external,
          total,
          grade: calculateGrade(total),
          status: getStatus(internal, external),
        }
      })
    )
    setHasChanges(true)
    setMessage(null)
  }

  const handleSubmit = async () => {
    if (!selectedCourse || invalidCount > 0 || roster.length === 0) return
    setSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/faculty/grade/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          term: selectedCourse.term,
          grades: roster.map((student) => ({
            studentId: student.id,
            internal: student.internal,
            external: student.external,
          })),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit grades.')
      }
      setMessage(`Grades submitted for ${data.course?.code ?? selectedCourse.code}.`)
      await loadRoster(selectedCourse.id)
      await loadCourses()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit grades.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Grade Entry</h1>
          <p className="text-navy-500">Submit course grades to GradeRegistry.sol</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-navy-200 text-navy-600" disabled>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !hasChanges || invalidCount > 0 || !selectedCourse}
            className="bg-navy-700 hover:bg-navy-800"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit Grades
          </Button>
        </div>
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

      <Card className="rounded-[12px] border-navy-100">
        <CardHeader>
          <CardTitle className="text-lg text-navy-900">Course & Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium text-navy-700">Course</p>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={loadingCourses || courses.length === 0}
            >
              <SelectTrigger className="border-navy-200">
                <SelectValue placeholder={loadingCourses ? 'Loading courses...' : 'Select course'} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.title} ({course.term})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-navy-100 bg-navy-50 p-3 text-center">
            <p className="text-2xl font-bold text-navy-900">{roster.length}</p>
            <p className="text-xs text-navy-500">Students</p>
          </div>
          <div className="rounded-lg border border-navy-100 bg-navy-50 p-3 text-center">
            <p className="text-2xl font-bold text-navy-900">{average}</p>
            <p className="text-xs text-navy-500">Average Score</p>
          </div>
        </CardContent>
      </Card>

      {invalidCount > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">{invalidCount} invalid grade entries detected</p>
            <p className="text-sm text-destructive/80">
              Internal marks must be 0-{INTERNAL_MAX} and external marks must be 0-{EXTERNAL_MAX}.
            </p>
          </div>
        </div>
      ) : null}

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          {loadingRoster ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-navy-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading roster...
            </div>
          ) : roster.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No student roster available for this course.</div>
          ) : (
            <Table>
              <TableHeader className="bg-navy-50">
                <TableRow className="hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700">Roll No</TableHead>
                  <TableHead className="font-semibold text-navy-700">Student Name</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Internal</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">External</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Total</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Grade</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.map((student) => {
                  const internalInvalid = student.internal < 0 || student.internal > INTERNAL_MAX
                  const externalInvalid = student.external < 0 || student.external > EXTERNAL_MAX
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm text-navy-600">{student.rollNo}</TableCell>
                      <TableCell className="font-medium text-navy-900">{student.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={INTERNAL_MAX}
                          value={student.internal}
                          onChange={(event) => updateGrade(student.id, 'internal', event.target.value)}
                          className={cn(
                            'mx-auto w-24 text-center',
                            internalInvalid && 'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={EXTERNAL_MAX}
                          value={student.external}
                          onChange={(event) => updateGrade(student.id, 'external', event.target.value)}
                          className={cn(
                            'mx-auto w-24 text-center',
                            externalInvalid && 'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center font-semibold text-navy-900">{student.total}</TableCell>
                      <TableCell className="text-center font-semibold text-navy-900">{student.grade}</TableCell>
                      <TableCell className="text-center">
                        {student.status === 'valid' ? (
                          <Badge className="bg-success text-white border-0">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Invalid</Badge>
                        )}
                      </TableCell>
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
