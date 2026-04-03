"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageSquare, Activity, Clock, Loader2 } from "lucide-react"

type TopicRecord = {
  name: string
  lag: number
  rate: number
  consumers: number
}

type LagPoint = {
  time: string
  studentTopic: number
  facultyTopic: number
  credentialsTopic: number
}

type ErrorPoint = {
  endpoint: string
  rate: number
}

export default function KafkaManagementPage() {
  const [topics, setTopics] = useState<TopicRecord[]>([])
  const [lagSeries, setLagSeries] = useState<LagPoint[]>([])
  const [errorRates, setErrorRates] = useState<ErrorPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadKafkaData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/kafka", { cache: "no-store" })
        const data = await response.json()
        setTopics(Array.isArray(data.topics) ? data.topics : [])
        setLagSeries(Array.isArray(data.kafkaLagSeries) ? data.kafkaLagSeries : [])
        setErrorRates(Array.isArray(data.errorRateSeries) ? data.errorRateSeries : [])
      } catch {
        setError("Failed to load Kafka telemetry.")
      } finally {
        setLoading(false)
      }
    }
    void loadKafkaData()
  }, [])

  const totalLag = useMemo(
    () => topics.reduce((sum, topic) => sum + topic.lag, 0),
    [topics]
  )
  const totalRate = useMemo(
    () => topics.reduce((sum, topic) => sum + topic.rate, 0),
    [topics]
  )
  const maxErrorRate = useMemo(
    () => Math.max(0, ...errorRates.map((point) => point.rate)),
    [errorRates]
  )

  return (
    <div className="min-h-screen">
      <AdminHeader title="Kafka Management" code="ADM-04" />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Topics</p>
              <p className="font-mono text-2xl font-bold">{topics.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Messages / sec</p>
              <p className="font-mono text-2xl font-bold">{totalRate}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Total Lag</p>
              <p className="font-mono text-2xl font-bold">{totalLag}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Peak API Error</p>
              <p className="font-mono text-2xl font-bold">{(maxErrorRate * 100).toFixed(2)}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-base">
              <MessageSquare className="h-5 w-5 text-primary" />
              Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading topics...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Lag</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Consumers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow key={topic.name} className="border-border">
                      <TableCell className="font-mono text-sm">{topic.name}</TableCell>
                      <TableCell className="font-mono">{topic.lag}</TableCell>
                      <TableCell className="font-mono">{topic.rate}</TableCell>
                      <TableCell className="font-mono">{topic.consumers}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            topic.lag <= 5
                              ? "bg-success/20 text-success border-success/30"
                              : topic.lag <= 15
                              ? "bg-warning/20 text-warning border-warning/30"
                              : "bg-error/20 text-error border-error/30"
                          }
                        >
                          {topic.lag <= 5 ? "healthy" : topic.lag <= 15 ? "watch" : "degraded"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-base">
                <Clock className="h-5 w-5 text-info" />
                Kafka Lag Time Series
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lagSeries.map((point) => (
                <div key={point.time} className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="font-mono text-xs text-muted-foreground">{point.time}</p>
                  <p className="text-sm">Student Topic: {point.studentTopic}</p>
                  <p className="text-sm">Faculty Topic: {point.facultyTopic}</p>
                  <p className="text-sm">Credential Topic: {point.credentialsTopic}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-base">
                <Activity className="h-5 w-5 text-secondary" />
                Endpoint Error Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Error Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorRates.map((point) => (
                    <TableRow key={point.endpoint} className="border-border">
                      <TableCell className="font-mono text-xs">{point.endpoint}</TableCell>
                      <TableCell className="font-mono">
                        <span className={point.rate > 0.05 ? "text-error" : "text-success"}>
                          {(point.rate * 100).toFixed(2)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
