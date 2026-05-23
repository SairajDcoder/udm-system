import { NextRequest, NextResponse } from "next/server"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"
import { createResearchDocument, listFacultyResearchDocuments } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const facultyId = claims?.sub
  const documents = await listFacultyResearchDocuments(facultyId)
  return NextResponse.json({ documents })
}

export async function POST(request: NextRequest) {
  try {
    const claims = await getSessionClaimsFromRequest(request)
    const facultyId = claims?.sub

    if (!facultyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const document = await createResearchDocument({
      facultyId,
      title: String(body.title ?? ""),
      department: body.department ? String(body.department) : undefined,
      visibility: body.visibility === "private" || body.visibility === "public" ? body.visibility : "shared",
      body: String(body.body ?? ""),
    })

    return NextResponse.json({ document })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload research document."
    const status = /unsupported document type|maximum allowed size|body is required|policy is required/i.test(message) ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
