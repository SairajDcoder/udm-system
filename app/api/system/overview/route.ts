import { NextResponse } from "next/server"
import { getSystemOverview } from "@/lib/unichain/service"

export async function GET() {
  const data = await getSystemOverview()
  return NextResponse.json(data)
}
