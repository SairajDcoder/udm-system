import { NextRequest, NextResponse } from "next/server"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"
import { listFacultyCourses, createFacultyCourse } from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const facultyId = claims?.sub
  const courses = await listFacultyCourses(facultyId)
  return NextResponse.json({ courses })
}

export async function POST(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const facultyId = claims?.sub

  if (!facultyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code, title, term, credits } = await request.json()
  
  if (!code || !title || !term || credits === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const course = await createFacultyCourse({
      facultyId,
      code,
      title,
      term,
      credits: Number(credits)
    })
    return NextResponse.json({ course })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
