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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Eye, Upload, Loader2, Users, FileText, Trash2 } from 'lucide-react'

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
  const [uploadFileBase64, setUploadFileBase64] = useState<string | null>(null)
  const [uploadPolicy, setUploadPolicy] = useState('(role=faculty OR role=student)')

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null)
  const [viewingContent, setViewingContent] = useState<string | null>(null)
  const [viewerLoading, setViewerLoading] = useState(false)

  const [createCourseOpen, setCreateCourseOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({ code: '', title: '', term: '', credits: 3 })
  const [creatingCourse, setCreatingCourse] = useState(false)

  const [enrollOpen, setEnrollOpen] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [enrolling, setEnrolling] = useState(false)

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
    setUploadFileBase64(null)
    setUploadPolicy('(role=faculty OR role=student)')
    await loadRoster(course.id)
  }

  const handleUploadMaterial = async () => {
    const finalBody = uploadFileBase64 || uploadBody.trim()
    if (!selectedCourse || !uploadTitle.trim() || !finalBody) return
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
          body: finalBody,
          policy: uploadPolicy.trim() || '(role=faculty OR role=student)',
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload material.')
      }
      setMessage(`Material uploaded with CID ${data.document?.cid ?? 'generated'}.`)
      setUploadBody('')
      setUploadFileBase64(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setUploadFileBase64(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      e.target.value = ''
      setUploadFileBase64(null)
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadFileBase64(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const [viewingContentType, setViewingContentType] = useState<'text' | 'image' | 'pdf'>('text')

  const handleViewMaterial = async (material: CourseMaterial) => {
    setViewingMaterial(material)
    setViewerOpen(true)
    setViewerLoading(true)
    setViewingContent(null)
    setViewingContentType('text')
    setError(null)

    try {
      const res = await fetch(`/api/ipfs/${material.id}`)
      if (!res.ok) throw new Error('Failed to load document content')
      const data = await res.json()
      
      let finalContent = data.plaintext || data.document?.plaintextPreview || 'No content available.'
      let cType: 'text' | 'image' | 'pdf' = 'text'

      if (finalContent.startsWith('data:image/')) {
        cType = 'image'
      } else if (finalContent.startsWith('data:application/pdf')) {
        cType = 'pdf'
        try {
          const base64Data = finalContent.split(',')[1]
          const binaryData = atob(base64Data)
          const arrayBuffer = new ArrayBuffer(binaryData.length)
          const uint8Array = new Uint8Array(arrayBuffer)
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i)
          }
          const blob = new Blob([uint8Array], { type: 'application/pdf' })
          finalContent = URL.createObjectURL(blob)
        } catch (e) {
          console.error("Failed to convert PDF base64 to blob URL", e)
        }
      }

      setViewingContent(finalContent)
      setViewingContentType(cType)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setViewerLoading(false)
    }
  }


  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return
    setError(null)
    try {
      const res = await fetch(`/api/ipfs/${materialId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete material')
      
      const refreshedCourses = await loadCourses()
      if (selectedCourse) {
        const refreshedCourse = refreshedCourses.find((course: FacultyCourse) => course.id === selectedCourse.id)
        if (refreshedCourse) {
          setSelectedCourse(refreshedCourse)
        }
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourse.code || !newCourse.title || !newCourse.term) return
    setCreatingCourse(true)
    try {
      const response = await fetch('/api/faculty/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      })
      if (!response.ok) throw new Error('Failed to create course')
      await loadCourses()
      setCreateCourseOpen(false)
      setNewCourse({ code: '', title: '', term: '', credits: 3 })
      setMessage('Course created successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreatingCourse(false)
    }
  }

  const fetchAvailableStudents = async () => {
    try {
      const response = await fetch('/api/faculty/users')
      const data = await response.json()
      setAvailableStudents(data.users?.filter((u: any) => u.role === 'student') || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleEnrollStudents = async () => {
    if (!selectedCourse || selectedStudentIds.length === 0) return
    setEnrolling(true)
    try {
      const response = await fetch(`/api/faculty/course/${selectedCourse.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      })
      if (!response.ok) throw new Error('Failed to enroll students')
      await loadCourses()
      await loadRoster(selectedCourse.id)
      setEnrollOpen(false)
      setSelectedStudentIds([])
      setMessage('Students enrolled successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Course Management</h1>
          <p className="text-navy-500">Manage assigned courses, roster, and materials</p>
        </div>
        <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy-800 text-white hover:bg-navy-700">
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Define the details for your new course offering.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. CS-401"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Advanced Cryptography"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="term">Term</Label>
                <Input
                  id="term"
                  placeholder="e.g. Fall 2026"
                  value={newCourse.term}
                  onChange={(e) => setNewCourse({ ...newCourse, term: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreateCourseOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse} disabled={creatingCourse} className="bg-navy-800 text-white hover:bg-navy-700">
                {creatingCourse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

                <TabsContent value="students" className="space-y-4">
                  <div className="flex justify-end">
                    <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-navy-200 text-navy-800" onClick={fetchAvailableStudents}>
                          <Users className="mr-2 h-4 w-4" />
                          Enroll Students
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Enroll Students</DialogTitle>
                          <DialogDescription>
                            Select students to add to the {selectedCourse?.code} roster.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          {availableStudents.length === 0 ? (
                            <p className="text-sm text-navy-500">Loading or no available students...</p>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                              {availableStudents.map((student) => (
                                <Label key={student.id} className="flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-navy-50">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-navy-300 text-navy-800 focus:ring-navy-800"
                                    checked={selectedStudentIds.includes(student.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStudentIds([...selectedStudentIds, student.id])
                                      } else {
                                        setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id))
                                      }
                                    }}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium text-navy-900">{student.fullName || student.id}</span>
                                    <span className="text-xs text-navy-500">{student.institutionalEmail}</span>
                                  </div>
                                </Label>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => {
                            setEnrollOpen(false)
                            setSelectedStudentIds([])
                          }}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleEnrollStudents} 
                            disabled={enrolling || selectedStudentIds.length === 0} 
                            className="bg-navy-800 text-white hover:bg-navy-700"
                          >
                            {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Enroll Selected
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
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
                        <Select value={uploadPolicy} onValueChange={setUploadPolicy}>
                          <SelectTrigger className="border-navy-200">
                            <SelectValue placeholder="Select an access policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="(role=faculty OR role=student)">Faculty & Students</SelectItem>
                            <SelectItem value="(role=faculty)">Faculty Only</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>File Upload (Max 5MB)</Label>
                        <Input 
                          type="file" 
                          accept="application/pdf,image/*,text/*" 
                          onChange={handleFileChange}
                          className="border-navy-200"
                        />
                        <p className="text-xs text-navy-500 mt-1 text-center">OR</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material-body">Plain Text Content</Label>
                        <Textarea
                          id="material-body"
                          value={uploadBody}
                          onChange={(event) => setUploadBody(event.target.value)}
                          placeholder="Paste lecture notes, assignment brief, or resource details..."
                          rows={3}
                          className="border-navy-200"
                          disabled={!!uploadFileBase64}
                        />
                      </div>
                      <Button
                        onClick={() => void handleUploadMaterial()}
                        disabled={uploading || !uploadTitle.trim() || (!uploadBody.trim() && !uploadFileBase64)}
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
                            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-navy-100 bg-navy-50 p-3"
                          >
                            <div>
                              <p className="font-medium text-navy-900">{material.title}</p>
                              <p className="mt-1 text-xs text-navy-600">CID: {material.cid}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{material.sizeKb} KB</Badge>
                                <Badge variant="outline">{new Date(material.uploadedAt).toLocaleDateString()}</Badge>
                                <Badge variant="outline">{material.policy === '(role=faculty OR role=student)' ? 'Faculty & Students' : material.policy === '(role=faculty)' ? 'Faculty Only' : material.policy}</Badge>
                              </div>
                            </div>
                            <div className="mt-3 sm:mt-0 flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewMaterial(material)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleDeleteMaterial(material.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>{viewingMaterial?.title || 'Material Viewer'}</DialogTitle>
                        <DialogDescription>CID: {viewingMaterial?.cid}</DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 min-h-[400px] overflow-hidden rounded-md border border-navy-200 bg-white relative">
                        {viewerLoading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-navy-500">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Decrypting payload...</p>
                          </div>
                        ) : viewingContentType === 'image' ? (
                          <div className="w-full h-full overflow-auto flex items-center justify-center bg-navy-50 p-4">
                            <img src={viewingContent!} alt={viewingMaterial?.title} className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : viewingContentType === 'pdf' ? (
                          <iframe src={viewingContent!} className="w-full h-full border-0" title="Document Viewer" />
                        ) : (
                          <div className="p-4 whitespace-pre-wrap overflow-auto h-full text-navy-800 font-mono text-sm">
                            {viewingContent}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
