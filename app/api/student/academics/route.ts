import { NextRequest, NextResponse } from "next/server"
import { getStudentAcademics } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const studentId = claims?.sub

  const academics = await getStudentAcademics(studentId || undefined)
  return NextResponse.json(academics)
}
