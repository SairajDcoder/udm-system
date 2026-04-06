import { NextRequest, NextResponse } from "next/server"
import { getAdminWorkspace } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  if (!claims || claims.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspace = await getAdminWorkspace()
  return NextResponse.json({ users: workspace.users })
}
