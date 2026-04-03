import { NextRequest, NextResponse } from "next/server"
import { reviewCreditTransfer } from "@/lib/unichain/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const transfer = await reviewCreditTransfer({
      transferId: String(body.transferId),
      status: body.status,
      decisionNote: body.decisionNote,
    })
    return NextResponse.json({ transfer })
  } catch {
    return NextResponse.json({ error: "Failed to review transfer request." }, { status: 500 })
  }
}
