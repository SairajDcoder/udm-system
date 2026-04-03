import { NextRequest, NextResponse } from "next/server"
import { revokeAccess } from "@/lib/unichain/service"

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const grant = await revokeAccess(body.grantId, body.studentId)
    return NextResponse.json({ grant })
  } catch (error) {
    console.error("Access revoke error:", error)
    return NextResponse.json({ error: "Failed to revoke access." }, { status: 500 })
  }
}
