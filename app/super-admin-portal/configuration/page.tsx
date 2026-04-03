"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Blocks, HardDrive, Activity, Save, Loader2 } from "lucide-react"

type ConfigurationPayload = {
  blockchain: {
    activeValidators: number
    totalValidators: number
  }
  storage: {
    ipfsStorage: string
    ipfsUtilization: string
  }
  performance: {
    tps: number
    peakTps: number
    pendingTransactions: number
    averageWaitSeconds: number
  }
}

export default function ConfigurationPage() {
  const [config, setConfig] = useState<ConfigurationPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadConfiguration() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/configuration", { cache: "no-store" })
        const data = await response.json()
        setConfig(data)
      } catch {
        setError("Failed to load configuration snapshot.")
      } finally {
        setLoading(false)
      }
    }
    void loadConfiguration()
  }, [])

  const handleSave = () => {
    setMessage("Configuration snapshot is synced from live services. Persistent edits can be added next.")
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="System Configuration" code="ADM-07" />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {message}
          </div>
        ) : null}

        {loading ? (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading configuration...
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-base">
                  <Blocks className="h-5 w-5 text-primary" />
                  Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>Active Validators</Label>
                  <Input value={String(config?.blockchain.activeValidators ?? 0)} readOnly className="bg-muted border-border" />
                </div>
                <div className="space-y-1">
                  <Label>Total Validators</Label>
                  <Input value={String(config?.blockchain.totalValidators ?? 0)} readOnly className="bg-muted border-border" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-base">
                  <HardDrive className="h-5 w-5 text-secondary" />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>IPFS Capacity</Label>
                  <Input value={config?.storage.ipfsStorage ?? ""} readOnly className="bg-muted border-border" />
                </div>
                <div className="space-y-1">
                  <Label>IPFS Utilization</Label>
                  <Input value={config?.storage.ipfsUtilization ?? ""} readOnly className="bg-muted border-border" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-base">
                  <Activity className="h-5 w-5 text-info" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>Current TPS</Label>
                  <Input value={String(config?.performance.tps ?? 0)} readOnly className="bg-muted border-border" />
                </div>
                <div className="space-y-1">
                  <Label>Peak TPS</Label>
                  <Input value={String(config?.performance.peakTps ?? 0)} readOnly className="bg-muted border-border" />
                </div>
                <div className="space-y-1">
                  <Label>Pending Transactions</Label>
                  <Input value={String(config?.performance.pendingTransactions ?? 0)} readOnly className="bg-muted border-border" />
                </div>
                <div className="space-y-1">
                  <Label>Average Wait (sec)</Label>
                  <Input value={String(config?.performance.averageWaitSeconds ?? 0)} readOnly className="bg-muted border-border" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </main>
    </div>
  )
}
