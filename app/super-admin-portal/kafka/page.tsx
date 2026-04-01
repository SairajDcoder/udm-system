"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageSquare, Plus, Activity, Clock, AlertTriangle } from "lucide-react"

interface Topic {
  name: string
  partitions: number
  replicationFactor: number
  messageRate: string
  retention: string
  size: string
  status: "healthy" | "warning" | "critical"
}

interface ConsumerGroup {
  name: string
  topics: string[]
  members: number
  lag: number
  offsetProgress: number
  status: "active" | "idle" | "dead"
}

const topics: Topic[] = [
  { name: "student-events", partitions: 12, replicationFactor: 3, messageRate: "1.2K/s", retention: "7d", size: "45.6 GB", status: "healthy" },
  { name: "faculty-events", partitions: 8, replicationFactor: 3, messageRate: "856/s", retention: "7d", size: "32.1 GB", status: "healthy" },
  { name: "credential-updates", partitions: 16, replicationFactor: 3, messageRate: "2.4K/s", retention: "30d", size: "128.9 GB", status: "warning" },
  { name: "audit-logs", partitions: 6, replicationFactor: 3, messageRate: "450/s", retention: "90d", size: "256.7 GB", status: "healthy" },
  { name: "blockchain-sync", partitions: 24, replicationFactor: 3, messageRate: "3.8K/s", retention: "3d", size: "18.2 GB", status: "healthy" },
  { name: "notification-queue", partitions: 4, replicationFactor: 2, messageRate: "234/s", retention: "1d", size: "2.1 GB", status: "healthy" },
  { name: "dead-letter-queue", partitions: 2, replicationFactor: 3, messageRate: "12/s", retention: "14d", size: "4.5 GB", status: "critical" },
]

const consumerGroups: ConsumerGroup[] = [
  { name: "student-service-cg", topics: ["student-events"], members: 4, lag: 125, offsetProgress: 98, status: "active" },
  { name: "faculty-service-cg", topics: ["faculty-events"], members: 3, lag: 45, offsetProgress: 99, status: "active" },
  { name: "credential-processor-cg", topics: ["credential-updates"], members: 6, lag: 2450, offsetProgress: 85, status: "active" },
  { name: "audit-writer-cg", topics: ["audit-logs"], members: 2, lag: 0, offsetProgress: 100, status: "active" },
  { name: "blockchain-indexer-cg", topics: ["blockchain-sync"], members: 8, lag: 890, offsetProgress: 92, status: "active" },
  { name: "notification-sender-cg", topics: ["notification-queue"], members: 2, lag: 15, offsetProgress: 99, status: "idle" },
  { name: "dlq-processor-cg", topics: ["dead-letter-queue"], members: 1, lag: 1250, offsetProgress: 45, status: "dead" },
]

function CreateTopicModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="h-4 w-4" />
          Create Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif">Create New Topic</DialogTitle>
          <DialogDescription>
            Configure a new Kafka topic for the cluster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic-name">Topic Name</Label>
            <Input id="topic-name" placeholder="e.g., new-events-topic" className="bg-muted border-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partitions">Partitions</Label>
              <Select defaultValue="6">
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="replication">Replication Factor</Label>
              <Select defaultValue="3">
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retention">Retention Period</Label>
            <Select defaultValue="7d">
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 day</SelectItem>
                <SelectItem value="3d">3 days</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="14d">14 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setOpen(false)}>
            Create Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function KafkaManagementPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="Kafka Management" code="ADM-04" />
      <main className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Total Topics</p>
                  <p className="font-mono text-2xl font-bold">{topics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Activity className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Messages/sec</p>
                  <p className="font-mono text-2xl font-bold">9.2K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                  <Clock className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Consumer Groups</p>
                  <p className="font-mono text-2xl font-bold">{consumerGroups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Total Lag</p>
                  <p className="font-mono text-2xl font-bold">
                    {consumerGroups.reduce((acc, cg) => acc + cg.lag, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topics Table */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Topics
            </CardTitle>
            <CreateTopicModal />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Topic Name</TableHead>
                  <TableHead className="text-muted-foreground">Partitions</TableHead>
                  <TableHead className="text-muted-foreground">Replication</TableHead>
                  <TableHead className="text-muted-foreground">Message Rate</TableHead>
                  <TableHead className="text-muted-foreground">Retention</TableHead>
                  <TableHead className="text-muted-foreground">Size</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.name} className="border-border">
                    <TableCell className="font-mono text-sm">{topic.name}</TableCell>
                    <TableCell className="font-mono">{topic.partitions}</TableCell>
                    <TableCell className="font-mono">{topic.replicationFactor}</TableCell>
                    <TableCell className="font-mono text-secondary">{topic.messageRate}</TableCell>
                    <TableCell className="font-mono text-xs">{topic.retention}</TableCell>
                    <TableCell className="font-mono text-xs">{topic.size}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          topic.status === "healthy"
                            ? "bg-success/20 text-success border-success/30"
                            : topic.status === "warning"
                            ? "bg-warning/20 text-warning border-warning/30"
                            : "bg-error/20 text-error border-error/30"
                        }
                      >
                        {topic.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Consumer Groups Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" />
              Consumer Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Group Name</TableHead>
                  <TableHead className="text-muted-foreground">Topics</TableHead>
                  <TableHead className="text-muted-foreground">Members</TableHead>
                  <TableHead className="text-muted-foreground">Lag</TableHead>
                  <TableHead className="text-muted-foreground w-[200px]">Offset Progress</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumerGroups.map((cg) => (
                  <TableRow key={cg.name} className="border-border">
                    <TableCell className="font-mono text-sm">{cg.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cg.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="font-mono text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{cg.members}</TableCell>
                    <TableCell>
                      <span className={`font-mono ${cg.lag > 1000 ? "text-error" : cg.lag > 100 ? "text-warning" : "text-success"}`}>
                        {cg.lag.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={cg.offsetProgress} 
                          className="h-2 flex-1"
                        />
                        <span className="font-mono text-xs w-10 text-right">{cg.offsetProgress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          cg.status === "active"
                            ? "bg-success/20 text-success border-success/30"
                            : cg.status === "idle"
                            ? "bg-warning/20 text-warning border-warning/30"
                            : "bg-error/20 text-error border-error/30"
                        }
                      >
                        {cg.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
