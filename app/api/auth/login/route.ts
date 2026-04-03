import { NextRequest, NextResponse } from "next/server"
import { logSuccessfulLogin, registerUserProfile } from "@/lib/unichain/service"
import {
  AUTH_PENDING_COOKIE,
  AUTH_SESSION_COOKIE,
  PENDING_TTL_SECONDS,
  createAuthSessionToken,
} from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()
    const role = (body.role || "student") as "student" | "faculty" | "admin" | "verifier"

    if (!email || !body.password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const user = await registerUserProfile({
      email,
      role,
      fullName: body.fullName,
      department: body.department,
      programme: body.programme,
      enrollmentId: body.enrollmentId,
      joinYear: body.joinYear,
      walletAddress: body.walletAddress,
      mfaEnabled: body.mfaEnabled,
    })

    const response = NextResponse.json({
      success: true,
      user,
      mfaRequired: user.mfaEnabled,
    })

    if (user.mfaEnabled) {
      const pendingToken = await createAuthSessionToken(
        {
          sub: user.id,
          email: user.institutionalEmail,
          role: user.role,
          did: user.did,
          walletAddress: user.walletAddress,
          mfaVerified: false,
          status: "pending",
        },
        PENDING_TTL_SECONDS
      )
      response.cookies.set(AUTH_PENDING_COOKIE, pendingToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: PENDING_TTL_SECONDS,
        path: "/",
      })
      return response
    }

    await logSuccessfulLogin(email)
    const sessionToken = await createAuthSessionToken({
      sub: user.id,
      email: user.institutionalEmail,
      role: user.role,
      did: user.did,
      walletAddress: user.walletAddress,
      mfaVerified: true,
      status: "active",
    })
    response.cookies.set(AUTH_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Local login route error:", error)
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 })
  }
}
