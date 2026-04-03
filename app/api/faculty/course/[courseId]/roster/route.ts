import { NextResponse } from "next/server"
import { getCourseRoster } from "@/lib/unichain/service"

export async function GET(_: Request, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params
    const roster = await getCourseRoster(courseId)
    return NextResponse.json({ roster })
  } catch (error) {
    console.error("Course roster error:", error)
    return NextResponse.json({ error: "Failed to load course roster." }, { status: 500 })
  }
}
