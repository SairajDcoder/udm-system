import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import {
  registerUserProfile,
  getUserByEmail,
  consumeOtpChallenge,
  logSuccessfulLogin,
} from "@/lib/unichain/service"
import type { UserRole } from "@/lib/unichain/types"
import {
  AUTH_PENDING_COOKIE,
  AUTH_SESSION_COOKIE,
  createAuthSessionToken,
  verifyAuthSessionToken,
  SESSION_TTL_SECONDS,
} from "@/lib/auth/session"
import * as speakeasy from "speakeasy"

function normalizeRole(role: unknown): UserRole {
  const normalized = String(role || "").trim().toLowerCase()
  if (normalized === "faculty" || normalized === "admin" || normalized === "verifier") {
    return normalized
  }
  return "student"
}

export async function POST(req: NextRequest) {
  try {
    const { code, email, role } = await req.json()
    const normalizedEmail = String(email || "").trim().toLowerCase()
    const normalizedRole = normalizeRole(role)
    if (!code || !normalizedEmail) {
      return NextResponse.json({ error: "Code and email required" }, { status: 400 })
    }

    const pendingToken = req.cookies.get(AUTH_PENDING_COOKIE)?.value

    const pendingSession = await verifyAuthSessionToken(pendingToken)
    const existingUser = await getUserByEmail(normalizedEmail)
    
    let isOtpValid = false
    if (existingUser && existingUser.mfaSecret) {
      isOtpValid = speakeasy.totp.verify({
        secret: existingUser.mfaSecret,
        encoding: "base32",
        token: String(code).replace(/\D/g, ""),
        window: 1,
      })
    } else {
      isOtpValid = await consumeOtpChallenge(normalizedEmail, code)
    }

    if (isOtpValid) {
      const user =
        existingUser ??
        (await registerUserProfile({
          email: normalizedEmail,
          role: normalizedRole,
          fullName: String(email || "")
            .split("@")[0]
            .replaceAll(".", " ")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()),
        }))

      const sessionUser = pendingSession
        ? {
            sub: pendingSession.sub,
            email: pendingSession.email,
            role: pendingSession.role,
            did: pendingSession.did,
            walletAddress: pendingSession.walletAddress,
          }
        : user
          ? {
              sub: user.id,
              email: user.institutionalEmail,
              role: user.role,
              did: user.did,
              walletAddress: user.walletAddress,
            }
          : {
              sub: `OTP-${createHash("sha256").update(normalizedEmail).digest("hex").slice(0, 12)}`,
              email: normalizedEmail,
              role: normalizedRole,
              did: `did:unichain:${normalizedRole}:${createHash("sha256").update(normalizedEmail).digest("hex").slice(0, 12)}`,
              walletAddress: `0x${createHash("sha256").update(`${normalizedEmail}:${normalizedRole}`).digest("hex").slice(0, 40)}`,
            }

      await logSuccessfulLogin(normalizedEmail)
      const redirectTo =
        sessionUser.role === "student"
          ? "/student-portal"
          : sessionUser.role === "faculty"
            ? "/faculty-portal"
            : sessionUser.role === "verifier"
              ? "/verifier-portal"
              : "/super-admin-portal"

      const activeToken = await createAuthSessionToken(
        {
          sub: sessionUser.sub,
          email: sessionUser.email,
          role: sessionUser.role,
          did: sessionUser.did,
          walletAddress: sessionUser.walletAddress,
          mfaVerified: true,
          status: "active",
        },
        SESSION_TTL_SECONDS
      )
      const response = NextResponse.json({ success: true, redirectTo })
      response.cookies.set("otp_hash", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
      })
      response.cookies.set("otp_email", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
      })
      response.cookies.set(AUTH_PENDING_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
      })
      response.cookies.set(AUTH_SESSION_COOKIE, activeToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_SECONDS,
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ error: "Invalid or expired 6-digit code" }, { status: 400 })
    }
  } catch (error) {
    console.error("2FA Verification Error:", error)
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 })
  }
}
