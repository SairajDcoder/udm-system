import { NextRequest, NextResponse } from "next/server"
import { createCreditTransfer } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const claims = await getSessionClaimsFromRequest(request)
    const studentId = claims?.sub

    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const transfer = await createCreditTransfer({
      studentId: studentId,
      destinationInstitution: body.destinationInstitution,
      creditsRequested: Number(body.creditsRequested || 0),
      courseCodes: Array.isArray(body.courseCodes) ? body.courseCodes : [],
      reason: body.reason || "",
    })

    return NextResponse.json({ transfer })
  } catch (error) {
    console.error("Credit transfer error:", error)
    return NextResponse.json({ error: "Failed to create credit transfer request." }, { status: 500 })
  }
}
