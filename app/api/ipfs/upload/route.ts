import { NextRequest, NextResponse } from "next/server"
import { uploadDocument } from "@/lib/unichain/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const document = await uploadDocument({
      ownerId: body.ownerId,
      title: body.title,
      type: body.type,
      body: body.body,
      policy: body.policy,
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error("IPFS upload error:", error)
    const message = error instanceof Error ? error.message : "Failed to upload document."
    const status = /unsupported document type|maximum allowed size|body is required|policy is required/i.test(message) ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
