import { NextRequest, NextResponse } from "next/server"
import { submitGrades } from "@/lib/unichain/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await submitGrades({
      facultyId: body.facultyId,
      courseId: body.courseId,
      term: body.term,
      grades: Array.isArray(body.grades) ? body.grades : [],
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Grade submission error:", error)
    return NextResponse.json({ error: "Failed to submit grades." }, { status: 500 })
  }
}
