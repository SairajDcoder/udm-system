import { NextRequest, NextResponse } from "next/server"
import { getStudentWorkspace, getUserByEmail } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const explicitStudentId = request.nextUrl.searchParams.get("studentId")?.trim() || undefined
  const sessionEmail = claims?.email?.trim().toLowerCase()
  const studentByEmail = sessionEmail ? await getUserByEmail(sessionEmail) : null
  const resolvedStudentId = explicitStudentId || studentByEmail?.id || claims?.sub || undefined

  let workspace
  try {
    workspace = await getStudentWorkspace(resolvedStudentId)
  } catch {
    workspace = await getStudentWorkspace()
  }

  return NextResponse.json(workspace, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
