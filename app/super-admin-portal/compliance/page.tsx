"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Download, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

type AuditLog = {
  id: string
  action: string
  actorId: string
  actorRole: string
  blockchain: string
  createdAt: string
  transactionHash: string
}

type CompliancePayload = {
  latestAuditDate: string | null
  totalAuditEvents: number
  failedSecurityEvents: number
  recentAuditLogs: AuditLog[]
}

export default function CompliancePage() {
  const [data, setData] = useState<CompliancePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCompliance() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/compliance", { cache: "no-store" })
        const payload = await response.json()
        setData(payload)
      } catch {
        setError("Failed to load compliance telemetry.")
      } finally {
        setLoading(false)
      }
    }
    void loadCompliance()
  }, [])

  const complianceScore = useMemo(() => {
    if (!data) return 100
    if (data.totalAuditEvents === 0) return 100
    const penalty = (data.failedSecurityEvents / data.totalAuditEvents) * 100
    return Math.max(0, Number((100 - penalty).toFixed(2)))
  }, [data])

  return (
    <div className="min-h-screen">
      <AdminHeader title="Compliance & Audit Reports" code="ADM-08" />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Compliance Score</p>
              <p className="font-mono text-2xl font-bold">{complianceScore}%</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Audit Events</p>
              <p className="font-mono text-2xl font-bold">{data?.totalAuditEvents ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Failed Security Events</p>
              <p className="font-mono text-2xl font-bold text-error">{data?.failedSecurityEvents ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Latest Audit</p>
              <p className="text-sm font-medium">
                {data?.latestAuditDate ? new Date(data.latestAuditDate).toLocaleString() : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-serif text-base">
              <FileText className="h-5 w-5 text-primary" />
              Recent Compliance Events
            </CardTitle>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Snapshot
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading compliance events...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.recentAuditLogs ?? []).map((log) => {
                    const flagged = log.action.includes("invalid") || log.action.includes("revoked")
                    return (
                      <TableRow key={log.id} className="border-border">
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          {log.actorId}
                          <span className="ml-2 text-xs text-muted-foreground">({log.actorRole})</span>
                        </TableCell>
                        <TableCell className="capitalize">{log.blockchain}</TableCell>
                        <TableCell>
                          {flagged ? (
                            <Badge className="bg-error/20 text-error border-error/30">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Review
                            </Badge>
                          ) : (
                            <Badge className="bg-success/20 text-success border-success/30">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              OK
                            </Badge>
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
      </main>
    </div>
  )
}
