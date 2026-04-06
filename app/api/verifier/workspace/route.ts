import { NextRequest, NextResponse } from "next/server"
import { getVerifierWorkspace } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const verifierId = claims?.sub
  
  if (!verifierId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspace = await getVerifierWorkspace(verifierId)
  return NextResponse.json(workspace)
}
