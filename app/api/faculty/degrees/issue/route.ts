import { NextRequest, NextResponse } from "next/server"
import { issueDegree } from "@/lib/unichain/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const studentIds = Array.isArray(body.studentIds) ? body.studentIds : []
    const results = await issueDegree({ studentIds, issuedBy: body.issuedBy })
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: "Failed to issue degree credentials." }, { status: 500 })
  }
}
