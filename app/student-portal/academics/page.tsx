"use client"

import { useEffect, useMemo, useState } from "react"
import { Award, BookOpen, Target, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type SemesterCourse = {
  code: string
  name: string
  credits: number
  grade: string
  marks: number
}

type SemesterSummary = {
  semester: string
  sgpa: number
  credits: number
  creditsEarned: number
  status: "completed" | "ongoing"
  courses: SemesterCourse[]
}

type AcademicsPayload = {
  cgpa: number
  creditsEarned: number
  semesters: SemesterSummary[]
  currentCourses: Array<{ id: string; code: string; name: string; credits: number; faculty: string }>
}

function getGradeColor(grade: string) {
  if (grade.startsWith("A")) return "bg-teal-100 text-teal-700"
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700"
  if (grade.startsWith("C")) return "bg-amber-100 text-amber-700"
  return "bg-gray-100 text-gray-700"
}

export default function AcademicsPage() {
  const [data, setData] = useState<AcademicsPayload | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<string>("")

  useEffect(() => {
    fetch("/api/student/academics")
      .then((response) => response.json())
      .then((payload: AcademicsPayload) => {
        setData(payload)
        if (payload.semesters[0]) {
          setSelectedSemester(payload.semesters[0].semester)
        }
      })
      .catch(() => setData(null))
  }, [])

  const semesters = data?.semesters ?? []
  const currentSemester = semesters.find((semester) => semester.semester === selectedSemester) ?? semesters[0]
  const chartData = useMemo(
    () =>
      semesters
        .slice()
        .reverse()
        .map((semester) => ({
          semester: semester.semester.replace("20", "'"),
          gpa: semester.sgpa,
        })),
    [semesters]
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
              <Target className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current CGPA</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{(data?.cgpa ?? 0).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Semester GPA</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{(currentSemester?.sgpa ?? 0).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <BookOpen className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{data?.creditsEarned ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Semesters</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{semesters.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900">GPA Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="semester" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} />
                  <YAxis domain={[2, 4]} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="gpa" stroke="#0E8A7E" strokeWidth={3} dot={{ fill: "#0E8A7E", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg text-navy-900">Course Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedSemester} onValueChange={setSelectedSemester} className="w-full">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex h-auto rounded-lg bg-gray-100 p-1">
                  {semesters.map((semester) => (
                    <TabsTrigger key={semester.semester} value={semester.semester} className="whitespace-nowrap px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      {semester.semester}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {semesters.map((semester) => (
                <TabsContent key={semester.semester} value={semester.semester} className="mt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-500 font-medium">Code</TableHead>
                          <TableHead className="text-gray-500 font-medium">Course Name</TableHead>
                          <TableHead className="text-center text-gray-500 font-medium">Credits</TableHead>
                          <TableHead className="text-center text-gray-500 font-medium">Total</TableHead>
                          <TableHead className="text-center text-gray-500 font-medium">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semester.courses.map((course) => (
                          <TableRow key={`${semester.semester}-${course.code}`} className="border-gray-100">
                            <TableCell className="font-mono text-sm text-navy-900">{course.code}</TableCell>
                            <TableCell className="font-medium text-navy-900">{course.name}</TableCell>
                            <TableCell className="text-center text-gray-600">{course.credits}</TableCell>
                            <TableCell className="text-center font-medium text-navy-900">{course.marks}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${getGradeColor(course.grade)} rounded-full px-3`}>{course.grade}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
