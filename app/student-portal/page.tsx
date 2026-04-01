"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BookOpen,
  Clock,
  Award,
  FileText,
  TrendingUp,
  Calendar,
  ChevronRight,
  Wallet,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"

// Circular Progress Ring Component
function CGPAProgress({ value, max = 4.0 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-28 h-28 transform -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="56"
          cy="56"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="text-teal-500"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-heading font-bold text-navy-900">{value.toFixed(2)}</span>
        <span className="text-xs text-gray-500">/ {max.toFixed(1)}</span>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: { value: number; label: string }
}) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-heading font-bold text-navy-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-teal-500" />
                <span className="text-xs text-teal-600 font-medium">
                  +{trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
            <Icon className="h-6 w-6 text-teal-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample Data
const recentGrades = [
  { code: "CS401", name: "Machine Learning", credits: 4, grade: "A", points: 4.0, semester: "Fall 2025" },
  { code: "CS402", name: "Distributed Systems", credits: 3, grade: "A-", points: 3.7, semester: "Fall 2025" },
  { code: "CS403", name: "Computer Networks", credits: 3, grade: "B+", points: 3.3, semester: "Fall 2025" },
  { code: "MA301", name: "Linear Algebra", credits: 3, grade: "A", points: 4.0, semester: "Fall 2025" },
]

const upcomingDeadlines = [
  { title: "ML Project Submission", date: "Apr 5, 2026", type: "Assignment", urgent: true },
  { title: "Mid-Semester Exam", date: "Apr 12, 2026", type: "Exam", urgent: false },
  { title: "Transcript Request Review", date: "Apr 15, 2026", type: "Administrative", urgent: false },
]

const credentialPreview = [
  { name: "Bachelor of Science", issuer: "State University", verified: true },
  { name: "Dean's List 2025", issuer: "State University", verified: true },
  { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", verified: true },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CGPA Card with Progress Ring */}
        <Card className="border-gray-200 shadow-sm md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current CGPA</p>
                <p className="text-sm text-gray-500 mt-4">Semester 7</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-teal-500" />
                  <span className="text-xs text-teal-600 font-medium">
                    +0.12 from last sem
                  </span>
                </div>
              </div>
              <CGPAProgress value={3.72} />
            </div>
          </CardContent>
        </Card>

        <StatCard
          title="Credits Earned"
          value="124"
          subtitle="of 160 required"
          icon={BookOpen}
        />
        <StatCard
          title="Active Courses"
          value="6"
          subtitle="Current semester"
          icon={Award}
        />
        <StatCard
          title="Pending Requests"
          value="2"
          subtitle="Awaiting approval"
          icon={FileText}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Grades Table */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="font-heading text-lg font-semibold text-navy-900">
              Recent Grades
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700" asChild>
              <Link href="/student-portal/academics">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-500 font-medium">Course Code</TableHead>
                  <TableHead className="text-gray-500 font-medium">Course Name</TableHead>
                  <TableHead className="text-gray-500 font-medium text-center">Credits</TableHead>
                  <TableHead className="text-gray-500 font-medium text-center">Grade</TableHead>
                  <TableHead className="text-gray-500 font-medium text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.map((grade) => (
                  <TableRow key={grade.code} className="border-gray-100">
                    <TableCell className="font-mono text-sm text-navy-900">{grade.code}</TableCell>
                    <TableCell className="font-medium text-navy-900">{grade.name}</TableCell>
                    <TableCell className="text-center text-gray-600">{grade.credits}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          grade.grade.startsWith("A")
                            ? "bg-teal-100 text-teal-700 hover:bg-teal-100"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        }
                      >
                        {grade.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-navy-900">{grade.points.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{deadline.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{deadline.date}</span>
                      {deadline.urgent && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-full">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Credential Wallet Preview */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-heading text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-teal-500" />
                My Credentials
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700" asChild>
                <Link href="/student-portal/credentials">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {credentialPreview.map((credential, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-teal-200 hover:bg-teal-50/30 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                    <ShieldCheck className="h-5 w-5 text-teal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{credential.name}</p>
                    <p className="text-xs text-gray-500 truncate">{credential.issuer}</p>
                  </div>
                  {credential.verified && (
                    <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-[10px] rounded-full px-2">
                      Verified
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
