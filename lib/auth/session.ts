import type { NextRequest } from "next/server"
import type { UserRole } from "@/lib/unichain/types"

export const AUTH_SESSION_COOKIE = "unichain_auth_session"
export const AUTH_PENDING_COOKIE = "unichain_auth_pending"
export const SESSION_TTL_SECONDS = 60 * 60 * 8
export const PENDING_TTL_SECONDS = 60 * 10

export interface AuthSessionClaims {
  sub: string
  email: string
  role: UserRole
  did: string
  walletAddress: string
  mfaVerified: boolean
  status: "pending" | "active"
  iat: number
  exp: number
}

function base64UrlEncode(value: string) {
  let binary = ""
  const bytes = new TextEncoder().encode(value)
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/")
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function getSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "unichain-dev-session-secret"
  )
}

function encodeBytes(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

function decodeBytes(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/")
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false
  }

  let result = 0
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index]
  }
  return result === 0
}

async function sign(input: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input))
  return encodeBytes(new Uint8Array(signature))
}

export async function createAuthSessionToken(
  claims: Omit<AuthSessionClaims, "iat" | "exp">,
  ttlSeconds = SESSION_TTL_SECONDS
) {
  const now = Math.floor(Date.now() / 1000)
  const payload: AuthSessionClaims = {
    ...claims,
    iat: now,
    exp: now + ttlSeconds,
  }
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const signature = await sign(`${header}.${body}`)
  return `${header}.${body}.${signature}`
}

export async function verifyAuthSessionToken(token: string | undefined | null) {
  if (!token) return null

  const [header, body, signature] = token.split(".")
  if (!header || !body || !signature) return null

  const expectedSignature = await sign(`${header}.${body}`)
  if (!constantTimeEqual(decodeBytes(signature), decodeBytes(expectedSignature))) return null

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as AuthSessionClaims
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export async function getSessionClaimsFromRequest(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value
  return verifyAuthSessionToken(sessionToken)
}

function pathRoleRule(pathname: string): ReadonlyArray<UserRole> | null {
  if (pathname.startsWith("/student-portal") || pathname.startsWith("/api/student")) {
    return ["student", "admin"] as const
  }
  if (pathname.startsWith("/faculty-portal") || pathname.startsWith("/api/faculty")) {
    return ["faculty", "admin"] as const
  }
  if (pathname.startsWith("/super-admin-portal") || pathname.startsWith("/api/system")) {
    return ["admin"] as const
  }
  if (pathname.startsWith("/verifier-portal") || pathname.startsWith("/api/verifier")) {
    return ["verifier", "admin"] as const
  }
  if (pathname.startsWith("/api/access") || pathname.startsWith("/api/transfer")) {
    return ["student", "admin"] as const
  }
  if (pathname.startsWith("/api/ipfs/upload")) {
    return ["faculty", "admin"] as const
  }
  if (pathname.startsWith("/api/audit/logs") || pathname.startsWith("/api/credential/issue")) {
    return ["admin"] as const
  }
  return null
}

export async function authorizeRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify/result") ||
    pathname.startsWith("/api/credential/verify") ||
    pathname.startsWith("/api/send-reset-email")
  ) {
    return null
  }

  const allowedRoles = pathRoleRule(pathname)
  if (!allowedRoles) return null

  const claims = await getSessionClaimsFromRequest(request)
  if (!claims || !allowedRoles.includes(claims.role)) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/"
    redirectUrl.searchParams.set("redirect", pathname)
    return Response.redirect(redirectUrl)
  }

  return null
}
