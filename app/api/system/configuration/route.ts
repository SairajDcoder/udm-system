import { NextResponse } from "next/server"
import { getSystemOverview } from "@/lib/unichain/service"

export async function GET() {
  const overview = await getSystemOverview()
  return NextResponse.json({
    blockchain: {
      activeValidators: overview.activeValidators,
      totalValidators: overview.totalValidators,
    },
    storage: {
      ipfsStorage: overview.ipfsStorage,
      ipfsUtilization: overview.ipfsUtilization,
    },
    performance: {
      tps: overview.tps,
      peakTps: overview.peakTps,
      pendingTransactions: overview.pendingTransactions,
      averageWaitSeconds: overview.averageWaitSeconds,
    },
  })
}
