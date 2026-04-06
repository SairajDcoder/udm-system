import { NextRequest, NextResponse } from "next/server"
import { listFacultyTranscriptRequests, reviewTranscriptRequest } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET() {
  const requests = await listFacultyTranscriptRequests()
  return NextResponse.json({ requests })
}

export async function PATCH(request: NextRequest) {
  try {
    const claims = await getSessionClaimsFromRequest(request)
    const facultyId = claims?.sub

    if (!facultyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const transcriptRequest = await reviewTranscriptRequest({
      requestId: String(body.requestId),
      status: body.status,
      note: body.note,
      reviewedBy: facultyId,
    })
    return NextResponse.json({ request: transcriptRequest })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update transcript request." }, { status: 500 })
  }
}
