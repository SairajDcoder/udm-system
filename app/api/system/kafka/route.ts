import { NextResponse } from "next/server"
import { getSystemOverview } from "@/lib/unichain/service"

export async function GET() {
  const overview = await getSystemOverview()
  return NextResponse.json({
    topics: overview.topics,
    kafkaLagSeries: overview.kafkaLagSeries,
    errorRateSeries: overview.errorRateSeries,
  })
}
