import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getAdminWorkspace, upgradeSmartContract } from "@/lib/unichain/service"

export async function GET() {
  const workspace = await getAdminWorkspace()
  return NextResponse.json({ contracts: workspace.smartContracts })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const contract = await upgradeSmartContract({
      contractName: String(body.contractName ?? ""),
      newVersion: body.newVersion ? String(body.newVersion) : undefined,
      upgradedBy: body.upgradedBy ? String(body.upgradedBy) : undefined,
    })
    return NextResponse.json({ contract })
  } catch {
    return NextResponse.json({ error: "Failed to upgrade contract." }, { status: 500 })
  }
}
