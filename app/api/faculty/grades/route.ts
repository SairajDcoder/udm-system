import { NextRequest, NextResponse } from "next/server"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"
import { listFacultyGrades } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const facultyId = claims?.sub
  const data = await listFacultyGrades(facultyId)
  return NextResponse.json(data)
}
