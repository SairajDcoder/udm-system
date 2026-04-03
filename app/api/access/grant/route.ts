import { NextRequest, NextResponse } from "next/server"
import { grantAccess } from "@/lib/unichain/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const grant = await grantAccess({
      studentId: body.studentId,
      verifierEmail: body.verifierEmail,
      verifierName: body.verifierName,
      verifierType: body.verifierType,
      recordType: body.recordType,
      expiryDays: Number(body.expiryDays || 30),
    })

    return NextResponse.json({ grant })
  } catch (error) {
    console.error("Access grant error:", error)
    return NextResponse.json({ error: "Failed to grant access." }, { status: 500 })
  }
}
