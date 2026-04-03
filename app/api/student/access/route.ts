import { NextRequest, NextResponse } from "next/server"
import { listStudentAccessGrants } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId") || undefined
  const grants = await listStudentAccessGrants(studentId)
  return NextResponse.json({ grants })
}
