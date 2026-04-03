import { NextRequest, NextResponse } from "next/server"
import { listFacultyGrades } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const facultyId = request.nextUrl.searchParams.get("facultyId") || undefined
  const data = await listFacultyGrades(facultyId)
  return NextResponse.json(data)
}
