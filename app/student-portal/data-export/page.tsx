"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Download,
  FileJson,
  FileText,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  GraduationCap,
  Wallet,
  Key,
  History,
} from "lucide-react"

// Data Categories
const dataCategories = [
  {
    id: "personal",
    name: "Personal Information",
    description: "Name, contact details, date of birth, address",
    icon: User,
  },
  {
    id: "academic",
    name: "Academic Records",
    description: "Grades, transcripts, course history, GPA",
    icon: GraduationCap,
  },
  {
    id: "credentials",
    name: "Credentials & Certificates",
    description: "Degrees, certifications, blockchain credentials",
    icon: Wallet,
  },
  {
    id: "access",
    name: "Access Control History",
    description: "Third-party access grants, verification requests",
    icon: Key,
  },
  {
    id: "activity",
    name: "Activity Logs",
    description: "Login history, system interactions, audit trail",
    icon: History,
  },
]

// Previous Exports
const previousExports = [
  {
    id: "EXP-2026-0015",
    date: "Mar 25, 2026",
    categories: ["Personal Information", "Academic Records"],
    format: "JSON",
    size: "2.4 MB",
    status: "Completed",
  },
  {
    id: "EXP-2026-0012",
    date: "Mar 10, 2026",
    categories: ["All Data"],
    format: "PDF",
    size: "8.7 MB",
    status: "Completed",
  },
  {
    id: "EXP-2026-0008",
    date: "Feb 20, 2026",
    categories: ["Credentials & Certificates"],
    format: "JSON",
    size: "1.1 MB",
    status: "Completed",
  },
  {
    id: "EXP-2026-0003",
    date: "Jan 15, 2026",
    categories: ["Academic Records", "Activity Logs"],
    format: "PDF",
    size: "5.3 MB",
    status: "Expired",
  },
]

export default function DataExportPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [format, setFormat] = useState("json")
  const [isExporting, setIsExporting] = useState(false)

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const selectAll = () => {
    if (selectedCategories.length === dataCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(dataCategories.map(c => c.id))
    }
  }

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => setIsExporting(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* GDPR Info Banner */}
      <Card className="border-teal-200 bg-teal-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 shrink-0">
              <Shield className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-medium text-teal-900">Your Data Rights (GDPR Compliance)</h3>
              <p className="text-sm text-teal-700 mt-1">
                Under GDPR and data protection regulations, you have the right to access, export, and request deletion of your personal data. 
                Use this tool to download a copy of all data we hold about you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Categories */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg text-navy-900">Select Data Categories</CardTitle>
                  <CardDescription>Choose which data you want to export</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  {selectedCategories.length === dataCategories.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataCategories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedCategories.includes(category.id)

                return (
                  <div
                    key={category.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected ? "bg-teal-100" : "bg-gray-100"
                    }`}>
                      <Icon className={`h-5 w-5 ${isSelected ? "text-teal-600" : "text-gray-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isSelected ? "text-navy-900" : "text-gray-700"}`}>
                        {category.name}
                      </p>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-navy-900">Export Format</CardTitle>
              <CardDescription>Choose your preferred file format</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    format === "json"
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setFormat("json")}
                >
                  <RadioGroupItem value="json" id="json" className="border-teal-500 text-teal-500" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <FileJson className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="json" className="font-medium cursor-pointer">JSON</Label>
                    <p className="text-sm text-gray-500">Machine-readable format</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    format === "pdf"
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setFormat("pdf")}
                >
                  <RadioGroupItem value="pdf" id="pdf" className="border-teal-500 text-teal-500" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <Label htmlFor="pdf" className="font-medium cursor-pointer">PDF</Label>
                    <p className="text-sm text-gray-500">Human-readable report</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Export Summary & Action */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-navy-900">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Categories Selected</span>
                  <span className="font-medium text-navy-900">
                    {selectedCategories.length} of {dataCategories.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Export Format</span>
                  <Badge variant="secondary" className="bg-gray-200">
                    {format.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Size</span>
                  <span className="font-medium text-navy-900">
                    ~{selectedCategories.length * 1.5} MB
                  </span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p className="font-medium">Processing Time</p>
                    <p className="mt-1">Large exports may take up to 24 hours to prepare. You&apos;ll receive a notification when ready.</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                disabled={selectedCategories.length === 0 || isExporting}
                onClick={handleExport}
              >
                {isExporting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                  <Download className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Exports</p>
                  <p className="text-lg font-heading font-bold text-navy-900">4</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Export</p>
                  <p className="text-lg font-heading font-bold text-navy-900">Mar 25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export History */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-navy-900">Export History</CardTitle>
          <CardDescription>Previous data exports and downloads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-medium">Export ID</TableHead>
                  <TableHead className="text-gray-500 font-medium">Date</TableHead>
                  <TableHead className="text-gray-500 font-medium">Categories</TableHead>
                  <TableHead className="text-gray-500 font-medium">Format</TableHead>
                  <TableHead className="text-gray-500 font-medium">Size</TableHead>
                  <TableHead className="text-gray-500 font-medium">Status</TableHead>
                  <TableHead className="text-gray-500 font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousExports.map((export_) => (
                  <TableRow key={export_.id} className="border-gray-100">
                    <TableCell className="font-mono text-sm text-navy-900">{export_.id}</TableCell>
                    <TableCell className="text-gray-600">{export_.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {export_.categories.map((cat, i) => (
                          <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {export_.format}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{export_.size}</TableCell>
                    <TableCell>
                      {export_.status === "Completed" ? (
                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3" />
                          Expired
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {export_.status === "Completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
