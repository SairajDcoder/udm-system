"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ServiceStatus = "healthy" | "degraded" | "down"

interface Service {
  name: string
  status: string
  latency: string
  uptime: string
}

function normalizeStatus(status: string): ServiceStatus {
  if (status === "healthy" || status === "degraded" || status === "down") {
    return status
  }
  return "degraded"
}

function ServiceCard({ service }: { service: Service }) {
  const normalizedStatus = normalizeStatus(service.status)
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
        statusBgColors[normalizedStatus]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground truncate">
          {service.name}
        </span>
        <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", statusColors[normalizedStatus])} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>{service.latency}</span>
        <span>{service.uptime}</span>
      </div>
    </div>
  )
}

interface ServiceHealthGridProps {
  services: Service[]
}

export function ServiceHealthGrid({ services }: ServiceHealthGridProps) {
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
