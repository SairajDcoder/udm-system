import { NextRequest, NextResponse } from "next/server"
import { listFacultyCourses } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const facultyId = request.nextUrl.searchParams.get("facultyId") || undefined
  const courses = await listFacultyCourses(facultyId)
  return NextResponse.json({ courses })
}
