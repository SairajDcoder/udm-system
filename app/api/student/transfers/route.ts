import { NextRequest, NextResponse } from "next/server"
import { listStudentTransfers } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const studentId = claims?.sub

  const transfers = await listStudentTransfers(studentId || undefined)
  return NextResponse.json({ transfers })
}
