import { NextRequest, NextResponse } from "next/server"
import { listValidatorNodes } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const blockchain = request.nextUrl.searchParams.get("blockchain") as "student" | "faculty" | "institutional" | null
  const validators = await listValidatorNodes(blockchain ?? undefined)
  return NextResponse.json({ validators })
}
