"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { MetricsBar } from "@/components/super-admin-portal/metrics-bar"
import { TPSChart, ErrorRateChart } from "@/components/super-admin-portal/dashboard-charts"
import { ServiceHealthGrid } from "@/components/super-admin-portal/service-health"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, Award, Blocks, FileText, HardDrive, ScrollText } from "lucide-react"

type OverviewData = {
  tps: number
  peakTps: number
  pendingTransactions: number
  averageWaitSeconds: number
  activeValidators: number
  totalValidators: number
  ipfsStorage: string
  ipfsUtilization: string
  tpsSeries: Array<{ time: string; tps: number }>
  errorRateSeries: Array<{ endpoint: string; rate: number }>
  serviceHealth: Array<{ name: string; status: string; latency: string; uptime: string }>
  totalUsers: number
  totalCredentials: number
  totalBlocks: number
  totalTransactions: number
  totalDocuments: number
  totalAuditLogs: number
}

export default function SystemOverviewPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOverview() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/overview", { cache: "no-store" })
        const data = await response.json()
        setOverview(data)
      } catch {
        setError("Failed to load system overview.")
      } finally {
        setLoading(false)
      }
    }
    void loadOverview()
  }, [])

  return (
    <div className="min-h-screen">
      <AdminHeader title="System Overview Dashboard" code="ADM-01" />
      <main className="p-6 space-y-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        {loading || !overview ? (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading system overview...
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Dynamic Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Card className="bg-card border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold">{overview.totalUsers}</p>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold">{overview.totalCredentials}</p>
                      <p className="text-xs text-muted-foreground">Credentials</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <Blocks className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold">{overview.totalBlocks}</p>
                      <p className="text-xs text-muted-foreground">Blocks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                      <FileText className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold">{overview.totalTransactions}</p>
                      <p className="text-xs text-muted-foreground">Transactions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                      <HardDrive className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold">{overview.totalDocuments}</p>
                      <p className="text-xs text-muted-foreground">Documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
                      <ScrollText className="h-5 w-5 text-error" />
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold">{overview.totalAuditLogs}</p>
                      <p className="text-xs text-muted-foreground">Audit Logs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Metrics Bar */}
            <MetricsBar metrics={overview} />

            {/* Charts Section — TPS + Error Rate (removed Kafka Lag) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TPSChart data={overview.tpsSeries} />
              <ErrorRateChart data={overview.errorRateSeries} />
            </div>

            {/* Service Health Grid */}
            <ServiceHealthGrid services={overview.serviceHealth} />
          </>
        )}
      </main>
    </div>
  )
}
