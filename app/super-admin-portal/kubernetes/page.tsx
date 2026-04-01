"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Container, Cpu, MemoryStick, RefreshCcw, Scale, Terminal, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Pod {
  name: string
  namespace: string
  status: "Running" | "Pending" | "Failed" | "CrashLoopBackOff" | "Terminating"
  cpuUsage: number
  cpuLimit: string
  memoryUsage: number
  memoryLimit: string
  restarts: number
  age: string
  node: string
}

const namespaces = ["udms-production", "udms-staging", "blockchain-nodes", "kafka-cluster", "monitoring", "ingress-nginx"]

const pods: Record<string, Pod[]> = {
  "udms-production": [
    { name: "student-service-7f8d9c6b5-x2j4k", namespace: "udms-production", status: "Running", cpuUsage: 45, cpuLimit: "500m", memoryUsage: 62, memoryLimit: "512Mi", restarts: 0, age: "5d 12h", node: "node-01" },
    { name: "student-service-7f8d9c6b5-m9n3p", namespace: "udms-production", status: "Running", cpuUsage: 38, cpuLimit: "500m", memoryUsage: 58, memoryLimit: "512Mi", restarts: 0, age: "5d 12h", node: "node-02" },
    { name: "faculty-service-5c4d3e2f1-a8b7c", namespace: "udms-production", status: "Running", cpuUsage: 52, cpuLimit: "500m", memoryUsage: 71, memoryLimit: "512Mi", restarts: 1, age: "3d 8h", node: "node-01" },
    { name: "credential-service-9a8b7c6d-q5w4e", namespace: "udms-production", status: "CrashLoopBackOff", cpuUsage: 92, cpuLimit: "1000m", memoryUsage: 95, memoryLimit: "1Gi", restarts: 15, age: "1d 4h", node: "node-03" },
    { name: "auth-service-2b3c4d5e-r6t7y", namespace: "udms-production", status: "Running", cpuUsage: 28, cpuLimit: "250m", memoryUsage: 45, memoryLimit: "256Mi", restarts: 0, age: "7d 2h", node: "node-02" },
    { name: "api-gateway-1a2b3c4d-u8i9o", namespace: "udms-production", status: "Running", cpuUsage: 67, cpuLimit: "1000m", memoryUsage: 78, memoryLimit: "1Gi", restarts: 2, age: "2d 16h", node: "node-01" },
    { name: "notification-svc-6e5f4g3h-p0o9i", namespace: "udms-production", status: "Pending", cpuUsage: 0, cpuLimit: "250m", memoryUsage: 0, memoryLimit: "256Mi", restarts: 0, age: "5m", node: "-" },
    { name: "search-service-8h7g6f5e-l4k3j", namespace: "udms-production", status: "Running", cpuUsage: 34, cpuLimit: "500m", memoryUsage: 52, memoryLimit: "512Mi", restarts: 0, age: "4d 20h", node: "node-03" },
  ],
  "blockchain-nodes": [
    { name: "student-bc-node-0", namespace: "blockchain-nodes", status: "Running", cpuUsage: 78, cpuLimit: "2000m", memoryUsage: 85, memoryLimit: "4Gi", restarts: 0, age: "14d 6h", node: "node-01" },
    { name: "student-bc-node-1", namespace: "blockchain-nodes", status: "Running", cpuUsage: 72, cpuLimit: "2000m", memoryUsage: 82, memoryLimit: "4Gi", restarts: 0, age: "14d 6h", node: "node-02" },
    { name: "faculty-bc-node-0", namespace: "blockchain-nodes", status: "Running", cpuUsage: 65, cpuLimit: "2000m", memoryUsage: 78, memoryLimit: "4Gi", restarts: 1, age: "14d 6h", node: "node-03" },
    { name: "institutional-bc-node-0", namespace: "blockchain-nodes", status: "Running", cpuUsage: 58, cpuLimit: "2000m", memoryUsage: 72, memoryLimit: "4Gi", restarts: 0, age: "14d 6h", node: "node-01" },
  ],
  "kafka-cluster": [
    { name: "kafka-broker-0", namespace: "kafka-cluster", status: "Running", cpuUsage: 55, cpuLimit: "1500m", memoryUsage: 68, memoryLimit: "2Gi", restarts: 0, age: "21d 4h", node: "node-01" },
    { name: "kafka-broker-1", namespace: "kafka-cluster", status: "Running", cpuUsage: 52, cpuLimit: "1500m", memoryUsage: 65, memoryLimit: "2Gi", restarts: 0, age: "21d 4h", node: "node-02" },
    { name: "kafka-broker-2", namespace: "kafka-cluster", status: "Running", cpuUsage: 48, cpuLimit: "1500m", memoryUsage: 62, memoryLimit: "2Gi", restarts: 0, age: "21d 4h", node: "node-03" },
    { name: "zookeeper-0", namespace: "kafka-cluster", status: "Running", cpuUsage: 25, cpuLimit: "500m", memoryUsage: 45, memoryLimit: "1Gi", restarts: 0, age: "21d 4h", node: "node-01" },
  ],
}

const sampleLogs = `2024-03-15T14:23:45.123Z [INFO] Starting credential-service v2.1.0
2024-03-15T14:23:45.456Z [INFO] Connecting to database...
2024-03-15T14:23:46.789Z [INFO] Database connection established
2024-03-15T14:23:47.012Z [INFO] Initializing Kafka consumer...
2024-03-15T14:23:48.345Z [ERROR] Failed to connect to Kafka broker: Connection refused
2024-03-15T14:23:48.678Z [WARN] Retrying Kafka connection (attempt 1/5)...
2024-03-15T14:23:53.901Z [ERROR] Failed to connect to Kafka broker: Connection refused
2024-03-15T14:23:54.234Z [WARN] Retrying Kafka connection (attempt 2/5)...
2024-03-15T14:23:59.567Z [ERROR] Failed to connect to Kafka broker: Connection refused
2024-03-15T14:23:59.890Z [FATAL] Max retry attempts reached. Shutting down...
2024-03-15T14:24:00.123Z [INFO] Graceful shutdown initiated
2024-03-15T14:24:00.456Z [INFO] Service terminated`

function ScaleModal({ pod }: { pod: Pod }) {
  const [replicas, setReplicas] = useState("2")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Scale className="mr-2 h-4 w-4" />
          Scale
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif">Scale Deployment</DialogTitle>
          <DialogDescription>
            Adjust the number of replicas for {pod.name.split("-").slice(0, -2).join("-")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="replicas">Number of Replicas</Label>
            <Input
              id="replicas"
              type="number"
              value={replicas}
              onChange={(e) => setReplicas(e.target.value)}
              min="0"
              max="10"
              className="bg-muted border-border"
            />
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Current replicas: <span className="font-mono text-foreground">2</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Target replicas: <span className="font-mono text-foreground">{replicas}</span>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90">Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LogsModal({ pod }: { pod: Pod }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Terminal className="mr-2 h-4 w-4" />
          View Logs
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Pod Logs
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {pod.name}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] rounded-lg bg-[#0D1117] p-4">
          <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
            {sampleLogs}
          </pre>
        </ScrollArea>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            Download Full Logs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PodCard({ pod }: { pod: Pod }) {
  const statusColors = {
    Running: "bg-success/20 text-success border-success/30",
    Pending: "bg-warning/20 text-warning border-warning/30",
    Failed: "bg-error/20 text-error border-error/30",
    CrashLoopBackOff: "bg-error/20 text-error border-error/30",
    Terminating: "bg-muted text-muted-foreground border-muted",
  }

  const cardBorderColors = {
    Running: "border-l-success",
    Pending: "border-l-warning",
    Failed: "border-l-error",
    CrashLoopBackOff: "border-l-error",
    Terminating: "border-l-muted-foreground",
  }

  return (
    <Card className={`bg-card border-border border-l-4 ${cardBorderColors[pod.status]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Container className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="font-mono text-xs truncate text-foreground" title={pod.name}>
                {pod.name}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge className={statusColors[pod.status]}>
                {pod.status}
              </Badge>
              {pod.restarts > 0 && (
                <span className={`font-mono text-xs ${pod.restarts > 5 ? "text-error" : "text-warning"}`}>
                  {pod.restarts} restarts
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ScaleModal pod={pod} />
              <LogsModal pod={pod} />
              <DropdownMenuItem className="text-error">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Restart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Cpu className="h-3 w-3" /> CPU
              </span>
              <span className="font-mono">
                {pod.cpuUsage}% / {pod.cpuLimit}
              </span>
            </div>
            <Progress 
              value={pod.cpuUsage} 
              className="h-1.5"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MemoryStick className="h-3 w-3" /> Memory
              </span>
              <span className="font-mono">
                {pod.memoryUsage}% / {pod.memoryLimit}
              </span>
            </div>
            <Progress 
              value={pod.memoryUsage} 
              className="h-1.5"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Node: {pod.node}</span>
          <span>{pod.age}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function KubernetesClusterPage() {
  const [selectedNamespace, setSelectedNamespace] = useState("udms-production")
  const currentPods = pods[selectedNamespace] || []

  return (
    <div className="min-h-screen">
      <AdminHeader title="Kubernetes Cluster Monitor" code="ADM-05" />
      <main className="p-6 space-y-6">
        {/* Namespace Selector */}
        <Card className="bg-card border-border">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label htmlFor="namespace" className="text-muted-foreground">Namespace</Label>
                <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                  <SelectTrigger className="w-[250px] bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {namespaces.map((ns) => (
                      <SelectItem key={ns} value={ns}>
                        {ns}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Pods: </span>
                  <span className="font-mono font-bold">{currentPods.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Running: </span>
                  <span className="font-mono font-bold text-success">
                    {currentPods.filter(p => p.status === "Running").length}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Issues: </span>
                  <span className="font-mono font-bold text-error">
                    {currentPods.filter(p => p.status !== "Running").length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pods Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentPods.map((pod) => (
            <PodCard key={pod.name} pod={pod} />
          ))}
        </div>
      </main>
    </div>
  )
}
