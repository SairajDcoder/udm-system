"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { TwoFactorVerification } from "@/components/two-factor-verification"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || "user@mitaoe.ac.in"
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, email }),
        })
        
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || "Verification failed")
        }
        
        // After successful verification, redirect to dashboard based on role
        setTimeout(() => {
          switch (role) {
            case "Student": router.push("/student-portal"); break;
            case "Faculty": router.push("/faculty-portal"); break;
            case "Verifier": router.push("/verifier-portal"); break;
            case "Admin": router.push("/super-admin-portal"); break;
            default: router.push("/");
          }
        }, 500)
      }}
      onResend={async () => {
        const res = await fetch("/api/auth/send-2fa", {
          method: "POST",
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
