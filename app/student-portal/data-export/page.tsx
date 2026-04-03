"use client"

import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Clock, Download, FileJson, FileText, GraduationCap, History, Key, Shield, User, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ExportRecord = {
  id: string
  date: string
  categories: string[]
  format: "JSON" | "PDF"
  size: string
  status: "Completed" | "Expired"
}

const dataCategories = [
  { id: "personal", name: "Personal Information", description: "Profile, contact and identity attributes", icon: User },
  { id: "academic", name: "Academic Records", description: "Grades, transcript requests and course history", icon: GraduationCap },
  { id: "credentials", name: "Credentials & Certificates", description: "Blockchain-issued degree and transcript credentials", icon: Wallet },
  { id: "access", name: "Access Control History", description: "Grant, revoke and verifier access history", icon: Key },
  { id: "activity", name: "Activity Logs", description: "Recent audit and account activity events", icon: History },
]

export default function DataExportPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [format, setFormat] = useState<"json" | "pdf">("json")
  const [isExporting, setIsExporting] = useState(false)
  const [history, setHistory] = useState<ExportRecord[]>([])

  const selectedLabels = useMemo(
    () =>
      dataCategories
        .filter((category) => selectedCategories.includes(category.id))
        .map((category) => category.name),
    [selectedCategories]
  )

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    )
  }

  const selectAll = () => {
    setSelectedCategories((current) =>
      current.length === dataCategories.length ? [] : dataCategories.map((category) => category.id)
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/student/export")
      const payload = await response.json()
      const exportedAt = new Date(payload.exportedAt)
      const exportId = `EXP-${exportedAt.getUTCFullYear()}-${String(history.length + 1).padStart(4, "0")}`
      const selectedData = selectedCategories.length === 0 ? payload : {
        exportedAt: payload.exportedAt,
        selectedCategories: selectedLabels,
        data: {
          student: selectedCategories.includes("personal") ? payload.student : undefined,
          academic: selectedCategories.includes("academic") ? { grades: payload.grades, transcriptRequests: payload.transcriptRequests } : undefined,
          credentials: selectedCategories.includes("credentials") ? payload.credentials : undefined,
          access: selectedCategories.includes("access") ? payload.accessGrants : undefined,
          activity: selectedCategories.includes("activity") ? payload.notifications : undefined,
        },
      }

      const textContent = JSON.stringify(selectedData, null, 2)
      const blob = new Blob([textContent], { type: "application/json" })
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `${exportId.toLowerCase()}.${format === "json" ? "json" : "txt"}`
      a.click()
      URL.revokeObjectURL(downloadUrl)

      const sizeKb = Math.max(1, Math.round(textContent.length / 1024))
      setHistory((current) => [
        {
          id: exportId,
          date: exportedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          categories: selectedLabels.length === 0 ? ["All Data"] : selectedLabels,
          format: format.toUpperCase() as "JSON" | "PDF",
          size: `${sizeKb} KB`,
          status: "Completed",
        },
        ...current,
      ])
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-teal-200 bg-teal-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100">
              <Shield className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-medium text-teal-900">Data portability and privacy compliance</h3>
              <p className="mt-1 text-sm text-teal-700">
                Export requests are generated from your UniChain workspace data and include immutable credential and access records.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg text-navy-900">Select Data Categories</CardTitle>
                  <CardDescription>Choose which data to include in the export bundle</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>
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
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                      isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Checkbox checked={isSelected} className="data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-500" />
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSelected ? "bg-teal-100" : "bg-gray-100"}`}>
                      <Icon className={`h-5 w-5 ${isSelected ? "text-teal-600" : "text-gray-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isSelected ? "text-navy-900" : "text-gray-700"}`}>{category.name}</p>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-navy-900">Export Format</CardTitle>
              <CardDescription>Choose how you want your export package generated</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={format} onValueChange={(value) => setFormat(value as "json" | "pdf")} className="grid grid-cols-2 gap-4">
                <div className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 ${format === "json" ? "border-teal-500 bg-teal-50" : "border-gray-200"}`} onClick={() => setFormat("json")}>
                  <RadioGroupItem value="json" id="json" className="border-teal-500 text-teal-500" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <FileJson className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="json" className="cursor-pointer font-medium">JSON</Label>
                    <p className="text-sm text-gray-500">Structured machine-readable export</p>
                  </div>
                </div>
                <div className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 ${format === "pdf" ? "border-teal-500 bg-teal-50" : "border-gray-200"}`} onClick={() => setFormat("pdf")}>
                  <RadioGroupItem value="pdf" id="pdf" className="border-teal-500 text-teal-500" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <Label htmlFor="pdf" className="cursor-pointer font-medium">Text Report</Label>
                    <p className="text-sm text-gray-500">Human-readable snapshot</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-navy-900">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Selected Categories</span>
                  <span className="font-medium text-navy-900">{selectedCategories.length || dataCategories.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Format</span>
                  <span className="font-medium text-navy-900">{format.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Size</span>
                  <span className="font-medium text-navy-900">{selectedCategories.length > 2 ? "1-3 MB" : "300 KB - 1 MB"}</span>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-700">Exports are generated instantly from your current UniChain profile and immutable ledger-linked records.</p>
                </div>
              </div>

              <Button className="w-full bg-teal-500 text-white hover:bg-teal-600" onClick={handleExport} disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Generating Export..." : "Generate & Download"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-navy-900">Export History</CardTitle>
          <CardDescription>Recent exports from this device session</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">No exports generated yet in this session</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Export ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-navy-900">{item.id}</TableCell>
                    <TableCell className="text-gray-600">{item.date}</TableCell>
                    <TableCell className="text-gray-600">{item.categories.join(", ")}</TableCell>
                    <TableCell>{item.format}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>
                      <Badge className={item.status === "Completed" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}>
                        {item.status === "Completed" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
                        {item.status}
                      </Badge>
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
