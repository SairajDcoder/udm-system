import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  AUTH_PENDING_COOKIE,
  AUTH_SESSION_COOKIE,
  verifyAuthSessionToken,
} from "@/lib/auth/session"
import { logSuccessfulLogout } from "@/lib/unichain/service"

export async function POST() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value
  const pendingToken = cookieStore.get(AUTH_PENDING_COOKIE)?.value
  const session = (await verifyAuthSessionToken(sessionToken)) ?? (await verifyAuthSessionToken(pendingToken))

  if (session) {
    await logSuccessfulLogout(session.email)
  }

  cookieStore.delete(AUTH_SESSION_COOKIE)
  cookieStore.delete(AUTH_PENDING_COOKIE)
  cookieStore.delete("otp_hash")
  cookieStore.delete("otp_email")

  return NextResponse.json({ success: true })
}
