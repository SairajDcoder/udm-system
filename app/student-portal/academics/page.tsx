"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Award, BookOpen, Target } from "lucide-react"

// Sample Data
const semesters = [
  { id: "fall-2022", name: "Fall 2022", gpa: 3.45 },
  { id: "spring-2023", name: "Spring 2023", gpa: 3.52 },
  { id: "fall-2023", name: "Fall 2023", gpa: 3.61 },
  { id: "spring-2024", name: "Spring 2024", gpa: 3.68 },
  { id: "fall-2024", name: "Fall 2024", gpa: 3.72 },
  { id: "spring-2025", name: "Spring 2025", gpa: 3.75 },
  { id: "fall-2025", name: "Fall 2025", gpa: 3.78 },
]

const coursesBySemester: Record<string, Array<{
  code: string
  name: string
  credits: number
  internal: number
  external: number
  total: number
  grade: string
  gradePoints: number
}>> = {
  "fall-2025": [
    { code: "CS401", name: "Machine Learning", credits: 4, internal: 38, external: 85, total: 92, grade: "A", gradePoints: 4.0 },
    { code: "CS402", name: "Distributed Systems", credits: 3, internal: 35, external: 78, total: 85, grade: "A-", gradePoints: 3.7 },
    { code: "CS403", name: "Computer Networks", credits: 3, internal: 32, external: 72, total: 78, grade: "B+", gradePoints: 3.3 },
    { code: "CS404", name: "Software Engineering", credits: 3, internal: 37, external: 82, total: 89, grade: "A", gradePoints: 4.0 },
    { code: "MA301", name: "Linear Algebra", credits: 3, internal: 40, external: 88, total: 95, grade: "A+", gradePoints: 4.0 },
    { code: "CS405", name: "Cloud Computing", credits: 3, internal: 34, external: 76, total: 82, grade: "A-", gradePoints: 3.7 },
  ],
  "spring-2025": [
    { code: "CS301", name: "Database Systems", credits: 4, internal: 36, external: 80, total: 88, grade: "A", gradePoints: 4.0 },
    { code: "CS302", name: "Operating Systems", credits: 3, internal: 33, external: 75, total: 81, grade: "A-", gradePoints: 3.7 },
    { code: "CS303", name: "Computer Architecture", credits: 3, internal: 30, external: 70, total: 75, grade: "B+", gradePoints: 3.3 },
    { code: "CS304", name: "Algorithms II", credits: 3, internal: 38, external: 84, total: 91, grade: "A", gradePoints: 4.0 },
    { code: "MA202", name: "Probability & Statistics", credits: 3, internal: 35, external: 79, total: 86, grade: "A", gradePoints: 4.0 },
  ],
  "fall-2024": [
    { code: "CS201", name: "Data Structures", credits: 4, internal: 37, external: 82, total: 90, grade: "A", gradePoints: 4.0 },
    { code: "CS202", name: "Object-Oriented Programming", credits: 3, internal: 34, external: 76, total: 83, grade: "A-", gradePoints: 3.7 },
    { code: "CS203", name: "Discrete Mathematics", credits: 3, internal: 31, external: 71, total: 76, grade: "B+", gradePoints: 3.3 },
    { code: "CS204", name: "Web Development", credits: 3, internal: 39, external: 86, total: 94, grade: "A+", gradePoints: 4.0 },
    { code: "MA201", name: "Calculus II", credits: 3, internal: 33, external: 74, total: 80, grade: "A-", gradePoints: 3.7 },
  ],
}

// Fill in remaining semesters with sample data
const defaultCourses = [
  { code: "CS101", name: "Introduction to Programming", credits: 4, internal: 35, external: 78, total: 85, grade: "A-", gradePoints: 3.7 },
  { code: "CS102", name: "Computer Fundamentals", credits: 3, internal: 32, external: 72, total: 78, grade: "B+", gradePoints: 3.3 },
  { code: "MA101", name: "Calculus I", credits: 3, internal: 30, external: 68, total: 73, grade: "B", gradePoints: 3.0 },
  { code: "PH101", name: "Physics I", credits: 3, internal: 34, external: 76, total: 83, grade: "A-", gradePoints: 3.7 },
]

semesters.forEach(sem => {
  if (!coursesBySemester[sem.id]) {
    coursesBySemester[sem.id] = defaultCourses
  }
})

const gpaChartData = semesters.map(sem => ({
  semester: sem.name.replace("20", "'"),
  gpa: sem.gpa,
}))

function getGradeColor(grade: string) {
  if (grade.startsWith("A")) return "bg-teal-100 text-teal-700"
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700"
  if (grade.startsWith("C")) return "bg-amber-100 text-amber-700"
  return "bg-gray-100 text-gray-700"
}

export default function AcademicsPage() {
  const [selectedSemester, setSelectedSemester] = useState("fall-2025")
  const courses = coursesBySemester[selectedSemester] || []
  const currentSemesterData = semesters.find(s => s.id === selectedSemester)
  
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0)
  const weightedPoints = courses.reduce((sum, c) => sum + c.credits * c.gradePoints, 0)
  const semesterGPA = totalCredits > 0 ? weightedPoints / totalCredits : 0

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
              <Target className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current CGPA</p>
              <p className="text-2xl font-heading font-bold text-navy-900">3.72</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Semester GPA</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{semesterGPA.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <BookOpen className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="text-2xl font-heading font-bold text-navy-900">124</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Class Rank</p>
              <p className="text-2xl font-heading font-bold text-navy-900">12 / 186</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Trend Chart */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900">GPA Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gpaChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="semester" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    domain={[3.0, 4.0]} 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1628',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    labelStyle={{ color: '#94A3B8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="#0E8A7E"
                    strokeWidth={3}
                    dot={{ fill: '#0E8A7E', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: '#14B5A5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Table */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg text-navy-900">Course Grades</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Semester Tabs */}
            <Tabs value={selectedSemester} onValueChange={setSelectedSemester} className="w-full">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex h-auto bg-gray-100 p-1 rounded-lg">
                  {semesters.slice().reverse().map((semester) => (
                    <TabsTrigger
                      key={semester.id}
                      value={semester.id}
                      className="px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {semester.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {semesters.map((semester) => (
                <TabsContent key={semester.id} value={semester.id} className="mt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-500 font-medium">Code</TableHead>
                          <TableHead className="text-gray-500 font-medium">Course Name</TableHead>
                          <TableHead className="text-gray-500 font-medium text-center">Credits</TableHead>
                          <TableHead className="text-gray-500 font-medium text-center">Internal</TableHead>
                          <TableHead className="text-gray-500 font-medium text-center">External</TableHead>
                          <TableHead className="text-gray-500 font-medium text-center">Total</TableHead>
                          <TableHead className="text-gray-500 font-medium text-center">Grade</TableHead>
                          <TableHead className="text-gray-500 font-medium text-right">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(coursesBySemester[semester.id] || []).map((course) => (
                          <TableRow key={course.code} className="border-gray-100">
                            <TableCell className="font-mono text-sm text-navy-900">{course.code}</TableCell>
                            <TableCell className="font-medium text-navy-900">{course.name}</TableCell>
                            <TableCell className="text-center text-gray-600">{course.credits}</TableCell>
                            <TableCell className="text-center text-gray-600">{course.internal}/40</TableCell>
                            <TableCell className="text-center text-gray-600">{course.external}/100</TableCell>
                            <TableCell className="text-center font-medium text-navy-900">{course.total}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${getGradeColor(course.grade)} rounded-full px-3`}>
                                {course.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-navy-900">
                              {course.gradePoints.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Semester Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Total Credits</p>
                        <p className="text-lg font-heading font-bold text-navy-900">
                          {(coursesBySemester[semester.id] || []).reduce((sum, c) => sum + c.credits, 0)}
                        </p>
                      </div>
                      <div className="h-10 w-px bg-gray-200" />
                      <div>
                        <p className="text-xs text-gray-500">Semester GPA</p>
                        <p className="text-lg font-heading font-bold text-teal-600">
                          {semester.gpa.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-teal-500 text-white hover:bg-teal-500 rounded-full px-4 py-1">
                      Blockchain Verified
                    </Badge>
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
