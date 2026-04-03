import { NextResponse } from "next/server"
import { getEligibleDegreeCandidates } from "@/lib/unichain/service"

export async function GET() {
  const candidates = await getEligibleDegreeCandidates()
  return NextResponse.json({ candidates })
}
