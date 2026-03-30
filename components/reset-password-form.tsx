"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const requirementsMet = useMemo(() => {
    return passwordRequirements.map((req) => req.test(password))
  }, [password])

  const strength = useMemo(() => {
    const metCount = requirementsMet.filter(Boolean).length
    if (metCount === 0) return { level: 0, label: "", color: "" }
    if (metCount === 1) return { level: 1, label: "Weak", color: "bg-red-500" }
    if (metCount === 2) return { level: 2, label: "Fair", color: "bg-orange-500" }
    if (metCount === 3) return { level: 3, label: "Good", color: "bg-yellow-500" }
    return { level: 4, label: "Strong", color: "bg-green-500" }
  }, [requirementsMet])

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordsMismatch = confirmPassword && password !== confirmPassword
  const allRequirementsMet = requirementsMet.every(Boolean)
  const canSubmit = allRequirementsMet && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setError("")
    setIsLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setIsSuccess(true)
  }

  // Auto-redirect after success
  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        router.push("/")
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [isSuccess, router])

  if (isSuccess) {
    return (
      <Card className="animate-fade-slide-up border-0 shadow-xl rounded-xl overflow-hidden">
        <CardContent className="p-8 text-center">
          {/* Animated Checkmark Circle */}
          <div className="mb-6 flex justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#0E8A7E"
                strokeWidth="3"
                fill="none"
                className="animate-checkmark-circle-draw"
              />
              <path
                d="M24 40L35 51L56 30"
                stroke="#0E8A7E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="animate-checkmark-draw"
              />
            </svg>
          </div>

          <h2 className="font-serif text-[22px] font-bold text-[#0A1628] mb-3">
            Password reset successful!
          </h2>
          <p className="text-[#5C667A] text-[15px]">
            Redirecting to login...
          </p>
        </CardContent>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#0E8A7E] animate-progress-bar" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="animate-card-enter border-0 shadow-xl rounded-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-[26px] font-bold text-[#0A1628] mb-2">
            Create new password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#2E3748]"
            >
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10 bg-white border-gray-200 focus:border-[#0E8A7E] focus:ring-[#0E8A7E] rounded-lg text-[#0A1628] placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C667A] hover:text-[#2E3748] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Strength Meter */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                        level <= strength.level
                          ? strength.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p
                    className={`text-xs font-medium ${
                      strength.level === 1
                        ? "text-red-500"
                        : strength.level === 2
                        ? "text-orange-500"
                        : strength.level === 3
                        ? "text-yellow-600"
                        : "text-green-500"
                    }`}
                  >
                    {strength.label}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#2E3748]"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-11 pr-16 bg-white border-gray-200 focus:border-[#0E8A7E] focus:ring-[#0E8A7E] rounded-lg text-[#0A1628] placeholder:text-gray-400 ${
                  passwordsMismatch ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                } ${passwordsMatch ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}`}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {passwordsMatch && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {passwordsMismatch && (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#5C667A] hover:text-[#2E3748] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-[#5C667A] mb-2">
              Password requirements:
            </p>
            {passwordRequirements.map((req, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                  requirementsMet[index] ? "text-green-600" : "text-[#5C667A]"
                }`}
              >
                {requirementsMet[index] ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
                {req.label}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full h-11 bg-[#0E8A7E] hover:bg-[#14B5A5] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
