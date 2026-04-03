import { NextResponse } from "next/server"
import { listAuditLogs } from "@/lib/unichain/service"

export async function GET() {
  const logs = await listAuditLogs()
  return NextResponse.json({ logs })
}
