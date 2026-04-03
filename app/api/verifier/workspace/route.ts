import { NextRequest, NextResponse } from "next/server"
import { getVerifierWorkspace } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const verifierId = request.nextUrl.searchParams.get("verifierId") || undefined
  const workspace = await getVerifierWorkspace(verifierId)
  return NextResponse.json(workspace)
}
