import { NextResponse } from "next/server"
import { getAdminWorkspace } from "@/lib/unichain/service"

export async function GET() {
  const workspace = await getAdminWorkspace()
  const latestAuditDate = workspace.auditLogs[0]?.createdAt ?? null
  const failedSecurityEvents = workspace.auditLogs.filter((log) =>
    log.action.includes("invalid") || log.action.includes("revoked")
  ).length

  return NextResponse.json({
    latestAuditDate,
    totalAuditEvents: workspace.auditLogs.length,
    failedSecurityEvents,
    recentAuditLogs: workspace.auditLogs.slice(0, 20),
  })
}
