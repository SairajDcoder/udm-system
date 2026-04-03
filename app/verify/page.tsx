"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { TwoFactorVerification } from "@/components/two-factor-verification"

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = (searchParams.get("email") || "user@mitaoe.ac.in").trim().toLowerCase()
  const role = searchParams.get("role") || "Student"
  
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@")
    if (!localPart || !domain) return email
    const maskedLocal = localPart.charAt(0) + "***"
    return `${maskedLocal}@${domain}`
  }

  return (
    <TwoFactorVerification 
      maskedEmail={maskEmail(email)}
      onVerify={async (code) => {
        const res = await fetch("/api/auth/verify-2fa", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, email, role }),
        })
        
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || "Verification failed")
        }
        
        const fallbackRedirect =
          role === "Student"
            ? "/student-portal"
            : role === "Faculty"
              ? "/faculty-portal"
              : role === "Verifier"
                ? "/verifier-portal"
                : role === "Admin"
                  ? "/super-admin-portal"
                  : "/"

        window.location.replace(data.redirectTo || fallbackRedirect)
      }}
      onResend={async () => {
        const res = await fetch("/api/auth/send-2fa", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to resend email")
        }
      }}
    />
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial teal glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(14, 138, 126, 0.1) 0%, transparent 600px)'
        }}
      />
      
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
