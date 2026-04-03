"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Container, Activity, Loader2 } from "lucide-react"

type PodRecord = {
  name: string
  namespace: string
  status: string
  cpu: string
  memory: string
}

type ServiceRecord = {
  name: string
  status: "healthy" | "degraded" | "down"
  latency: string
  uptime: string
}

export default function KubernetesClusterPage() {
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [pods, setPods] = useState<PodRecord[]>([])
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadKubernetesData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/kubernetes", { cache: "no-store" })
        const data = await response.json()
        const namespaceList = Array.isArray(data.namespaces) ? data.namespaces : []
        setNamespaces(namespaceList)
        setPods(Array.isArray(data.pods) ? data.pods : [])
        setServices(Array.isArray(data.serviceHealth) ? data.serviceHealth : [])
        setSelectedNamespace("all")
      } catch {
        setError("Failed to load Kubernetes telemetry.")
      } finally {
        setLoading(false)
      }
    }
    void loadKubernetesData()
  }, [])

  const filteredPods = useMemo(() => {
    if (selectedNamespace === "all") return pods
    return pods.filter((pod) => pod.namespace === selectedNamespace)
  }, [pods, selectedNamespace])

  const runningPods = filteredPods.filter((pod) => pod.status === "Running").length
  const problematicPods = filteredPods.length - runningPods

  return (
    <div className="min-h-screen">
      <AdminHeader title="Kubernetes Cluster Monitor" code="ADM-05" />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <Card className="bg-card border-border">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Namespace</span>
                <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                  <SelectTrigger className="w-[240px] bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Namespaces</SelectItem>
                    {namespaces.map((namespace) => (
                      <SelectItem key={namespace} value={namespace}>
                        {namespace}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span>Total Pods: <strong>{filteredPods.length}</strong></span>
                <span>Running: <strong className="text-success">{runningPods}</strong></span>
                <span>Issues: <strong className="text-error">{problematicPods}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-base">
                <Container className="h-5 w-5 text-primary" />
                Pod Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading pods...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Pod</TableHead>
                      <TableHead>Namespace</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Memory</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPods.map((pod) => (
                      <TableRow key={`${pod.namespace}-${pod.name}`} className="border-border">
                        <TableCell className="font-mono text-xs">{pod.name}</TableCell>
                        <TableCell>{pod.namespace}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              pod.status === "Running"
                                ? "bg-success/20 text-success border-success/30"
                                : "bg-warning/20 text-warning border-warning/30"
                            }
                          >
                            {pod.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{pod.cpu}</TableCell>
                        <TableCell className="font-mono">{pod.memory}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-base">
                <Activity className="h-5 w-5 text-secondary" />
                Service Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map((service) => (
                <div key={service.name} className="rounded-lg border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{service.name}</p>
                    <Badge
                      className={
                        service.status === "healthy"
                          ? "bg-success/20 text-success border-success/30"
                          : service.status === "degraded"
                          ? "bg-warning/20 text-warning border-warning/30"
                          : "bg-error/20 text-error border-error/30"
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Latency: {service.latency} · Uptime: {service.uptime}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
