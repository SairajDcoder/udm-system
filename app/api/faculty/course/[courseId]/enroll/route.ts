import { NextRequest, NextResponse } from "next/server"
import { enrollStudentsInCourse } from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function POST(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const claims = await getSessionClaimsFromRequest(request)
  const facultyId = claims?.sub

  if (!facultyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { studentIds } = await request.json()
  
  if (!studentIds || !Array.isArray(studentIds)) {
    return NextResponse.json({ error: "Invalid studentIds array" }, { status: 400 })
  }

  try {
    const course = await enrollStudentsInCourse({
      facultyId,
      courseId: params.courseId,
      studentIds
    })
    return NextResponse.json({ course })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
