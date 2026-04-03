import { NextRequest, NextResponse } from "next/server"
import { listStudentCredentials } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId") || undefined
  const credentials = await listStudentCredentials(studentId)
  return NextResponse.json({ credentials })
}
