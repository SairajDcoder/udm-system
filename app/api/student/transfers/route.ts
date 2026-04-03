import { NextRequest, NextResponse } from "next/server"
import { listStudentTransfers } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId") || undefined
  const transfers = await listStudentTransfers(studentId)
  return NextResponse.json({ transfers })
}
