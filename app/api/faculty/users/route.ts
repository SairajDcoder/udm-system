import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { listFacultyUsers, registerUserProfile } from "@/lib/unichain/service"

export async function GET() {
  const users = await listFacultyUsers()
  return NextResponse.json({ users })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "").trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const role = body.role === "faculty" || body.role === "admin" || body.role === "student" || body.role === "verifier"
      ? body.role
      : "faculty"
    const user = await registerUserProfile({
      email,
      role,
      fullName: body.fullName ? String(body.fullName) : undefined,
      department: body.department ? String(body.department) : undefined,
      programme: body.programme ? String(body.programme) : undefined,
      joinYear: body.joinYear ? String(body.joinYear) : undefined,
      mfaEnabled: body.mfaEnabled !== false,
    })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 })
  }
}
