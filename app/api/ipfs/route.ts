import { NextRequest, NextResponse } from "next/server"
import { listStoredDocuments } from "@/lib/unichain/service"
import type { StoredDocument } from "@/lib/unichain/types"

export async function GET(request: NextRequest) {
  const ownerId = request.nextUrl.searchParams.get("ownerId") || undefined
  const type = request.nextUrl.searchParams.get("type") || undefined
  const pinnedParam = request.nextUrl.searchParams.get("pinned")
  const pinned =
    pinnedParam === "true" ? true : pinnedParam === "false" ? false : undefined

  const documents = await listStoredDocuments({
    ownerId,
    type: type as StoredDocument["type"] | undefined,
    pinned,
  })

  return NextResponse.json({ documents })
}
