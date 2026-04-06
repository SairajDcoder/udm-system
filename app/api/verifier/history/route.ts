import { NextRequest, NextResponse } from "next/server"
import { getVerificationHistory } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const verifierId = claims?.sub
  
  if (!verifierId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const history = await getVerificationHistory(verifierId)
  return NextResponse.json({ history })
}
