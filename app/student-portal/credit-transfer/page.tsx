"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowRightLeft,
  Upload,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Circle,
  Send,
  X,
} from "lucide-react"

// Visual Stepper Component
function TransferStepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, name: "Request Submitted", description: "Application received" },
    { id: 2, name: "Document Review", description: "Verifying credentials" },
    { id: 3, name: "Institution Review", description: "Awaiting destination approval" },
    { id: 4, name: "Credit Evaluation", description: "Determining transferable credits" },
    { id: 5, name: "Transfer Complete", description: "Credits transferred" },
  ]

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep
        const isCurrent = step.id === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="flex gap-4">
            {/* Step Indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "bg-teal-500 border-teal-500"
                    : isCurrent
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : isCurrent ? (
                  <Clock className="h-5 w-5 text-teal-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-16 ${
                    isCompleted ? "bg-teal-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Step Content */}
            <div className="pb-8">
              <p
                className={`font-medium ${
                  isCompleted || isCurrent ? "text-navy-900" : "text-gray-400"
                }`}
              >
                {step.name}
              </p>
              <p
                className={`text-sm ${
                  isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {step.description}
              </p>
              {isCurrent && (
                <Badge className="mt-2 bg-teal-100 text-teal-700 rounded-full">
                  In Progress
                </Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Sample Active Transfers
const activeTransfers = [
  {
    id: "CT-2026-0012",
    destination: "MIT",
    status: 3,
    submittedDate: "Mar 20, 2026",
    creditsRequested: 24,
  },
  {
    id: "CT-2026-0008",
    destination: "Stanford University",
    status: 5,
    submittedDate: "Feb 15, 2026",
    creditsRequested: 18,
    creditsApproved: 15,
  },
]

export default function CreditTransferPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => setIsSubmitting(false), 1500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(files).map(f => f.name)])
    }
  }

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== fileName))
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
              <ArrowRightLeft className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Requests</p>
              <p className="text-2xl font-heading font-bold text-navy-900">1</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Credits Transferred</p>
              <p className="text-2xl font-heading font-bold text-navy-900">15</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Evaluation</p>
              <p className="text-2xl font-heading font-bold text-navy-900">24</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Transfer Request Form */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900 flex items-center gap-2">
              <Send className="h-5 w-5 text-teal-500" />
              New Credit Transfer Request
            </CardTitle>
            <CardDescription>
              Request to transfer credits to another institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination University</Label>
                <Input id="destination" placeholder="e.g., Massachusetts Institute of Technology" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Target Program</Label>
                  <Input id="program" placeholder="e.g., M.S. Computer Science" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits to Transfer</Label>
                <Select>
                  <SelectTrigger id="credits">
                    <SelectValue placeholder="Select credits range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-12">1-12 Credits</SelectItem>
                    <SelectItem value="13-24">13-24 Credits</SelectItem>
                    <SelectItem value="25-36">25-36 Credits</SelectItem>
                    <SelectItem value="37+">37+ Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Transfer</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you're requesting this credit transfer"
                  rows={3}
                />
              </div>

              {/* Document Upload */}
              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-teal-300 transition-colors">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, DOC up to 10MB each
                    </p>
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Transfer Status */}
        <div className="space-y-6">
          {activeTransfers.map((transfer) => (
            <Card key={transfer.id} className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg text-navy-900 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-teal-500" />
                      {transfer.destination}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Request ID: <span className="font-mono">{transfer.id}</span>
                    </CardDescription>
                  </div>
                  {transfer.status === 5 ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-full">
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full">
                      In Progress
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <TransferStepper currentStep={transfer.status} />

                {/* Transfer Summary */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Submitted</p>
                      <p className="font-medium text-navy-900">{transfer.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Credits Requested</p>
                      <p className="font-medium text-navy-900">{transfer.creditsRequested}</p>
                    </div>
                    {transfer.creditsApproved && (
                      <>
                        <div>
                          <p className="text-gray-500">Credits Approved</p>
                          <p className="font-medium text-teal-600">{transfer.creditsApproved}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium text-green-600">Transfer Complete</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
