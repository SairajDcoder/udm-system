"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { ValidResult } from "@/components/verifier-portal/verify/valid-result"
import { InvalidResult } from "@/components/verifier-portal/verify/invalid-result"

function VerificationResultContent() {
  const searchParams = useSearchParams()
  const hash = searchParams.get("hash") || ""
  const status = searchParams.get("status") || "invalid"

  if (status === "valid") {
    return <ValidResult hash={hash} />
  }

  return <InvalidResult hash={hash} />
}

export default function VerificationResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <VerificationResultContent />
    </Suspense>
  )
}
