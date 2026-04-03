import { NextRequest, NextResponse } from "next/server"
import { createResearchDocument, listFacultyResearchDocuments } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const facultyId = request.nextUrl.searchParams.get("facultyId") || undefined
  const documents = await listFacultyResearchDocuments(facultyId)
  return NextResponse.json({ documents })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const document = await createResearchDocument({
      facultyId: body.facultyId,
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
