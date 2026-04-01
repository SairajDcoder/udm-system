'use client'

import { useState, useCallback } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Upload,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Grade boundaries
const INTERNAL_MAX = 40
const EXTERNAL_MAX = 60
const TOTAL_MAX = 100

// Sample student data with grades
const initialStudents = [
  { id: 'STU001', rollNo: '2023CS001', name: 'Alice Johnson', internal: 35, external: 52, total: 87, grade: 'A', status: 'valid' },
  { id: 'STU002', rollNo: '2023CS002', name: 'Bob Wilson', internal: 30, external: 45, total: 75, grade: 'B+', status: 'valid' },
  { id: 'STU003', rollNo: '2023CS003', name: 'Carol Davis', internal: 38, external: 55, total: 93, grade: 'A+', status: 'valid' },
  { id: 'STU004', rollNo: '2023CS004', name: 'David Lee', internal: 28, external: 40, total: 68, grade: 'B', status: 'valid' },
  { id: 'STU005', rollNo: '2023CS005', name: 'Emma Brown', internal: 45, external: 50, total: 95, grade: 'A+', status: 'invalid' }, // Internal out of range
  { id: 'STU006', rollNo: '2023CS006', name: 'Frank Miller', internal: 22, external: 35, total: 57, grade: 'C+', status: 'valid' },
  { id: 'STU007', rollNo: '2023CS007', name: 'Grace Chen', internal: 33, external: 48, total: 81, grade: 'A-', status: 'valid' },
  { id: 'STU008', rollNo: '2023CS008', name: 'Henry Park', internal: 25, external: 65, total: 90, grade: 'A', status: 'invalid' }, // External out of range
  { id: 'STU009', rollNo: '2023CS009', name: 'Ivy Martinez', internal: 18, external: 25, total: 43, grade: 'D', status: 'valid' },
  { id: 'STU010', rollNo: '2023CS010', name: 'Jack Thompson', internal: 32, external: 42, total: 74, grade: 'B', status: 'valid' },
]

// Calculate grade from total
function calculateGrade(total: number): string {
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

// Validate marks
function validateMarks(internal: number, external: number): 'valid' | 'invalid' {
  if (internal < 0 || internal > INTERNAL_MAX) return 'invalid'
  if (external < 0 || external > EXTERNAL_MAX) return 'invalid'
  return 'valid'
}

type Student = typeof initialStudents[0]

export default function GradeEntryPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [selectedCourse, setSelectedCourse] = useState('CS301')
  const [isDragging, setIsDragging] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateGrade = useCallback((studentId: string, field: 'internal' | 'external', value: string) => {
    const numValue = parseInt(value) || 0
    
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student
      
      const newInternal = field === 'internal' ? numValue : student.internal
      const newExternal = field === 'external' ? numValue : student.external
      const newTotal = newInternal + newExternal
      const newGrade = calculateGrade(newTotal)
      const newStatus = validateMarks(newInternal, newExternal)
      
      return {
        ...student,
        internal: newInternal,
        external: newExternal,
        total: newTotal,
        grade: newGrade,
        status: newStatus,
      }
    }))
    setHasChanges(true)
  }, [])

  const invalidCount = students.filter(s => s.status === 'invalid').length
  const validCount = students.filter(s => s.status === 'valid').length

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle CSV file drop
    const files = e.dataTransfer.files
    if (files.length > 0) {
      console.log('File dropped:', files[0].name)
      // Process CSV file here
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Grade Entry</h1>
          <p className="text-navy-500">Enter and submit student grades for courses</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-navy-200 text-navy-600">
            <Download className="mr-2 h-4 w-4" />
            Export Template
          </Button>
          <Button
            variant="outline"
            disabled={!hasChanges}
            className="border-navy-200 text-navy-600"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => setSubmitDialogOpen(true)}
            disabled={invalidCount > 0}
            className="bg-navy-700 hover:bg-navy-800"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Grades
          </Button>
        </div>
      </div>

      {/* Course Selection */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-navy-700">Select Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[300px] border-navy-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS301">CS301 - Data Structures & Algorithms</SelectItem>
                  <SelectItem value="CS401">CS401 - Machine Learning</SelectItem>
                  <SelectItem value="CS201">CS201 - Introduction to Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-900">{students.length}</p>
                <p className="text-xs text-navy-500">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{validCount}</p>
                <p className="text-xs text-navy-500">Valid Entries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{invalidCount}</p>
                <p className="text-xs text-navy-500">Errors</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Drag-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-[12px] border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-gold bg-gold/10'
            : 'border-navy-200 hover:border-navy-400'
        )}
      >
        <Upload className={cn('mx-auto h-8 w-8', isDragging ? 'text-gold' : 'text-navy-400')} />
        <p className="mt-2 text-sm font-medium text-navy-900">
          Drag and drop CSV file to bulk upload grades
        </p>
        <p className="text-xs text-navy-500">
          or <button className="text-navy-700 underline">click to browse</button>
        </p>
      </div>

      {/* Validation Warning */}
      {invalidCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">
              {invalidCount} student(s) have invalid grade entries
            </p>
            <p className="text-sm text-destructive/80">
              Please correct the highlighted entries before submitting. Internal marks must be 0-40, External marks must be 0-60.
            </p>
          </div>
        </div>
      )}

      {/* Grade Entry Table */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-navy-50">
                <TableRow className="hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700 w-[100px]">Roll No</TableHead>
                  <TableHead className="font-semibold text-navy-700">Student Name</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center w-[140px]">
                    Internal (0-{INTERNAL_MAX})
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center w-[140px]">
                    External (0-{EXTERNAL_MAX})
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center w-[100px]">
                    Total ({TOTAL_MAX})
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center w-[80px]">
                    Grade
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center w-[100px]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const internalInvalid = student.internal < 0 || student.internal > INTERNAL_MAX
                  const externalInvalid = student.external < 0 || student.external > EXTERNAL_MAX
                  
                  return (
                    <TableRow
                      key={student.id}
                      className={cn(
                        student.status === 'invalid' && 'bg-destructive/5'
                      )}
                    >
                      <TableCell className="font-mono text-sm text-navy-600">
                        {student.rollNo}
                      </TableCell>
                      <TableCell className="font-medium text-navy-900">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          max={INTERNAL_MAX}
                          value={student.internal}
                          onChange={(e) => updateGrade(student.id, 'internal', e.target.value)}
                          className={cn(
                            'w-20 text-center mx-auto',
                            internalInvalid
                              ? 'border-destructive bg-destructive/10 text-destructive focus:ring-destructive'
                              : 'border-navy-200'
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          max={EXTERNAL_MAX}
                          value={student.external}
                          onChange={(e) => updateGrade(student.id, 'external', e.target.value)}
                          className={cn(
                            'w-20 text-center mx-auto',
                            externalInvalid
                              ? 'border-destructive bg-destructive/10 text-destructive focus:ring-destructive'
                              : 'border-navy-200'
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-navy-900">{student.total}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            'border-0',
                            student.grade.startsWith('A') && 'bg-success text-white',
                            student.grade.startsWith('B') && 'bg-navy-600 text-white',
                            student.grade.startsWith('C') && 'bg-gold text-navy-900',
                            student.grade.startsWith('D') && 'bg-warning text-navy-900',
                            student.grade === 'F' && 'bg-destructive text-white'
                          )}
                        >
                          {student.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.status === 'valid' ? (
                          <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grade Distribution Summary */}
      <Card className="rounded-[12px] border-navy-100">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Grade Distribution</CardTitle>
          <CardDescription>Summary of grade entries for {selectedCourse}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-10">
            {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'].map((grade) => {
              const count = students.filter(s => s.grade === grade).length
              return (
                <div key={grade} className="rounded-lg bg-navy-50 p-3 text-center">
                  <p className="text-xl font-bold text-navy-900">{count}</p>
                  <p className="text-xs text-navy-500">{grade}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Submit Grades to Blockchain</DialogTitle>
            <DialogDescription>
              This action will permanently record grades on the blockchain and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-navy-50 p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-navy-600" />
                <div>
                  <p className="font-medium text-navy-900">{selectedCourse}</p>
                  <p className="text-sm text-navy-500">{students.length} students</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-navy-600">All entries validated successfully</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-navy-700 hover:bg-navy-800">
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
