import { NextRequest, NextResponse } from "next/server"
import { listValidatorNodes, registerValidatorNode, slashValidatorNode } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const blockchain = request.nextUrl.searchParams.get("blockchain") || undefined
  const validators = await listValidatorNodes(blockchain as "student" | "faculty" | "institutional" | undefined)
  return NextResponse.json({ validators })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validator = await registerValidatorNode({
      blockchain: body.blockchain,
      name: String(body.name ?? ""),
      walletAddress: String(body.walletAddress ?? ""),
      stake: Number(body.stake ?? 0),
      uptime: body.uptime ? Number(body.uptime) : undefined,
    })
    return NextResponse.json({ validator })
  } catch {
    return NextResponse.json({ error: "Failed to register validator." }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validator = await slashValidatorNode({
      validatorId: String(body.validatorId ?? ""),
      amount: Number(body.amount ?? 0),
      reason: String(body.reason ?? "Policy violation"),
      executedBy: body.executedBy ? String(body.executedBy) : undefined,
    })
    return NextResponse.json({ validator })
  } catch {
    return NextResponse.json({ error: "Failed to update validator stake." }, { status: 500 })
  }
}
