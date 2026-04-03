"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type VerificationHistoryItem = {
  id: string
  hash: string
  holderName: string
  checkedAt: string
  result: "valid" | "invalid"
  vScore: number
}

export default function VerificationHistoryPage() {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetch("/api/verifier/history")
      .then((response) => response.json())
      .then((payload) => setHistory(payload.history))
      .catch(() => setHistory([]))
  }, [])

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.holderName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterStatus === "all" || item.result === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: history.length,
    valid: history.filter((h) => h.result === "valid").length,
    invalid: history.filter((h) => h.result === "invalid").length,
    avgScore: Math.round(
      history.filter((h) => h.result === "valid").reduce((sum, h) => sum + h.vScore, 0) /
        Math.max(history.filter((h) => h.result === "valid").length, 1)
    ),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold">Verification History</h2>
        <p className="text-muted-foreground">View and manage your past credential verifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Verifications</p>
            <p className="text-3xl font-serif font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Valid</p>
            <p className="text-3xl font-serif font-bold text-success">{stats.valid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Invalid</p>
            <p className="text-3xl font-serif font-bold text-destructive">{stats.invalid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg V-Score</p>
            <p className="text-3xl font-serif font-bold text-primary">{stats.avgScore}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by hash or holder name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="valid">Valid Only</SelectItem>
                  <SelectItem value="invalid">Invalid Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credential Hash</TableHead>
                <TableHead>Holder Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">V-Score</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No verification records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {item.hash.slice(0, 10)}...{item.hash.slice(-8)}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">{item.holderName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(item.checkedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.result === "valid" ? "default" : "destructive"}
                        className={cn(
                          item.result === "valid"
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        )}
                      >
                        {item.result === "valid" ? "Valid" : "Invalid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-mono font-medium",
                          item.vScore >= 80
                            ? "text-success"
                            : item.vScore >= 50
                            ? "text-warning"
                            : "text-destructive"
                        )}
                      >
                        {item.vScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          href={`/verify/result?hash=${encodeURIComponent(item.hash)}&status=${item.result}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of{" "}
            {filteredHistory.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
