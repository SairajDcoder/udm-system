"use client"

import { useEffect, useState } from "react"
import type { AuthSessionClaims } from "@/lib/auth/session"

export function useUserSession() {
  const [session, setSession] = useState<AuthSessionClaims | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized")
        return (await res.json()) as { session: AuthSessionClaims }
      })
      .then((data) => {
        if (mounted) {
          setSession(data.session)
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setSession(null)
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return { session, loading }
}
