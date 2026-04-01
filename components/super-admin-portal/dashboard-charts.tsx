"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const tpsData = [
  { time: "00:00", tps: 850 },
  { time: "02:00", tps: 620 },
  { time: "04:00", tps: 430 },
  { time: "06:00", tps: 580 },
  { time: "08:00", tps: 1200 },
  { time: "10:00", tps: 1890 },
  { time: "12:00", tps: 2100 },
  { time: "14:00", tps: 1950 },
  { time: "16:00", tps: 2400 },
  { time: "18:00", tps: 1800 },
  { time: "20:00", tps: 1400 },
  { time: "22:00", tps: 980 },
]

const kafkaLagData = [
  { time: "00:00", studentTopic: 120, facultyTopic: 80, credentialsTopic: 200 },
  { time: "04:00", studentTopic: 150, facultyTopic: 90, credentialsTopic: 180 },
  { time: "08:00", studentTopic: 450, facultyTopic: 320, credentialsTopic: 890 },
  { time: "12:00", studentTopic: 380, facultyTopic: 250, credentialsTopic: 650 },
  { time: "16:00", studentTopic: 520, facultyTopic: 380, credentialsTopic: 1200 },
  { time: "20:00", studentTopic: 280, facultyTopic: 150, credentialsTopic: 420 },
]

const errorRateData = [
  { endpoint: "/api/students", rate: 0.12 },
  { endpoint: "/api/faculty", rate: 0.08 },
  { endpoint: "/api/credentials", rate: 0.25 },
  { endpoint: "/api/blockchain", rate: 0.15 },
  { endpoint: "/api/ipfs", rate: 0.32 },
  { endpoint: "/api/auth", rate: 0.05 },
]

export function TPSChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base">Transactions Per Second</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tpsData}>
              <defs>
                <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D64045" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D64045" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1B263B",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#E5E7EB" }}
              />
              <Area
                type="monotone"
                dataKey="tps"
                stroke="#D64045"
                strokeWidth={2}
                fill="url(#tpsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function KafkaLagChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base">Kafka Consumer Lag</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kafkaLagData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1B263B",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#E5E7EB" }}
              />
              <Line
                type="monotone"
                dataKey="studentTopic"
                stroke="#D64045"
                strokeWidth={2}
                dot={false}
                name="Student Topic"
              />
              <Line
                type="monotone"
                dataKey="facultyTopic"
                stroke="#E8A838"
                strokeWidth={2}
                dot={false}
                name="Faculty Topic"
              />
              <Line
                type="monotone"
                dataKey="credentialsTopic"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="Credentials Topic"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Student</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Faculty</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-info" />
            <span className="text-muted-foreground">Credentials</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ErrorRateChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base">API Error Rate (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorRateData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis
                type="number"
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 0.5]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <YAxis
                type="category"
                dataKey="endpoint"
                stroke="#9CA3AF"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1B263B",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, "Error Rate"]}
                labelStyle={{ color: "#E5E7EB" }}
              />
              <Bar
                dataKey="rate"
                fill="#D64045"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
