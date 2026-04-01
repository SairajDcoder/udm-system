'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  GraduationCap,
  CheckCircle2,
  Clock,
  FileCheck,
  Key,
  Upload,
  Link as LinkIcon,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample eligible students
const eligibleStudents = [
  {
    id: 'STU001',
    name: 'Alice Johnson',
    program: 'B.Tech Computer Science',
    batch: '2022-2026',
    cgpa: 3.85,
    credits: 160,
    requiredCredits: 160,
    status: 'eligible',
  },
  {
    id: 'STU002',
    name: 'Bob Wilson',
    program: 'B.Tech Computer Science',
    batch: '2022-2026',
    cgpa: 3.72,
    credits: 160,
    requiredCredits: 160,
    status: 'eligible',
  },
  {
    id: 'STU003',
    name: 'Carol Davis',
    program: 'B.Tech Electrical Engineering',
    batch: '2022-2026',
    cgpa: 3.90,
    credits: 160,
    requiredCredits: 160,
    status: 'eligible',
  },
  {
    id: 'STU004',
    name: 'David Lee',
    program: 'B.Tech Mechanical Engineering',
    batch: '2022-2026',
    cgpa: 3.45,
    credits: 158,
    requiredCredits: 160,
    status: 'pending',
  },
  {
    id: 'STU005',
    name: 'Emma Brown',
    program: 'B.Tech Computer Science',
    batch: '2022-2026',
    cgpa: 3.95,
    credits: 160,
    requiredCredits: 160,
    status: 'issued',
  },
  {
    id: 'STU006',
    name: 'Frank Miller',
    program: 'B.Tech Civil Engineering',
    batch: '2022-2026',
    cgpa: 3.60,
    credits: 160,
    requiredCredits: 160,
    status: 'eligible',
  },
]

// Multi-step workflow steps
const workflowSteps = [
  { id: 1, name: 'Review', icon: FileCheck },
  { id: 2, name: 'Generate', icon: GraduationCap },
  { id: 3, name: 'Sign', icon: Key },
  { id: 4, name: 'Upload', icon: Upload },
  { id: 5, name: 'Commit', icon: LinkIcon },
]

type Student = typeof eligibleStudents[0]

function getStatusBadge(status: string) {
  switch (status) {
    case 'eligible':
      return <Badge className="bg-success text-white border-0">Eligible</Badge>
    case 'pending':
      return <Badge className="bg-warning text-navy-900 border-0">Pending</Badge>
    case 'issued':
      return <Badge className="bg-navy-600 text-white border-0">Issued</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function DegreeIssuancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredStudents = eligibleStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.program.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const eligibleCount = eligibleStudents.filter(s => s.status === 'eligible').length
  const issuedCount = eligibleStudents.filter(s => s.status === 'issued').length

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAll = () => {
    const eligibleIds = filteredStudents
      .filter(s => s.status === 'eligible')
      .map(s => s.id)
    
    if (selectedStudents.length === eligibleIds.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(eligibleIds)
    }
  }

  const startWorkflow = () => {
    setCurrentStep(1)
    setWorkflowOpen(true)
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setCurrentStep(prev => prev + 1)
      }, 1500)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeWorkflow = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setWorkflowOpen(false)
      setSelectedStudents([])
      setCurrentStep(1)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Degree Issuance</h1>
          <p className="text-navy-500">Issue blockchain-verified degree certificates</p>
        </div>
        <Button
          onClick={startWorkflow}
          disabled={selectedStudents.length === 0}
          className="bg-navy-700 hover:bg-navy-800"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Issue Degrees ({selectedStudents.length})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{eligibleCount}</p>
                <p className="text-xs text-navy-500">Eligible Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {eligibleStudents.filter(s => s.status === 'pending').length}
                </p>
                <p className="text-xs text-navy-500">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <GraduationCap className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{issuedCount}</p>
                <p className="text-xs text-navy-500">Degrees Issued</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <LinkIcon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{selectedStudents.length}</p>
                <p className="text-xs text-navy-500">Selected</p>
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
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-navy-200"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px] border-navy-200">
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="cs">B.Tech Computer Science</SelectItem>
                <SelectItem value="ee">B.Tech Electrical Engineering</SelectItem>
                <SelectItem value="me">B.Tech Mechanical Engineering</SelectItem>
                <SelectItem value="ce">B.Tech Civil Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] border-navy-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-navy-200 text-navy-600">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Table */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50 hover:bg-navy-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedStudents.length === filteredStudents.filter(s => s.status === 'eligible').length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-navy-700">Student ID</TableHead>
                <TableHead className="font-semibold text-navy-700">Name</TableHead>
                <TableHead className="font-semibold text-navy-700">Program</TableHead>
                <TableHead className="font-semibold text-navy-700">Batch</TableHead>
                <TableHead className="font-semibold text-navy-700 text-center">CGPA</TableHead>
                <TableHead className="font-semibold text-navy-700 text-center">Credits</TableHead>
                <TableHead className="font-semibold text-navy-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className={cn(
                    'cursor-pointer',
                    selectedStudents.includes(student.id) && 'bg-navy-50'
                  )}
                  onClick={() => student.status === 'eligible' && toggleStudent(student.id)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      disabled={student.status !== 'eligible'}
                      onCheckedChange={() => toggleStudent(student.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-navy-600">{student.id}</TableCell>
                  <TableCell className="font-medium text-navy-900">{student.name}</TableCell>
                  <TableCell className="text-navy-600">{student.program}</TableCell>
                  <TableCell className="text-navy-600">{student.batch}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">
                      {student.cgpa.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      'font-medium',
                      student.credits >= student.requiredCredits ? 'text-success' : 'text-warning'
                    )}>
                      {student.credits}/{student.requiredCredits}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Multi-Step Workflow Modal */}
      <Dialog open={workflowOpen} onOpenChange={setWorkflowOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Issue Degree Certificates</DialogTitle>
            <DialogDescription>
              {selectedStudents.length} student(s) selected for degree issuance
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="py-4">
            <div className="flex items-center justify-between">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                        currentStep > step.id
                          ? 'border-success bg-success text-white'
                          : currentStep === step.id
                          ? 'border-gold bg-gold text-navy-900'
                          : 'border-navy-200 bg-white text-navy-400'
                      )}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      'mt-2 text-xs font-medium',
                      currentStep >= step.id ? 'text-navy-900' : 'text-navy-400'
                    )}>
                      {step.name}
                    </span>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 w-12 sm:w-16',
                        currentStep > step.id ? 'bg-success' : 'bg-navy-200'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[200px] py-4">
            {/* Step 1: Review */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-navy-900">Review Selected Students</h3>
                <div className="max-h-[200px] overflow-y-auto rounded-lg border border-navy-100">
                  {selectedStudents.map((id) => {
                    const student = eligibleStudents.find(s => s.id === id)
                    return student ? (
                      <div key={id} className="flex items-center justify-between border-b border-navy-100 p-3 last:border-0">
                        <div>
                          <p className="font-medium text-navy-900">{student.name}</p>
                          <p className="text-sm text-navy-500">{student.program}</p>
                        </div>
                        <Badge variant="outline">CGPA: {student.cgpa}</Badge>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Generate */}
            {currentStep === 2 && (
              <div className="space-y-4 text-center">
                <GraduationCap className="mx-auto h-16 w-16 text-navy-600" />
                <h3 className="font-semibold text-navy-900">Generate Degree Certificates</h3>
                <p className="text-sm text-navy-500">
                  Creating digital degree certificates for {selectedStudents.length} students
                </p>
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    <span className="text-sm text-navy-600">Generating certificates...</span>
                  </div>
                ) : (
                  <Badge className="bg-success text-white border-0">
                    Certificates Generated
                  </Badge>
                )}
              </div>
            )}

            {/* Step 3: Sign (BLS Signature) */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <Key className="mx-auto h-16 w-16 text-navy-600" />
                  <h3 className="mt-4 font-semibold text-navy-900">BLS Digital Signature</h3>
                  <p className="text-sm text-navy-500">
                    Sign certificates using your institutional BLS private key
                  </p>
                </div>
                <div className="rounded-lg bg-navy-50 p-4">
                  <p className="text-xs font-medium text-navy-600 mb-2">Signing Key</p>
                  <div className="font-blockchain text-navy-700 break-all">
                    0x04a8b...{'{your_key}'}...c3f2
                  </div>
                </div>
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    <span className="text-sm text-navy-600">Signing certificates...</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <Badge className="bg-success text-white border-0">
                      All Certificates Signed
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Upload to IPFS */}
            {currentStep === 4 && (
              <div className="space-y-4 text-center">
                <Upload className="mx-auto h-16 w-16 text-navy-600" />
                <h3 className="font-semibold text-navy-900">Upload to IPFS</h3>
                <p className="text-sm text-navy-500">
                  Storing certificates on decentralized storage
                </p>
                {isProcessing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gold" />
                      <span className="text-sm text-navy-600">Uploading to IPFS...</span>
                    </div>
                    <Progress value={65} className="w-48 mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge className="bg-success text-white border-0">
                      Upload Complete
                    </Badge>
                    <p className="font-blockchain text-sm text-navy-500">
                      IPFS CID: QmX7b...9f3k
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Commit to Blockchain */}
            {currentStep === 5 && (
              <div className="space-y-4 text-center">
                <LinkIcon className="mx-auto h-16 w-16 text-navy-600" />
                <h3 className="font-semibold text-navy-900">Commit to Blockchain</h3>
                <p className="text-sm text-navy-500">
                  Recording degree issuance on the blockchain
                </p>
                {isProcessing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gold" />
                      <span className="text-sm text-navy-600">Submitting transaction...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Badge className="bg-success text-white border-0">
                      Transaction Confirmed
                    </Badge>
                    <div className="rounded-lg bg-navy-50 p-4 text-left">
                      <p className="text-xs font-medium text-navy-600 mb-1">Transaction Hash</p>
                      <p className="font-blockchain text-navy-700">
                        0x7f9e8d7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f...
                      </p>
                      <p className="text-xs font-medium text-navy-600 mt-3 mb-1">Block Number</p>
                      <p className="font-mono text-navy-700">18,547,892</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-navy-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                disabled={isProcessing}
                className="bg-navy-700 hover:bg-navy-800"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={completeWorkflow}
                disabled={isProcessing}
                className="bg-success hover:bg-success/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Issuance
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
