import { NextRequest, NextResponse } from "next/server"
import {
  createVerifierApiKey,
  getVerifierApiKeys,
  revokeVerifierApiKey,
} from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const verifierId = request.nextUrl.searchParams.get("verifierId") || undefined
  const apiKeys = await getVerifierApiKeys(verifierId)
  return NextResponse.json({ apiKeys })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await createVerifierApiKey({
      verifierId: body.verifierId,
      label: body.label || "Verifier Integration",
      scopes: Array.isArray(body.scopes) ? body.scopes : [],
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to create API key." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const apiKey = await revokeVerifierApiKey(String(body.id), body.verifierId)
    return NextResponse.json({ apiKey })
  } catch {
    return NextResponse.json({ error: "Failed to revoke API key." }, { status: 500 })
  }
}
