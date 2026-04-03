import { NextRequest, NextResponse } from "next/server"
import { getVerificationHistory } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const verifierId = request.nextUrl.searchParams.get("verifierId") || undefined
  const history = await getVerificationHistory(verifierId)
  return NextResponse.json({ history })
}
