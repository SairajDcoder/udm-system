"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ServiceStatus = "healthy" | "degraded" | "down"

interface Service {
  name: string
  status: ServiceStatus
  latency: string
  uptime: string
}

const services: Service[] = [
  { name: "Student Service", status: "healthy", latency: "12ms", uptime: "99.99%" },
  { name: "Faculty Service", status: "healthy", latency: "15ms", uptime: "99.98%" },
  { name: "Credential Service", status: "degraded", latency: "245ms", uptime: "99.85%" },
  { name: "Auth Service", status: "healthy", latency: "8ms", uptime: "99.99%" },
  { name: "IPFS Gateway", status: "healthy", latency: "89ms", uptime: "99.95%" },
  { name: "Blockchain Node", status: "healthy", latency: "23ms", uptime: "99.97%" },
  { name: "Kafka Broker", status: "healthy", latency: "5ms", uptime: "99.99%" },
  { name: "API Gateway", status: "down", latency: "N/A", uptime: "98.50%" },
  { name: "Cache Service", status: "healthy", latency: "2ms", uptime: "99.99%" },
  { name: "Search Service", status: "healthy", latency: "45ms", uptime: "99.92%" },
  { name: "Notification Svc", status: "healthy", latency: "18ms", uptime: "99.96%" },
  { name: "Analytics Engine", status: "degraded", latency: "320ms", uptime: "99.70%" },
]

function ServiceCard({ service }: { service: Service }) {
  const statusColors = {
    healthy: "bg-success",
    degraded: "bg-warning",
    down: "bg-error",
  }

  const statusBgColors = {
    healthy: "bg-success/10 border-success/30",
    degraded: "bg-warning/10 border-warning/30",
    down: "bg-error/10 border-error/30",
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all hover:scale-[1.02]",
        statusBgColors[service.status]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground truncate">
          {service.name}
        </span>
        <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", statusColors[service.status])} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>{service.latency}</span>
        <span>{service.uptime}</span>
      </div>
    </div>
  )
}

export function ServiceHealthGrid() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-base">Service Health</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Healthy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Degraded</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-error" />
              <span className="text-muted-foreground">Down</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
