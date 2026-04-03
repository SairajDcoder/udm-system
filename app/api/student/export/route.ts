import { NextRequest, NextResponse } from "next/server"
import { exportStudentData } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId") || undefined
  const exported = await exportStudentData(studentId)
  return NextResponse.json(exported)
}
