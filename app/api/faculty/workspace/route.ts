import { NextRequest, NextResponse } from "next/server"
import { getFacultyWorkspace } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const facultyId = request.nextUrl.searchParams.get("facultyId") || undefined
  const workspace = await getFacultyWorkspace(facultyId)
  return NextResponse.json(workspace)
}
