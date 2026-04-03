import { NextResponse } from "next/server"
import { getSystemOverview } from "@/lib/unichain/service"

export async function GET() {
  const overview = await getSystemOverview()
  const namespaces = Array.from(new Set(overview.pods.map((pod) => pod.namespace)))
  return NextResponse.json({
    namespaces,
    pods: overview.pods,
    serviceHealth: overview.serviceHealth,
  })
}
