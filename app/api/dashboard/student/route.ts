import { NextRequest, NextResponse } from "next/server"
import { getDashboardData, getUserByEmail } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const sessionEmail = claims?.email?.trim().toLowerCase()
  const student = sessionEmail ? await getUserByEmail(sessionEmail) : null
  const studentId = student?.id ?? claims?.sub

  let data
  try {
    data = await getDashboardData("student", studentId)
  } catch {
    data = await getDashboardData("student")
  }
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
