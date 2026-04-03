import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_SESSION_COOKIE, verifyAuthSessionToken } from "@/lib/auth/session"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value
  const session = await verifyAuthSessionToken(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ session })
}
