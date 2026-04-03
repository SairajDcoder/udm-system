import { NextRequest, NextResponse } from "next/server"
import { getStudentAcademics } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId") || undefined
  const academics = await getStudentAcademics(studentId)
  return NextResponse.json(academics)
}
