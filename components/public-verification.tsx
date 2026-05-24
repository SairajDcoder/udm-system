"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function PublicVerification() {
  const router = useRouter()
  const [hashId, setHashId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!hashId.trim()) {
      triggerShake()
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`/api/credential/verify/${encodeURIComponent(hashId.trim())}?method=hash`, {
        cache: "no-store",
      })
      const result = await response.json()
      const status = response.ok ? result.status ?? "invalid" : "invalid"
      router.push(`/verify/result?hash=${encodeURIComponent(hashId.trim())}&status=${encodeURIComponent(status)}`)
    } catch {
      router.push(`/verify/result?hash=${encodeURIComponent(hashId.trim())}&status=invalid`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "w-full max-w-[480px] bg-white rounded-xl shadow-lg p-8 animate-card-enter",
        shake && "animate-shake"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-6 h-6 text-teal-500" />
        <span className="text-gray-800 font-serif text-xl font-semibold">Verify Credential</span>
      </div>

      {/* Title */}
      <h2 className="text-gray-800 font-serif font-bold text-[28px] mb-1">
        Public Verification
      </h2>
      <p className="text-gray-600 font-sans text-[15px] mb-6">
        Instant blockchain-powered verification
      </p>

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="hash-input" className="text-[13px] font-serif font-medium text-gray-800">
            Credential Hash ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="hash-input"
              type="text"
              placeholder="0x7f83b1657ff1fc53b92dc181..."
              value={hashId}
              onChange={(e) => setHashId(e.target.value)}
              className="h-11 pl-10 rounded-md border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-gray-500 pt-1">
            Enter the unique hash ID found on the credential certificate.
          </p>
        </div>

        <Button
          type="submit"
          disabled={!hashId.trim() || isLoading}
          className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-white font-sans font-semibold rounded-md transition-all duration-150 hover:-translate-y-[1px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Verify Credential
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
