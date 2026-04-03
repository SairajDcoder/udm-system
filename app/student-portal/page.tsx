"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, ChevronRight, Clock, FileText, ShieldCheck, TrendingUp, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type StudentDashboard = {
  student: { fullName: string }
  cgpa: number
  creditsEarned: number
  activeCourses: number
  pendingRequests: number
  recentGrades: Array<{
    id: string
    grade: string
    total: number
    course?: { code: string; title: string; credits: number } | null
  }>
  upcomingDeadlines: Array<{ title: string; date: string; type: string; urgent: boolean }>
  credentialPreview: Array<{ id: string; title: string; issuer: string; status: string }>
}

function CGPAProgress({ value, max = 4 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-28 w-28 -rotate-90">
        <circle cx="56" cy="56" r="45" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-200" />
        <circle
          cx="56"
          cy="56"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="text-teal-500"
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading text-2xl font-bold text-navy-900">{value.toFixed(2)}</span>
        <span className="text-xs text-gray-500">/ {max.toFixed(1)}</span>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
}) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-navy-900">{value}</p>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
            <Icon className="h-6 w-6 text-teal-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null)

  useEffect(() => {
    let mounted = true

    fetch("/api/dashboard/student", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: StudentDashboard) => {
        if (mounted) setData(payload)
      })
      .catch(() => {
        if (mounted) setData(null)
      })

    return () => {
      mounted = false
    }
  }, [])

  const recentGrades = data?.recentGrades ?? []
  const upcomingDeadlines = data?.upcomingDeadlines ?? []
  const credentialPreview = data?.credentialPreview ?? []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 shadow-sm md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current CGPA</p>
                <p className="mt-2 text-sm text-gray-500">{data?.student.fullName ?? "Loading student"}</p>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-teal-500" />
                  <span className="text-xs font-medium text-teal-600">
                    Backed by approved blockchain grades
                  </span>
                </div>
              </div>
              <CGPAProgress value={data?.cgpa ?? 0} />
            </div>
          </CardContent>
        </Card>

        <StatCard title="Credits Earned" value={data?.creditsEarned ?? 0} subtitle="Approved transcript credits" icon={BookOpen} />
        <StatCard title="Active Courses" value={data?.activeCourses ?? 0} subtitle="Current registered courses" icon={Wallet} />
        <StatCard title="Pending Requests" value={data?.pendingRequests ?? 0} subtitle="Transcript or admin requests" icon={FileText} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="font-heading text-lg font-semibold text-navy-900">Recent Grades</CardTitle>
            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700" asChild>
              <Link href="/student-portal/academics">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-500">Course Code</TableHead>
                  <TableHead className="text-gray-500">Course Name</TableHead>
                  <TableHead className="text-center text-gray-500">Credits</TableHead>
                  <TableHead className="text-center text-gray-500">Grade</TableHead>
                  <TableHead className="text-right text-gray-500">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.map((grade) => (
                  <TableRow key={grade.id} className="border-gray-100">
                    <TableCell className="font-mono text-sm text-navy-900">{grade.course?.code ?? "N/A"}</TableCell>
                    <TableCell className="font-medium text-navy-900">{grade.course?.title ?? "Course unavailable"}</TableCell>
                    <TableCell className="text-center text-gray-600">{grade.course?.credits ?? 0}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={grade.grade.startsWith("A") ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"}
                      >
                        {grade.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-navy-900">{grade.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={`${deadline.title}-${deadline.date}`} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-900">{deadline.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">{deadline.date}</span>
                      {deadline.urgent ? <Badge variant="destructive" className="rounded-full text-[10px]">Urgent</Badge> : null}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-heading text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-teal-500" />
                My Credentials
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700" asChild>
                <Link href="/student-portal/credentials">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {credentialPreview.map((credential) => (
                <div key={credential.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-teal-200 hover:bg-teal-50/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                    <ShieldCheck className="h-5 w-5 text-teal-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-900">{credential.title}</p>
                    <p className="truncate text-xs text-gray-500">{credential.issuer}</p>
                  </div>
                  <Badge className="rounded-full bg-teal-100 px-2 text-[10px] text-teal-700">
                    {credential.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
