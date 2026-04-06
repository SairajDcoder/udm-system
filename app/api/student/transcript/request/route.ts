import { NextRequest, NextResponse } from "next/server"
import { createTranscriptRequest, getTranscriptRequests } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const studentId = claims?.sub
  const requests = await getTranscriptRequests(studentId)
  return NextResponse.json({ requests })
}

export async function POST(request: NextRequest) {
  try {
    const claims = await getSessionClaimsFromRequest(request)
    const body = await request.json()
    const studentId = body.studentId || claims?.sub
    
    if (!studentId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const result = await createTranscriptRequest({
      studentId: studentId,
      purpose: body.purpose,
      destination: body.destination,
      address: body.address,
      copies: Number(body.copies || 1),
      format: body.format || "Official PDF",
      notes: body.notes,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Transcript request error:", error)
    return NextResponse.json({ error: "Failed to create transcript request." }, { status: 500 })
  }
}
