"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { UniChainIcon } from "@/components/unichain-icon"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { useEffect } from "react"

const roles = ["Student", "Faculty", "Admin", "Verifier"] as const
type Role = (typeof roles)[number]

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const [selectedRole, setSelectedRole] = useState<Role>("Student")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletLoading, setIsWalletLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)

  // When wallet connects, save address to Supabase user metadata
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (!isConnected || !address) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.auth.updateUser({
        data: { wallet_address: address },
      })
      if (error) console.error("Failed to save wallet address:", error.message)
    }

    saveWalletAddress()
  }, [isConnected, address])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      triggerShake()
      setIsLoading(false)
      return
    }

    try {
      // Step 2: Send OTP email with Resend API route
      const res = await fetch("/api/auth/send-2fa", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (!res.ok) {
        const raw = await res.text()
        try {
          const data = JSON.parse(raw) as { error?: string }
          throw new Error(data.error || "Failed to send 2FA email")
        } catch {
          throw new Error(raw || "Failed to send 2FA email")
        }
      }

      // On success, go to 2FA verification
      router.push(`/verify?email=${encodeURIComponent(normalizedEmail)}&role=${selectedRole}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error sending 2FA email"
      setError(message)
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    setIsWalletLoading(true)
    try {
      await open()
    } finally {
      setIsWalletLoading(false)
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
        <UniChainIcon className="w-6 h-6" />
        <span className="text-gray-800 font-serif text-xl font-semibold">UniChain</span>
      </div>

      {/* Title */}
      <h2 className="text-gray-800 font-serif font-bold text-[28px] mb-1">
        Welcome back
      </h2>
      <p className="text-gray-600 font-sans text-[15px] mb-6">
        Sign in to your portal
      </p>

      {/* Role Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-sans font-medium transition-all duration-150",
              selectedRole === role
                ? "bg-teal-500 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:border-teal-400"
            )}
          >
            {role}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-serif font-medium text-gray-800">
            Institutional Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="you@mitaoe.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-10 rounded-md border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-sans"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-serif font-medium text-gray-800">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10 rounded-md border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-sans"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-gray-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
            />
            <label
              htmlFor="remember"
              className="text-sm font-sans text-gray-600 cursor-pointer"
            >
              Remember me
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-sans text-teal-500 hover:text-teal-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3 font-sans">
            {error}
          </div>
        )}

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-white font-sans font-semibold rounded-md transition-all duration-150 hover:-translate-y-[1px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500 font-sans">
              Or continue with
            </span>
          </div>
        </div>

        {/* Wallet Connect Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleWalletConnect}
          disabled={isWalletLoading}
          className="w-full h-11 border-teal-500 text-teal-500 hover:bg-teal-50 font-sans font-medium rounded-md transition-all duration-150"
        >
          {isWalletLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <EthereumIcon className="w-5 h-5 mr-2" />
          )}
          {isConnected
            ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
            : "Connect Wallet (DID Login)"}
        </Button>

        {/* Register Link */}
        <p className="text-center text-sm font-sans text-gray-600 mt-6">
          New user?{" "}
          <Link
            href="/register"
            className="text-teal-500 hover:text-teal-600 font-medium transition-colors"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  )
}

function EthereumIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
    </svg>
  )
}
