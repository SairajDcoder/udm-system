import { NextRequest, NextResponse } from "next/server"
import { listStudentCredentials } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const studentId = claims?.sub

  const credentials = await listStudentCredentials(studentId || undefined)
  return NextResponse.json({ credentials })
}
