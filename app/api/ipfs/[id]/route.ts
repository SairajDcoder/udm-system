import { NextRequest, NextResponse } from "next/server"
import { getStoredDocumentAccess, rekeyStoredDocument } from "@/lib/unichain/service"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const requesterEmail = request.nextUrl.searchParams.get("requesterEmail") || undefined
  const requesterId = request.nextUrl.searchParams.get("requesterId") || undefined
  const view = await getStoredDocumentAccess({
    documentId: id,
    requesterEmail,
    requesterId,
  })

  if (!view) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 })
  }

  return NextResponse.json(view)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const document = await rekeyStoredDocument({
      documentId: id,
      policy: String(body.policy ?? ""),
      requesterEmail: body.requesterEmail ? String(body.requesterEmail) : undefined,
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error("IPFS rekey error:", error)
    const message = error instanceof Error ? error.message : "Failed to update document policy."
    const status = /not found|cannot be re-keyed|policy is required|policy/i.test(message) ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const document = await import("@/lib/unichain/service").then((mod) => mod.deleteStoredDocument(id))
    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error("IPFS delete error:", error)
    const message = error instanceof Error ? error.message : "Failed to delete document."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
