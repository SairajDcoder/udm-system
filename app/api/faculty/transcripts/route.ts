import { NextRequest, NextResponse } from "next/server"
import { listFacultyTranscriptRequests, reviewTranscriptRequest } from "@/lib/unichain/service"

export async function GET() {
  const requests = await listFacultyTranscriptRequests()
  return NextResponse.json({ requests })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const transcriptRequest = await reviewTranscriptRequest({
      requestId: String(body.requestId),
      status: body.status,
      note: body.note,
      reviewedBy: body.reviewedBy,
    })
    return NextResponse.json({ request: transcriptRequest })
  } catch {
    return NextResponse.json({ error: "Failed to update transcript request." }, { status: 500 })
  }
}
