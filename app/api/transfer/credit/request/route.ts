import { NextRequest, NextResponse } from "next/server"
import { createCreditTransfer } from "@/lib/unichain/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const transfer = await createCreditTransfer({
      studentId: body.studentId,
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
