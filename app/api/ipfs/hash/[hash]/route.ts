import { NextRequest, NextResponse } from "next/server"
import { getStoredDocumentByReference, getStoredDocumentAccess } from "@/lib/unichain/service"

export async function GET(request: NextRequest, context: { params: Promise<{ hash: string }> }) {
  const { hash } = await context.params
  const requesterEmail = request.nextUrl.searchParams.get("requesterEmail") || undefined
  const requesterId = request.nextUrl.searchParams.get("requesterId") || undefined
  const document = await getStoredDocumentByReference(hash)

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 })
  }

  const view = await getStoredDocumentAccess({
    documentId: document.id,
    requesterEmail,
    requesterId,
  })

  return NextResponse.json({
    ...view,
    reference: hash,
  })
}
