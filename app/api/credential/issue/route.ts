import { NextRequest, NextResponse } from "next/server"
import { issueDegree } from "@/lib/unichain/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await issueDegree({
      studentIds: Array.isArray(body.studentIds) ? body.studentIds : [],
      issuedBy: body.issuedBy,
    })

    return NextResponse.json({ results: result })
  } catch (error) {
    console.error("Credential issuance error:", error)
    return NextResponse.json({ error: "Failed to issue credentials." }, { status: 500 })
  }
}
