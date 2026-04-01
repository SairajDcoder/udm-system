'use client'

import { useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  Users,
  FileSpreadsheet,
  FolderOpen,
  Filter,
} from 'lucide-react'

// Sample course data
const courses = [
  {
    id: 'CS301',
    name: 'Data Structures & Algorithms',
    department: 'Computer Science',
    credits: 4,
    semester: 'Spring 2026',
    instructor: 'Dr. Sarah Johnson',
    enrolled: 45,
    capacity: 50,
    status: 'active',
  },
  {
    id: 'CS401',
    name: 'Machine Learning',
    department: 'Computer Science',
    credits: 3,
    semester: 'Spring 2026',
    instructor: 'Dr. Sarah Johnson',
    enrolled: 38,
    capacity: 40,
    status: 'active',
  },
  {
    id: 'MATH201',
    name: 'Linear Algebra',
    department: 'Mathematics',
    credits: 3,
    semester: 'Spring 2026',
    instructor: 'Dr. Michael Chen',
    enrolled: 55,
    capacity: 60,
    status: 'active',
  },
  {
    id: 'CS201',
    name: 'Introduction to Programming',
    department: 'Computer Science',
    credits: 4,
    semester: 'Fall 2025',
    instructor: 'Dr. Sarah Johnson',
    enrolled: 48,
    capacity: 50,
    status: 'completed',
  },
  {
    id: 'CS501',
    name: 'Advanced Cryptography',
    department: 'Computer Science',
    credits: 3,
    semester: 'Spring 2026',
    instructor: 'Dr. Emily White',
    enrolled: 0,
    capacity: 30,
    status: 'draft',
  },
]

// Sample enrolled students
const enrolledStudents = [
  { id: 'STU001', name: 'Alice Johnson', email: 'alice.j@university.edu', grade: 'A', status: 'active' },
  { id: 'STU002', name: 'Bob Wilson', email: 'bob.w@university.edu', grade: 'B+', status: 'active' },
  { id: 'STU003', name: 'Carol Davis', email: 'carol.d@university.edu', grade: 'A-', status: 'active' },
  { id: 'STU004', name: 'David Lee', email: 'david.l@university.edu', grade: 'B', status: 'active' },
  { id: 'STU005', name: 'Emma Brown', email: 'emma.b@university.edu', grade: '-', status: 'dropped' },
]

// Sample materials
const courseMaterials = [
  { id: 1, name: 'Syllabus.pdf', type: 'PDF', size: '245 KB', ipfsHash: 'Qm...abc1', uploadedAt: '2026-01-15' },
  { id: 2, name: 'Lecture 1 - Introduction.pdf', type: 'PDF', size: '1.2 MB', ipfsHash: 'Qm...abc2', uploadedAt: '2026-01-20' },
  { id: 3, name: 'Assignment 1.pdf', type: 'PDF', size: '89 KB', ipfsHash: 'Qm...abc3', uploadedAt: '2026-01-25' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-success text-white border-0">Active</Badge>
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

type Course = typeof courses[0]

export default function CourseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create')

  const filteredCourses = courses.filter(
    (course) =>
      course.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openDrawer = (mode: 'create' | 'edit' | 'view', course?: Course) => {
    setDrawerMode(mode)
    setSelectedCourse(course || null)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Course Management</h1>
          <p className="text-navy-500">Manage courses, enrollments, and materials</p>
        </div>
        <Button onClick={() => openDrawer('create')} className="bg-navy-700 hover:bg-navy-800">
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-navy-200"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] border-navy-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-navy-200 text-navy-600">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50 hover:bg-navy-50">
                <TableHead className="font-semibold text-navy-700">Course ID</TableHead>
                <TableHead className="font-semibold text-navy-700">Course Name</TableHead>
                <TableHead className="font-semibold text-navy-700">Department</TableHead>
                <TableHead className="font-semibold text-navy-700">Credits</TableHead>
                <TableHead className="font-semibold text-navy-700">Semester</TableHead>
                <TableHead className="font-semibold text-navy-700">Enrollment</TableHead>
                <TableHead className="font-semibold text-navy-700">Status</TableHead>
                <TableHead className="font-semibold text-navy-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow
                  key={course.id}
                  className="cursor-pointer hover:bg-navy-50"
                  onClick={() => openDrawer('view', course)}
                >
                  <TableCell className="font-mono font-medium text-navy-900">{course.id}</TableCell>
                  <TableCell className="font-medium text-navy-900">{course.name}</TableCell>
                  <TableCell className="text-navy-600">{course.department}</TableCell>
                  <TableCell className="text-navy-600">{course.credits}</TableCell>
                  <TableCell className="text-navy-600">{course.semester}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-navy-900">{course.enrolled}</span>
                      <span className="text-navy-400">/</span>
                      <span className="text-navy-500">{course.capacity}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDrawer('view', course)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDrawer('edit', course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Course Drawer (600px wide) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl">
              {drawerMode === 'create' && 'Create New Course'}
              {drawerMode === 'edit' && `Edit: ${selectedCourse?.name}`}
              {drawerMode === 'view' && selectedCourse?.name}
            </SheetTitle>
            <SheetDescription>
              {drawerMode === 'create' && 'Fill in the course details below'}
              {drawerMode === 'edit' && 'Update the course information'}
              {drawerMode === 'view' && `${selectedCourse?.id} - ${selectedCourse?.department}`}
            </SheetDescription>
          </SheetHeader>

          {/* Create/Edit Form */}
          {(drawerMode === 'create' || drawerMode === 'edit') && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course ID</Label>
                  <Input
                    id="courseId"
                    defaultValue={selectedCourse?.id}
                    placeholder="e.g., CS301"
                    className="border-navy-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    defaultValue={selectedCourse?.credits}
                    placeholder="e.g., 3"
                    className="border-navy-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  defaultValue={selectedCourse?.name}
                  placeholder="e.g., Data Structures & Algorithms"
                  className="border-navy-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select defaultValue={selectedCourse?.department || ''}>
                    <SelectTrigger className="border-navy-200">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select defaultValue={selectedCourse?.semester || ''}>
                    <SelectTrigger className="border-navy-200">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                      <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                      <SelectItem value="Summer 2026">Summer 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  defaultValue={selectedCourse?.capacity}
                  placeholder="Maximum students"
                  className="border-navy-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Course description..."
                  className="border-navy-200 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-navy-700 hover:bg-navy-800">
                  {drawerMode === 'create' ? 'Create Course' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {/* View Mode with Tabs */}
          {drawerMode === 'view' && selectedCourse && (
            <div className="mt-6">
              {/* Course Info Header */}
              <div className="mb-6 rounded-lg bg-navy-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-navy-500">Instructor:</span>
                    <p className="font-medium text-navy-900">{selectedCourse.instructor}</p>
                  </div>
                  <div>
                    <span className="text-navy-500">Credits:</span>
                    <p className="font-medium text-navy-900">{selectedCourse.credits}</p>
                  </div>
                  <div>
                    <span className="text-navy-500">Enrollment:</span>
                    <p className="font-medium text-navy-900">{selectedCourse.enrolled}/{selectedCourse.capacity}</p>
                  </div>
                  <div>
                    <span className="text-navy-500">Status:</span>
                    <p className="mt-1">{getStatusBadge(selectedCourse.status)}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="students" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="students" className="gap-2">
                    <Users className="h-4 w-4" />
                    Students
                  </TabsTrigger>
                  <TabsTrigger value="grades" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Grades
                  </TabsTrigger>
                  <TabsTrigger value="materials" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Materials
                  </TabsTrigger>
                </TabsList>

                {/* Enrolled Students Tab */}
                <TabsContent value="students" className="mt-4">
                  <div className="rounded-lg border border-navy-100">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-navy-50 hover:bg-navy-50">
                          <TableHead className="text-navy-700">ID</TableHead>
                          <TableHead className="text-navy-700">Name</TableHead>
                          <TableHead className="text-navy-700">Grade</TableHead>
                          <TableHead className="text-navy-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrolledStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-mono text-sm">{student.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-navy-900">{student.name}</p>
                                <p className="text-xs text-navy-500">{student.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{student.grade}</TableCell>
                            <TableCell>
                              {student.status === 'active' ? (
                                <Badge className="bg-success text-white border-0">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Dropped</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades" className="mt-4">
                  <div className="rounded-lg border border-navy-100 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-navy-900">Grade Distribution</h4>
                      <Button size="sm" className="bg-navy-700 hover:bg-navy-800">
                        Enter Grades
                      </Button>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-center">
                      {['A', 'B', 'C', 'D', 'F'].map((grade) => (
                        <div key={grade} className="rounded-lg bg-navy-50 p-3">
                          <p className="text-2xl font-bold text-navy-900">{Math.floor(Math.random() * 15)}</p>
                          <p className="text-sm text-navy-500">Grade {grade}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Materials Tab (IPFS) */}
                <TabsContent value="materials" className="mt-4">
                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div className="rounded-lg border-2 border-dashed border-navy-200 p-6 text-center hover:border-navy-400 transition-colors">
                      <Upload className="mx-auto h-8 w-8 text-navy-400" />
                      <p className="mt-2 text-sm font-medium text-navy-900">Drop files to upload to IPFS</p>
                      <p className="text-xs text-navy-500">or click to browse</p>
                    </div>

                    {/* Materials List */}
                    <div className="rounded-lg border border-navy-100">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-navy-50 hover:bg-navy-50">
                            <TableHead className="text-navy-700">File Name</TableHead>
                            <TableHead className="text-navy-700">Size</TableHead>
                            <TableHead className="text-navy-700">IPFS Hash</TableHead>
                            <TableHead className="text-navy-700">Uploaded</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courseMaterials.map((material) => (
                            <TableRow key={material.id}>
                              <TableCell className="font-medium text-navy-900">{material.name}</TableCell>
                              <TableCell className="text-navy-600">{material.size}</TableCell>
                              <TableCell className="font-blockchain text-navy-500">{material.ipfsHash}</TableCell>
                              <TableCell className="text-navy-600">{material.uploadedAt}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-navy-100">
                <Button variant="outline" onClick={() => openDrawer('edit', selectedCourse)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
                <Button className="bg-navy-700 hover:bg-navy-800">
                  Manage Enrollment
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
