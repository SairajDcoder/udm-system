'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Search, Eye, Upload, Loader2, Users, FileText } from 'lucide-react'

type CourseMaterial = {
  id: string
  title: string
  cid: string
  sizeKb: number
  uploadedAt: string
  policy: string
}

type FacultyCourse = {
  id: string
  code: string
  title: string
  term: string
  credits: number
  studentIds: string[]
  enrolledCount: number
  averageScore: number
  materials: CourseMaterial[]
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

export default function CourseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState<FacultyCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<FacultyCourse | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadBody, setUploadBody] = useState('')
  const [uploadPolicy, setUploadPolicy] = useState('(role=faculty OR role=student)')

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return courses.filter(
      (course) =>
        course.code.toLowerCase().includes(query) ||
        course.title.toLowerCase().includes(query) ||
        course.term.toLowerCase().includes(query)
    )
  }, [courses, searchQuery])

  async function loadCourses() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/faculty/courses', { cache: 'no-store' })
      const data = await response.json()
      const fetchedCourses = Array.isArray(data.courses) ? data.courses : []
      setCourses(fetchedCourses)
      return fetchedCourses
    } catch {
      setError('Unable to load courses.')
      return []
    } finally {
      setLoading(false)
    }
  }

  async function loadRoster(courseId: string) {
    setLoadingRoster(true)
    try {
      const response = await fetch(`/api/faculty/course/${courseId}/roster`, { cache: 'no-store' })
      const data = await response.json()
      setRoster(Array.isArray(data.roster) ? data.roster : [])
    } catch {
      setRoster([])
    } finally {
      setLoadingRoster(false)
    }
  }

  useEffect(() => {
    void loadCourses()
  }, [])

  const openCourse = async (course: FacultyCourse) => {
    setSelectedCourse(course)
    setSheetOpen(true)
    setMessage(null)
    setError(null)
    setUploadTitle(`${course.code} - Course Material`)
    setUploadBody('')
    setUploadPolicy('(role=faculty OR role=student)')
    await loadRoster(course.id)
  }

  const handleUploadMaterial = async () => {
    if (!selectedCourse || !uploadTitle.trim() || !uploadBody.trim()) return
    setUploading(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selectedCourse.code}: ${uploadTitle.trim()}`,
          type: 'course-material',
          body: uploadBody.trim(),
          policy: uploadPolicy.trim() || '(role=faculty OR role=student)',
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload material.')
      }
      setMessage(`Material uploaded with CID ${data.document?.cid ?? 'generated'}.`)
      setUploadBody('')
      const refreshedCourses = await loadCourses()
      const refreshedCourse = refreshedCourses.find((course: FacultyCourse) => course.id === selectedCourse.id)
      if (refreshedCourse) {
        setSelectedCourse(refreshedCourse)
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload material.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Course Management</h1>
          <p className="text-navy-500">Manage assigned courses, roster, and materials</p>
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
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by code, title, or term..."
              className="border-navy-200 bg-white pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-navy-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No course records found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700">Course</TableHead>
                  <TableHead className="font-semibold text-navy-700">Term</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Credits</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Enrolled</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Avg Score</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Materials</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-navy-50">
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm text-navy-700">{course.code}</p>
                        <p className="font-medium text-navy-900">{course.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-navy-600">{course.term}</TableCell>
                    <TableCell className="text-center text-navy-700">{course.credits}</TableCell>
                    <TableCell className="text-center text-navy-700">{course.enrolledCount}</TableCell>
                    <TableCell className="text-center text-navy-700">{course.averageScore}</TableCell>
                    <TableCell className="text-center text-navy-700">{course.materials.length}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        className="border-navy-200 text-navy-600"
                        onClick={() => void openCourse(course)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl text-navy-900">
              {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : 'Course Details'}
            </SheetTitle>
            <SheetDescription>
              {selectedCourse ? `${selectedCourse.term} · ${selectedCourse.credits} credits` : 'Select a course'}
            </SheetDescription>
          </SheetHeader>

          {!selectedCourse ? null : (
            <div className="mt-6 space-y-4">
              <Tabs defaultValue="students" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="students">
                    <Users className="mr-2 h-4 w-4" />
                    Enrolled Students
                  </TabsTrigger>
                  <TabsTrigger value="materials">
                    <FileText className="mr-2 h-4 w-4" />
                    Materials
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="students">
                  <Card className="rounded-[12px] border-navy-100">
                    <CardContent className="p-0">
                      {loadingRoster ? (
                        <div className="flex items-center justify-center gap-2 p-6 text-sm text-navy-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading students...
                        </div>
                      ) : roster.length === 0 ? (
                        <div className="p-6 text-center text-sm text-navy-500">No student roster found.</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-navy-50 hover:bg-navy-50">
                              <TableHead>Roll No</TableHead>
                              <TableHead>Student</TableHead>
                              <TableHead className="text-center">Internal</TableHead>
                              <TableHead className="text-center">External</TableHead>
                              <TableHead className="text-center">Total</TableHead>
                              <TableHead className="text-center">Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {roster.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-mono text-sm">{student.rollNo}</TableCell>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell className="text-center">{student.internal}</TableCell>
                                <TableCell className="text-center">{student.external}</TableCell>
                                <TableCell className="text-center">{student.total}</TableCell>
                                <TableCell className="text-center">{student.grade}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="materials" className="space-y-4">
                  <Card className="rounded-[12px] border-navy-100">
                    <CardHeader>
                      <CardTitle className="text-base text-navy-900">Upload Course Material</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="material-title">Title</Label>
                        <Input
                          id="material-title"
                          value={uploadTitle}
                          onChange={(event) => setUploadTitle(event.target.value)}
                          className="border-navy-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material-policy">Access Policy</Label>
                        <Input
                          id="material-policy"
                          value={uploadPolicy}
                          onChange={(event) => setUploadPolicy(event.target.value)}
                          className="border-navy-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material-body">Content</Label>
                        <Textarea
                          id="material-body"
                          value={uploadBody}
                          onChange={(event) => setUploadBody(event.target.value)}
                          placeholder="Paste lecture notes, assignment brief, or resource details..."
                          rows={5}
                          className="border-navy-200"
                        />
                      </div>
                      <Button
                        onClick={() => void handleUploadMaterial()}
                        disabled={uploading || !uploadTitle.trim() || !uploadBody.trim()}
                        className="bg-navy-700 hover:bg-navy-800"
                      >
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload to IPFS
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[12px] border-navy-100">
                    <CardHeader>
                      <CardTitle className="text-base text-navy-900">Published Materials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(selectedCourse.materials ?? []).length === 0 ? (
                        <p className="text-sm text-navy-500">No course materials uploaded yet.</p>
                      ) : (
                        selectedCourse.materials.map((material) => (
                          <div
                            key={material.id}
                            className="rounded-lg border border-navy-100 bg-navy-50 p-3"
                          >
                            <p className="font-medium text-navy-900">{material.title}</p>
                            <p className="mt-1 text-xs text-navy-600">CID: {material.cid}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{material.sizeKb} KB</Badge>
                              <Badge variant="outline">{new Date(material.uploadedAt).toLocaleDateString()}</Badge>
                              <Badge variant="outline">{material.policy}</Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
