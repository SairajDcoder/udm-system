import { NextRequest, NextResponse } from "next/server"
import { verifyCredentialByHash } from "@/lib/unichain/service"

export async function GET(request: NextRequest, context: { params: Promise<{ hash: string }> }) {
  try {
    const { hash } = await context.params
    const verifierEmail = request.nextUrl.searchParams.get("verifierEmail") || undefined
    const method = (request.nextUrl.searchParams.get("method") || "hash") as "hash" | "qr" | "api"
    const report = await verifyCredentialByHash({
      hash,
      verifierEmail,
      method,
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Credential verification error:", error)
    return NextResponse.json({ error: "Failed to verify credential." }, { status: 500 })
  }
}
