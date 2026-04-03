import { NextResponse } from "next/server"
import { getAdminWorkspace } from "@/lib/unichain/service"

export async function GET() {
  const workspace = await getAdminWorkspace()
  return NextResponse.json({
    validators: workspace.validators,
    blocks: workspace.blocks,
    transactions: workspace.transactions,
    tpsSeries: workspace.overview.tpsSeries,
  })
}
