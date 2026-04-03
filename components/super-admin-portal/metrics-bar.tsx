"use client"

import { Activity, Clock, Server, HardDrive } from "lucide-react"

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  trend?: "up" | "down" | "stable"
  color: "primary" | "secondary" | "success" | "info"
}

function MetricCard({ icon: Icon, label, value, subValue, color }: MetricCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-success bg-success/10",
    info: "text-info bg-info/10",
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
        {subValue && (
          <p className="font-mono text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </div>
  )
}

interface MetricsBarProps {
  metrics: {
    tps: number
    peakTps: number
    pendingTransactions: number
    averageWaitSeconds: number
    activeValidators: number
    totalValidators: number
    ipfsStorage: string
    ipfsUtilization: string
  }
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Activity}
        label="Transactions/Sec"
        value={metrics.tps.toLocaleString()}
        subValue={`Peak: ${metrics.peakTps.toLocaleString()}`}
        color="primary"
      />
      <MetricCard
        icon={Clock}
        label="Pending Txns"
        value={metrics.pendingTransactions.toLocaleString()}
        subValue={`Avg wait: ${metrics.averageWaitSeconds.toFixed(1)}s`}
        color="secondary"
      />
      <MetricCard
        icon={Server}
        label="Active Validators"
        value={`${metrics.activeValidators}/${metrics.totalValidators}`}
        subValue={`${Math.max(metrics.totalValidators - metrics.activeValidators, 0)} non-active`}
        color="success"
      />
      <MetricCard
        icon={HardDrive}
        label="IPFS Storage"
        value={metrics.ipfsStorage}
        subValue={`${metrics.ipfsUtilization} utilized`}
        color="info"
      />
    </div>
  )
}
