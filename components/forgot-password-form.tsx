"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export function ForgotPasswordForm() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState("")

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@")
    if (!localPart || !domain) return email
    const maskedLocal = localPart.charAt(0) + "***"
    return `${maskedLocal}@${domain}`
  }

  const sendResetEmail = async (emailAddress: string) => {
    // Step 1: Tell Supabase to generate the token & give us the reset link
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
      emailAddress,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    if (supabaseError) throw new Error(supabaseError.message)

    // Step 2: Send our custom branded email via Resend API route
    // Note: Supabase also sends its default email; to use only Resend,
    // disable the default email template in the Supabase dashboard.
    const resetLink = `${window.location.origin}/reset-password`
    const res = await fetch("/api/send-reset-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailAddress, resetLink }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Failed to send email")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setError("")
    setIsLoading(true)

    try {
      await sendResetEmail(email)
      setIsSubmitted(true)
      startResendCooldown()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError("")
    setIsLoading(true)
    try {
      await sendResetEmail(email)
      startResendCooldown()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="animate-fade-slide-up border-0 shadow-xl rounded-xl">
        <CardContent className="p-8 text-center">
          {/* Animated Envelope SVG */}
          <div className="mb-6 flex justify-center">
            <div className="animate-envelope-fly">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="8"
                  y="20"
                  width="64"
                  height="44"
                  rx="4"
                  fill="#0E8A7E"
                  fillOpacity="0.1"
                  stroke="#0E8A7E"
                  strokeWidth="2"
                />
                <path
                  d="M8 24L40 44L72 24"
                  stroke="#0E8A7E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 8L40 20"
                  stroke="#14B5A5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
                <circle cx="40" cy="6" r="3" fill="#14B5A5" />
                <path
                  d="M32 14L40 8L48 14"
                  stroke="#14B5A5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0A1628] mb-3">
            Check your email
          </h2>
          <p className="text-[#5C667A] text-[15px] mb-6 leading-relaxed">
            We&apos;ve sent a reset link to{" "}
            <span className="font-medium text-[#2E3748]">{maskEmail(email)}</span>.
            <br />
            Link expires in 15 minutes.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <div className="text-sm text-[#5C667A]">
            Didn&apos;t receive it?{" "}
            {resendCooldown > 0 ? (
              <span className="text-[#5C667A]">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-[#0E8A7E] hover:text-[#14B5A5] font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Resend"}
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#0E8A7E] hover:text-[#14B5A5] text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-card-enter border-0 shadow-xl rounded-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-[26px] font-bold text-[#0A1628] mb-2">
            Reset your password
          </h1>
          <p className="text-[#5C667A] text-[15px]">
            Enter your institutional email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#2E3748]"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C667A]" />
              <Input
                id="email"
                type="email"
                placeholder="you@mitaoe.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10 bg-white border-gray-200 focus:border-[#0E8A7E] focus:ring-[#0E8A7E] rounded-lg text-[#0A1628] placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full h-11 bg-[#0E8A7E] hover:bg-[#14B5A5] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#0E8A7E] hover:text-[#14B5A5] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
