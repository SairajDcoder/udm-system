import { NextRequest, NextResponse } from "next/server"
import { listFacultyWorkspace } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const facultyId = claims?.sub

  if (!facultyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspace = await listFacultyWorkspace(facultyId)
  return NextResponse.json(workspace)
}
